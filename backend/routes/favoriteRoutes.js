const express = require('express');
const { getFavorites, getFavoriteIds, toggleFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getFavorites);
router.get('/ids', protect, getFavoriteIds);
router.post('/:recipeId', protect, toggleFavorite);

module.exports = router;