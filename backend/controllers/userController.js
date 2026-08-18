/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

module.exports = {
  getMe,
};
