const express = require('express');
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public — discovery
router.get('/', getRecipes);
router.get('/:id', getRecipeById);

// Private — creation & ownership-guarded mutation
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;
