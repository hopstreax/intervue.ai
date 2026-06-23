const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const Resume = require('../models/Resume');
const { parseResume } = require('../utils/resumeParser');

/**
 * Generate a signed JWT for a given user ID.
 * Token expires in 7 days.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── POST /api/auth/signup ────────────────────────────────────
/**
 * Register a new user. Optionally accepts a PDF resume via multer.
 * If a resume is attached, it is parsed and structured sections
 * (education, skills, projects, internships, extracurriculars) are extracted.
 *
 * Body (form-data):
 *   - name, email, password (text fields)
 *   - resume (file, optional, PDF only)
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Validate required fields ─────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    // ── Check if user already exists ─────────────────────────
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // ── Create user ──────────────────────────────────────────
    const user = await User.create({ name, email, password });

    // Initialize empty analytics document
    await Analytics.create({ userId: user._id });

    // ── Process resume if uploaded ───────────────────────────
    let resumeData = null;
    if (req.file) {
      const filePath = `uploads/${req.file.filename}`;

      // Create resume doc (status: pending)
      const resumeDoc = await Resume.create({
        userId: user._id,
        originalName: req.file.originalname,
        filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        parsingStatus: 'pending',
      });

      try {
        // Parse PDF and extract structured sections
        const { rawText, sections } = await parseResume(req.file.path);

        resumeDoc.extractedText = rawText;
        resumeDoc.sections = sections;
        resumeDoc.parsingStatus = 'success';
        await resumeDoc.save();

        resumeData = {
          resumeId: resumeDoc._id,
          filePath,
          parsingStatus: 'success',
          sections,
        };
      } catch (parseError) {
        console.error('Resume parsing error during signup:', parseError.message);
        resumeDoc.parsingStatus = 'failed';
        resumeDoc.parsingError = parseError.message;
        await resumeDoc.save();

        resumeData = {
          resumeId: resumeDoc._id,
          filePath,
          parsingStatus: 'failed',
          error: parseError.message,
        };
      }
    }

    // ── Return response ──────────────────────────────────────
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
      resume: resumeData,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
