const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token and saves it in a secure HttpOnly cookie
 * @param {Object} res - Express response object
 * @param {string} userId - ID of the authenticated user
 * @returns {string} Signed JWT token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });

  // Set JWT in HTTP-Only Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' requires secure: true
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
