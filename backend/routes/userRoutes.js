const express = require('express');
const { getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Retrieve safe profile info of the currently logged-in user
router.get('/me', protect, getMe);

module.exports = router;
