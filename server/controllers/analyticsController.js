const Analytics = require('../models/Analytics');
const Response = require('../models/Response');
const Interview = require('../models/Interview');

/**
 * GET /api/analytics
 * Returns the authenticated user's analytics dashboard data.
 * Includes aggregated stats computed via MongoDB aggregation.
 */
const getAnalytics = async (req, res, next) => {
  try {
    // Fetch the user's analytics document
    const analytics = await Analytics.findOne({ userId: req.user._id }).lean();

    if (!analytics) {
      return res.json({
        success: true,
        data: {
          averageScore: 0,
          totalInterviews: 0,
          totalResponses: 0,
          weakAreas: [],
          progress: [],
          recentScores: [],
        },
      });
    }

    // ── Aggregation: count interviews for this user ───────────
    const interviewCount = await Interview.countDocuments({
      userId: req.user._id,
    });

    // ── Aggregation: score distribution ───────────────────────
    const interviewIds = await Interview.find({ userId: req.user._id })
      .select('_id')
      .lean();
    const ids = interviewIds.map((i) => i._id);

    const scoreDistribution = await Response.aggregate([
      { $match: { interviewId: { $in: ids } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          count: { $sum: 1 },
        },
      },
    ]);

    // ── Recent 10 scores for the progress chart ──────────────
    const recentScores = analytics.progress
      .slice(-10)
      .map((p) => ({ date: p.date, score: p.score }));

    res.json({
      success: true,
      data: {
        averageScore: analytics.averageScore,
        totalInterviews: interviewCount,
        totalResponses: analytics.totalResponses,
        weakAreas: analytics.weakAreas,
        progress: recentScores,
        scoreDistribution: scoreDistribution[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
