const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');

const ALLOWED_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
// Safe fields to expose about the recipe's author (never email, password, etc.)
const CREATOR_PUBLIC_FIELDS = 'name';

/**
 * Only the user who created a recipe may update or delete it.
 */
const canModifyRecipe = (user, recipe) => {
  if (!user || !recipe) return false;
  return recipe.createdBy.toString() === user._id.toString();
};

/**
 * @desc    Get recipes (supports search, filtering, pagination)
 * @route   GET /api/recipes?search=&category=&cuisine=&difficulty=&page=&limit=
 * @access  Public
 */
const getRecipes = async (req, res) => {
  try {
    const { search, category, cuisine, difficulty } = req.query;

    // ── Pagination ──
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = 12;
    if (limit > 50) limit = 50; // hard cap so the API can never be used to dump the whole collection

    // ── Build query ──
    const query = {};

    if (search && search.trim()) {
      const safeSearch = search.trim();
      const regex = new RegExp(safeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: regex }, { cuisine: regex }, { category: regex }];
    }

    if (category && category.trim()) query.category = category.trim();
    if (cuisine && cuisine.trim()) query.cuisine = cuisine.trim();
    if (difficulty && ALLOWED_DIFFICULTIES.includes(difficulty)) query.difficulty = difficulty;

    const total = await Recipe.countDocuments(query);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const recipes = await Recipe.find(query)
      .populate('createdBy', CREATOR_PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      page,
      totalPages,
      recipes,
    });
  } catch (error) {
    console.error('Get recipes error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching recipes' });
  }
};

/**
 * @desc    Get a single recipe by ID
 * @route   GET /api/recipes/:id
 * @access  Public
 */
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(id).populate('createdBy', CREATOR_PUBLIC_FIELDS);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.status(200).json({ success: true, recipe });
  } catch (error) {
    console.error('Get recipe by id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching recipe' });
  }
};

/**
 * @desc    Create a new recipe
 * @route   POST /api/recipes
 * @access  Private
 */
const createRecipe = async (req, res) => {
  try {
    const { title, description, image, category, cuisine, difficulty, cookingTime, youtubeUrl } = req.body;

    // ── Validation ──
    const errors = [];
    if (!title || !title.trim()) errors.push('Title is required');
    if (!description || !description.trim()) errors.push('Description is required');
    if (!image || !image.trim()) errors.push('Food image URL is required');
    if (!category || !category.trim()) errors.push('Category is required');
    if (!cuisine || !cuisine.trim()) errors.push('Cuisine is required');
    if (!difficulty || !ALLOWED_DIFFICULTIES.includes(difficulty)) {
      errors.push('Difficulty must be Easy, Medium, or Hard');
    }
    const parsedCookingTime = Number(cookingTime);
    if (!cookingTime || Number.isNaN(parsedCookingTime) || parsedCookingTime <= 0) {
      errors.push('Cooking time must be a positive number');
    }

    // Very light URL sanity checks (not a full validator, just enough to catch junk input)
    const isLikelyUrl = (value) => /^https?:\/\/.+/i.test(value);
    if (image && !isLikelyUrl(image)) errors.push('Food image must be a valid URL starting with http(s)');
    if (youtubeUrl && youtubeUrl.trim() && !isLikelyUrl(youtubeUrl)) {
      errors.push('YouTube URL must be a valid URL starting with http(s)');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      category: category.trim(),
      cuisine: cuisine.trim(),
      difficulty,
      cookingTime: parsedCookingTime,
      youtubeUrl: youtubeUrl ? youtubeUrl.trim() : '',
      createdBy: req.user._id,
    });

    const populated = await recipe.populate('createdBy', CREATOR_PUBLIC_FIELDS);

    res.status(201).json({ success: true, message: 'Recipe created successfully', recipe: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Validation error';
      return res.status(400).json({ success: false, message });
    }
    console.error('Create recipe error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating recipe' });
  }
};

/**
 * @desc    Update a recipe (owner or admin only)
 * @route   PUT /api/recipes/:id
 * @access  Private
 */
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    if (!canModifyRecipe(req.user, recipe)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this recipe' });
    }

    const editableFields = [
      'title',
      'description',
      'image',
      'category',
      'cuisine',
      'difficulty',
      'cookingTime',
      'youtubeUrl',
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        recipe[field] = field === 'cookingTime' ? Number(req.body[field]) : req.body[field];
      }
    });

    if (recipe.difficulty && !ALLOWED_DIFFICULTIES.includes(recipe.difficulty)) {
      return res.status(400).json({ success: false, message: 'Difficulty must be Easy, Medium, or Hard' });
    }

    await recipe.save();
    const populated = await recipe.populate('createdBy', CREATOR_PUBLIC_FIELDS);

    res.status(200).json({ success: true, message: 'Recipe updated successfully', recipe: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Validation error';
      return res.status(400).json({ success: false, message });
    }
    console.error('Update recipe error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating recipe' });
  }
};

/**
 * @desc    Delete a recipe (owner or admin only)
 * @route   DELETE /api/recipes/:id
 * @access  Private
 */
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    if (!canModifyRecipe(req.user, recipe)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this recipe' });
    }

    await recipe.deleteOne();
    await Favorite.deleteMany({ recipe: id }); // avoid orphaned favorites pointing at a deleted recipe

    res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting recipe' });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};