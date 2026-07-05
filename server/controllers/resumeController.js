const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { getEngine } = require('../utils/ai');

// ── Multer Configuration ─────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Timestamp-based unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `resume-${timestamp}${ext}`);
  },
});

// Accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// ── Helper: Clean extracted text ─────────────────────────────

/**
 * Sanitize and normalize raw text extracted from a PDF.
 * Removes excessive whitespace, control chars, and trims output.
 */
const cleanText = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .replace(/\r\n/g, '\n')          // normalize line endings
    .replace(/[ \t]+/g, ' ')         // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')      // collapse excessive newlines to max 2
    .trim()
    .substring(0, 50000);            // cap at 50K chars
};

// ── POST /api/resume/upload ──────────────────────────────────

/**
 * Upload a PDF resume, extract text via pdf-parse, store metadata
 * and extracted text in MongoDB. File is stored on disk.
 *
 * Body (form-data):
 *   - resume: PDF file
 *   - userId: MongoDB ObjectId of the user
 *
 * Returns: { message, extractedText, filePath }
 */
const uploadResume = async (req, res, next) => {
  try {
    // Validate file was received
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a PDF resume.',
      });
    }

    // Get userId from body or from auth middleware
    const userId = req.body.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    // Relative path for storage (not absolute — keeps it portable)
    const filePath = `uploads/${req.file.filename}`;

    // Create initial resume document (status: pending)
    const resume = await Resume.create({
      userId,
      originalName: req.file.originalname,
      filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      parsingStatus: 'pending',
    });

    // ── Extract text from PDF ──────────────────────────────
    let extractedText = '';
    let sections = { education: '', skills: '', projects: '', internships: '', extracurriculars: '' };

    try {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = cleanText(pdfData.text);

      // Call the selected AI engine to parse into structured sections
      const model = req.body.model || 'gemini';
      const engine = getEngine(model);
      sections = await engine.parseResume(extractedText);

      // Update resume doc with extracted text and structured sections
      resume.extractedText = extractedText;
      resume.sections = {
        education: sections.education || '',
        skills: sections.skills || '',
        projects: sections.projects || '',
        internships: sections.internships || sections.experience || '',
        extracurriculars: sections.extracurriculars || '',
      };
      resume.parsingStatus = 'success';
    } catch (parseError) {
      console.error('PDF parsing/Gemini error:', parseError.message);
      resume.parsingStatus = 'failed';
      resume.parsingError = parseError.message;
    }

    await resume.save();

    // ── Return response ────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      extractedText,
      filePath,
      parsingStatus: resume.parsingStatus,
      resumeId: resume._id,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/resume/:userId ──────────────────────────────────

/**
 * Get all resumes for a user, sorted newest first.
 */
const getUserResumes = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?._id;
    const resumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .select('-extractedText') // exclude large text field in list view
      .lean();

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/resume/detail/:id ───────────────────────────────

/**
 * Get a single resume with full extracted text.
 */
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadResume, getUserResumes, getResumeById };
