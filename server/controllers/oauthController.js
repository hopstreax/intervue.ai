const jwt = require('jsonwebtoken');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Generate a signed JWT for a given user ID.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * OAuth callback handler — called by Passport after a successful provider auth.
 * Generates a JWT and redirects to the frontend /oauth/callback page with:
 *   - token: JWT
 *   - user: JSON-encoded user object (url-encoded)
 *
 * The frontend reads these query params, stores them in localStorage,
 * and redirects to /dashboard.
 */
const oauthCallback = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    const token = generateToken(user._id);

    const userData = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        provider: user.provider,
      })
    );

    // Redirect to frontend with token + user data in query string
    res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}&user=${userData}`);
  } catch (err) {
    console.error('[OAuth Callback Error]', err.message);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_error`);
  }
};

/**
 * Handle OAuth errors (user denied access, etc.)
 */
const oauthFailure = (req, res) => {
  const error = req.query.error || 'access_denied';
  res.redirect(`${FRONTEND_URL}/login?error=${error}`);
};

module.exports = { oauthCallback, oauthFailure };
