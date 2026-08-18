const { OAuth2Client } = require('google-auth-library');

// We initialize OAuth2Client with client ID, secret, and the backend callback redirect URL.
const getOAuthClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL // e.g., http://localhost:5000/api/auth/google/callback
  );
};

/**
 * Generates Google Consent Screen URL
 * @returns {string} URL to redirect the user to
 */
const getAuthUrl = () => {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
  });
};

/**
 * Exchanges authorization code for user info by verifying Google ID Token
 * @param {string} code - Google auth code received in callback
 * @returns {Object} User profile (googleId, email, name)
 */
const getUserInfoFromCode = async (code) => {
  const client = getOAuthClient();
  
  // Exchange code for tokens
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Verify the ID Token
  const idToken = tokens.id_token;
  if (!idToken) {
    throw new Error('No Google ID Token found in token response');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    email_verified: payload.email_verified,
  };
};

module.exports = {
  getAuthUrl,
  getUserInfoFromCode,
};
