const Response = require('../models/Response');
const Analytics = require('../models/Analytics');

/**
 * POST /api/evaluate
 * Evaluate a user's answer to an interview question.
 * Saves the response, score, and feedback to MongoDB.
 * Updates the user's analytics document.
 */
const evaluate = async (req, res, next) => {
  try {
    const { interviewId, question, answer } = req.body;

    if (!interviewId || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'interviewId, question, and answer are all required',
      });
    }

    // ── TODO: Replace with real Gemini API call ────────────────
    // const prompt = `Evaluate this interview answer...`;
    // const result = await model.generateContent(prompt);
    // const { score, feedback } = parseEvaluation(result.response.text());

    // Placeholder evaluation for development
    const score = Math.round((Math.random() * 4 + 6) * 10) / 10; // 6.0–10.0
    const feedback =
      'Good answer! Consider adding more specific examples and metrics ' +
      'to strengthen your response. Focus on quantifiable achievements.';

    // Save response document
    const responseDoc = await Response.create({
      interviewId,
      question,
      answer,
      score,
      feedback,
    });

    // ── Update Analytics ──────────────────────────────────────
    const analytics = await Analytics.findOne({ userId: req.user._id });
    if (analytics) {
      analytics.totalResponses += 1;
      analytics.progress.push({ date: new Date(), score });

      // Recalculate average score from progress history
      const totalScore = analytics.progress.reduce((sum, p) => sum + p.score, 0);
      analytics.averageScore =
        Math.round((totalScore / analytics.progress.length) * 10) / 10;

      // Track weak areas (scores below 7)
      if (score < 7) {
        const topic = question.substring(0, 50);
        if (!analytics.weakAreas.includes(topic)) {
          analytics.weakAreas.push(topic);
        }
      }

      await analytics.save();
    }

    res.status(201).json({
      success: true,
      data: {
        _id: responseDoc._id,
        question: responseDoc.question,
        answer: responseDoc.answer,
        score: responseDoc.score,
        feedback: responseDoc.feedback,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { evaluate };
