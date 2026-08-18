const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

/**
 * @desc    Get the current user's favorited recipes (full recipe data)
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'recipe',
        populate: { path: 'createdBy', select: 'name' },
      })
      .sort({ createdAt: -1 });

    // A favorited recipe may have since been deleted — skip orphaned entries
    // rather than surfacing nulls to the client.
    const recipes = favorites.filter((f) => f.recipe).map((f) => f.recipe);

    res.status(200).json({ success: true, count: recipes.length, recipes });
  } catch (error) {
    console.error('Get favorites error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching favorites' });
  }
};

/**
 * @desc    Get just the recipe IDs the current user has favorited (lightweight)
 * @route   GET /api/favorites/ids
 * @access  Private
 */
const getFavoriteIds = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).select('recipe');
    res.status(200).json({
      success: true,
      recipeIds: favorites.map((f) => f.recipe.toString()),
    });
  } catch (error) {
    console.error('Get favorite ids error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching favorites' });
  }
};

/**
 * @desc    Toggle favorite status for a recipe (add if not favorited, remove if it is)
 * @route   POST /api/favorites/:recipeId
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const existing = await Favorite.findOne({ user: req.user._id, recipe: recipeId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, isFavorited: false, message: 'Removed from favorites' });
    }

    await Favorite.create({ user: req.user._id, recipe: recipeId });
    return res.status(200).json({ success: true, isFavorited: true, message: 'Added to favorites' });
  } catch (error) {
    // Unique index race (double-click) — treat as already favorited rather than a hard error
    if (error.code === 11000) {
      return res.status(200).json({ success: true, isFavorited: true, message: 'Added to favorites' });
    }
    console.error('Toggle favorite error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating favorite' });
  }
};

module.exports = {
  getFavorites,
  getFavoriteIds,
  toggleFavorite,
};
