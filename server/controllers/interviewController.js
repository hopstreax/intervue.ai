const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Analytics = require('../models/Analytics');
const { generateLlamaResponse } = require('../utils/huggingface');

/**
 * Helper to build the master system prompt
 */
const buildSystemPrompt = (resume) => {
  const resumeContext = resume && resume.sections
    ? `
Education: ${resume.sections.education || 'Not provided'}
Skills: ${resume.sections.skills || 'Not provided'}
Projects: ${resume.sections.projects || 'Not provided'}
Experience: ${resume.sections.internships || 'Not provided'}
    `.trim()
    : 'No resume provided. Ask general technical questions.';

  return `
You are an expert technical AI interviewer. 
Conduct a professional and conversational job interview.
Base your questions exclusively on the candidate's resume context below.

Candidate Resume Context:
${resumeContext}

# CRITICAL RULES:
1. Ask exactly ONE question at a time.
2. Adjust the difficulty based on the candidate's answers.
3. Every time the user responds, provide a VERY SHORT feedback (1-2 sentences) on their answer, then ask the next question.
4. If it's the very first message, do not evaluate anything — just welcome them based on their profile and ask the first question.
5. Provide your output STRICTLY in the following exact format:

Feedback: [Your short evaluation of their answer]
Next Question: [Your single next question]

If you fail to use this exact format, the system will break.
`.trim();
};

/**
 * Extract feedback and next question from AI response text
 */
const parseAiOutput = (text) => {
  let feedback = '';
  let question = text; // fallback if regex fails

  const feedbackMatch = text.match(/Feedback:\s*(.*)/i);
  const questionMatch = text.match(/Next Question:\s*([\s\S]*)/i);

  if (feedbackMatch && questionMatch) {
    feedback = feedbackMatch[1].trim();
    question = questionMatch[1].trim();
  } else if (feedbackMatch) {
    feedback = feedbackMatch[1].trim();
    question = text.replace(/Feedback:\s*(.*)/i, '').trim();
  } else if (questionMatch) {
    question = questionMatch[1].trim();
  }

  return { feedback, question };
};

/**
 * ── POST /api/interviews/start ──────────────────────────────────
 * Initialize an interview session, get contextual first greeting
 */
const startInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(`\n[Backend] \u2192 Starting intervew for User ID: ${userId}`);

    // Get the most recent resume
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 }).lean();
    if (resume) {
      console.log(`[Backend] Found latest resume from: ${resume.createdAt}`);
    } else {
      console.log(`[Backend] No resume found for user. Will proceed with generic system prompt.`);
    }

    // Create the interview doc
    const interview = await Interview.create({
      userId,
      role: 'Software Engineer', // Defaulting for now
      history: [],
      status: 'active'
    });
    console.log(`[Backend] Created new Interview DB document: ${interview._id}`);

    const systemPrompt = buildSystemPrompt(resume);

    // Initial message to generate greeting + first question
    const initialPrompt = [
      { role: 'user', content: 'Begin the interview. Welcome me based on my skills and ask the first behavioral or technical question.' }
    ];

    console.log(`[Backend] Dispatching initial prompt request to LLaMA Engine via Hugging Face...`);
    const t0 = Date.now();
    const rawResponse = await generateLlamaResponse(initialPrompt, systemPrompt);
    console.log(`[Backend] \u2714 Received response from LLaMA in ${Date.now() - t0}ms`);
    
    const { feedback, question } = parseAiOutput(rawResponse);
    console.log(`[Backend] Parsed LLaMA output -> Feedback: "${feedback}", Question: "${question}"`);

    const firstAiMessage = question || rawResponse;

    // Push AI message to history
    interview.history.push({
      role: 'assistant',
      content: firstAiMessage,
      feedback: feedback
    });
    
    await interview.save();
    console.log(`[Backend] Session state saved. Returning agent_ready signal successful.`);

    res.status(200).json({
      success: true,
      data: {
        interviewId: interview._id,
        history: interview.history
      }
    });
  } catch (error) {
    console.error(`[Backend] \u2716 FAILURE during startInterview flow:`, error);
    next(error);
  }
};

/**
 * ── POST /api/interviews/chat ──────────────────────────────────
 * Handle an ongoing interview message
 */
const chatInterview = async (req, res, next) => {
  try {
    const { interviewId, message } = req.body;

    if (!interviewId || !message) {
      return res.status(400).json({ success: false, message: 'interviewId and message required' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Push user message to DB
    interview.history.push({
      role: 'user',
      content: message
    });

    const resume = await Resume.findOne({ userId: interview.userId }).sort({ createdAt: -1 }).lean();
    const systemPrompt = buildSystemPrompt(resume);

    // Build history for API
    // We only send the last 10 messages to avoid token bloat
    const contextHistory = interview.history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call LLM
    const rawResponse = await generateLlamaResponse(contextHistory, systemPrompt);
    const { feedback, question } = parseAiOutput(rawResponse);

    // Simple heuristc performance tracking logic
    // Real-world would use a classifier or distinct prompt for metric scoring
    const isGood = feedback.toLowerCase().includes('good') || feedback.toLowerCase().includes('well') || feedback.toLowerCase().includes('correct') || feedback.toLowerCase().includes('great');
    if (isGood) {
      interview.performanceMetrics.accuracy += 5;
      interview.performanceMetrics.clarity += 5;
    }
    interview.performanceMetrics.questionsAnswered += 1;

    // Push AI response
    interview.history.push({
      role: 'assistant',
      content: question,
      feedback: feedback
    });

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        reply: question,
        feedback: feedback,
        metrics: interview.performanceMetrics,
        history: interview.history
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { startInterview, chatInterview };
