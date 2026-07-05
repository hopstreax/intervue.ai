const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { getEngine } = require('../utils/ai');

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
    const model = req.body.model || 'gemini'; // 'gemini' or 'gpt'
    const engine = getEngine(model);
    console.log(`\n[Backend] \u2192 Starting interview for User ID: ${userId} using ${engine.name}`);

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
      role: 'Software Engineer',
      model,
      history: [],
      status: 'active'
    });
    console.log(`[Backend] Created new Interview DB document: ${interview._id} (model: ${model})`);

    const systemPrompt = buildSystemPrompt(resume);

    // Initial message to generate greeting + first question
    const initialPrompt = [
      { role: 'user', content: 'Begin the interview. Welcome me based on my skills and ask the first behavioral or technical question.' }
    ];

    console.log(`[Backend] Dispatching initial prompt request to ${engine.name}...`);
    const t0 = Date.now();
    const rawResponse = await engine.generateChatResponse(initialPrompt, systemPrompt);
    console.log(`[Backend] \u2714 Received response from ${engine.name} in ${Date.now() - t0}ms`);
    
    const { feedback, question } = parseAiOutput(rawResponse);
    console.log(`[Backend] Parsed Gemini output -> Feedback: "${feedback}", Question: "${question}"`);

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

    // ── Check Tier Limits ─────────────────────────────────────────
    const userDoc = await User.findById(interview.userId);
    if (userDoc && userDoc.tier === 'free') {
      const userMsgCount = interview.history.filter(msg => msg.role === 'user').length;
      if (userMsgCount >= 3) {
        return res.status(403).json({
          success: false,
          limitReached: true,
          message: 'You have reached the free tier limit of 3 questions. Please upgrade to Premium to continue!'
        });
      }
    }

    // Push user message to DB
    interview.history.push({
      role: 'user',
      content: message
    });

    const resume = await Resume.findOne({ userId: interview.userId }).sort({ createdAt: -1 }).lean();
    const systemPrompt = buildSystemPrompt(resume);

    // Build history for API
    const contextHistory = interview.history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call the AI engine associated with this interview
    const engine = getEngine(interview.model || 'gemini');
    const rawResponse = await engine.generateChatResponse(contextHistory, systemPrompt);
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

/**
 * ── POST /api/interviews/end ──────────────────────────────────
 * End the interview and run Gemini performance analysis evaluation.
 */
const endInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'interviewId is required' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    interview.status = 'completed';

    const engine = getEngine(interview.model || 'gemini');
    console.log(`[Backend] Dispatching evaluation request to ${engine.name} for Interview ID: ${interviewId}...`);
    const evaluation = await engine.evaluateInterview(interview.history, interview.role);
    console.log(`[Backend] \u2714 Received evaluation results from ${engine.name} successfully.`);

    interview.evaluation = evaluation;
    await interview.save();

    // ── Update Analytics ──────────────────────────────────────
    const analytics = await Analytics.findOne({ userId: req.user._id });
    if (analytics) {
      analytics.totalInterviews += 1;
      analytics.totalResponses += interview.history.filter(m => m.role === 'user').length;
      
      const score = evaluation.overallScore || 70;
      analytics.progress.push({ date: new Date(), score: score / 10 }); // map 0-100 to 0-10

      // Recalculate average score
      const totalScore = analytics.progress.reduce((sum, p) => sum + p.score, 0);
      analytics.averageScore = Math.round((totalScore / analytics.progress.length) * 10) / 10;

      // Track weak areas
      if (evaluation.weaknesses && evaluation.weaknesses.length > 0) {
        evaluation.weaknesses.forEach(w => {
          if (!analytics.weakAreas.includes(w) && analytics.weakAreas.length < 10) {
            analytics.weakAreas.push(w);
          }
        });
      }

      await analytics.save();
    }

    res.status(200).json({
      success: true,
      message: 'Interview ended and evaluated successfully',
      data: evaluation
    });

  } catch (error) {
    next(error);
  }
};

/**
 * ── GET /api/interviews/summary ──────────────────────────────
 * Fetch summary analysis of the latest completed interview or specific ID.
 */
const getInterviewSummary = async (req, res, next) => {
  try {
    const { interviewId } = req.query;
    let interview;

    if (interviewId) {
      interview = await Interview.findById(interviewId);
    } else {
      // Find the latest completed interview for the user
      interview = await Interview.findOne({
        userId: req.user._id,
        status: 'completed'
      }).sort({ createdAt: -1 });
    }

    if (!interview || !interview.evaluation) {
      return res.status(404).json({
        success: false,
        message: 'No completed interview evaluation found'
      });
    }

    res.status(200).json({
      success: true,
      data: interview.evaluation,
      role: interview.role,
      createdAt: interview.createdAt
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  chatInterview,
  endInterview,
  getInterviewSummary
};
