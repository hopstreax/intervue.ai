const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const Analytics = require('../models/Analytics');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Helper — find or create a user from an OAuth profile.
 * If the email already exists (email/password account), we link the OAuth ID to it.
 */
const findOrCreateOAuthUser = async ({ provider, providerId, email, name, avatar }) => {
  const idField = provider === 'google' ? 'googleId' : 'githubId';

  // 1. Try to find by OAuth provider ID first (fastest path)
  let user = await User.findOne({ [idField]: providerId });
  if (user) return user;

  // 2. Try to find by email (link OAuth to existing email/password account)
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user[idField] = providerId;
      if (!user.avatar && avatar) user.avatar = avatar;
      if (user.provider === 'local') user.provider = provider;
      await user.save();
      return user;
    }
  }

  // 3. Create a brand-new OAuth user
  user = await User.create({
    name,
    email,
    [idField]: providerId,
    avatar,
    provider,
    // No password — OAuth users authenticate via the provider
  });

  // Initialize empty analytics for new user
  await Analytics.create({ userId: user._id });

  return user;
};

// ── Google Strategy ───────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;
        const avatar = profile.photos?.[0]?.value || null;

        const user = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email,
          name: profile.displayName,
          avatar,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ── GitHub Strategy ───────────────────────────────────────────
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub may return multiple emails; pick the primary one
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value ||
          null;
        const avatar = profile.photos?.[0]?.value || null;

        const user = await findOrCreateOAuthUser({
          provider: 'github',
          providerId: String(profile.id),
          email,
          name: profile.displayName || profile.username,
          avatar,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ── Serialize / Deserialize (needed by Passport even without sessions) ──
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
