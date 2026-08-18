const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a recipe title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please add a food image URL'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    cuisine: {
      type: String,
      required: [true, 'Please add a cuisine'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Please add a difficulty level'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
    },
    cookingTime: {
      type: Number,
      required: [true, 'Please add cooking time in minutes'],
      min: [1, 'Cooking time must be at least 1 minute'],
      max: [1440, 'Cooking time seems unrealistic'],
    },
    youtubeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Speed up search (title/cuisine/category) and common filter combinations
recipeSchema.index({ title: 'text', cuisine: 'text', category: 'text' });
recipeSchema.index({ category: 1, cuisine: 1, difficulty: 1 });
recipeSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
