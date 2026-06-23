const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Resume Parser Utility
 *
 * Extracts structured sections from raw resume text:
 *   - education, skills, projects, internships, extracurriculars
 *
 * Uses section-header detection to split the resume into logical parts.
 * Designed to work with most common resume formats.
 */

// ── Section header patterns ──────────────────────────────────
// Each entry: [regex to match the header, key name]
const SECTION_PATTERNS = [
  { key: 'education',        regex: /\b(education|academic\s*background|qualification|degree)\b/i },
  { key: 'skills',           regex: /\b(skills|technical\s*skills|core\s*competenc|technologies|proficienc)/i },
  { key: 'projects',         regex: /\b(projects|personal\s*projects|academic\s*projects|key\s*projects)\b/i },
  { key: 'internships',      regex: /\b(internship|work\s*experience|experience|professional\s*experience|employment)\b/i },
  { key: 'extracurriculars', regex: /\b(extracurricular|extra[\s-]*curricular|activities|achievements|awards|certifications|volunteer|leadership)\b/i },
];

/**
 * Clean raw PDF text — remove control chars, normalize whitespace.
 */
const cleanText = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 50000);
};

/**
 * Detect section boundaries in the resume text.
 * Returns an array of { key, startIndex } sorted by position.
 */
const detectSections = (text) => {
  const lines = text.split('\n');
  const sections = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Skip very long lines — headers are typically short
    if (trimmed.length > 80) return;

    for (const { key, regex } of SECTION_PATTERNS) {
      if (regex.test(trimmed)) {
        // Avoid duplicate section detections
        if (!sections.find((s) => s.key === key)) {
          sections.push({ key, lineIndex: idx });
        }
        break;
      }
    }
  });

  return sections.sort((a, b) => a.lineIndex - b.lineIndex);
};

/**
 * Extract structured sections from resume text.
 *
 * @param {string} text - Cleaned resume text
 * @returns {Object} - { education, skills, projects, internships, extracurriculars }
 */
const extractSections = (text) => {
  const result = {
    education: '',
    skills: '',
    projects: '',
    internships: '',
    extracurriculars: '',
  };

  const lines = text.split('\n');
  const sections = detectSections(text);

  if (sections.length === 0) {
    // If no sections detected, return the full text as-is under a generic key
    return result;
  }

  // Extract content between each detected section header
  for (let i = 0; i < sections.length; i++) {
    const startLine = sections[i].lineIndex + 1; // skip the header line itself
    const endLine = i + 1 < sections.length ? sections[i + 1].lineIndex : lines.length;

    const content = lines
      .slice(startLine, endLine)
      .join('\n')
      .trim();

    result[sections[i].key] = content;
  }

  return result;
};

/**
 * Parse a PDF file and extract both raw text and structured sections.
 *
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Object} - { rawText, sections: { education, skills, projects, internships, extracurriculars } }
 */
const parseResume = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = cleanText(pdfData.text);
  const sections = extractSections(rawText);

  return { rawText, sections };
};

module.exports = { parseResume, extractSections, cleanText };
