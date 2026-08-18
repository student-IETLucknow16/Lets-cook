const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const { getCookingGuidance } = require('../services/aiService');

const MAX_MESSAGE_LENGTH = 500;

/**
 * @desc    Ask the AI a cooking-guidance question about a specific recipe
 * @route   POST /api/ai/cooking-guidance
 * @access  Private
 */
const cookingGuidance = async (req, res) => {
  try {
    const { recipeId, message } = req.body;

    // ── Validation ──
    if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ success: false, message: 'A valid recipeId is required' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a question' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res
        .status(400)
        .json({ success: false, message: `Please keep your question under ${MAX_MESSAGE_LENGTH} characters` });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const aiMessage = await getCookingGuidance(recipe, trimmedMessage);

    res.status(200).json({ success: true, message: aiMessage });
  } catch (error) {
    console.error('AI cooking guidance error:', error.message);

    if (error.code === 'missing_api_key') {
      return res.status(503).json({ success: false, message: 'AI Cooking Guidance is temporarily unavailable' });
    }

    // OpenAI SDK errors carry a `status` — map the common ones to friendly messages
    // without ever forwarding the raw error, stack trace, or key info to the client.
    if (error.status === 429) {
      return res
        .status(429)
        .json({ success: false, message: 'AI Cooking Guidance is a bit busy right now. Please try again shortly.' });
    }
    if (error.status === 401 || error.status === 403) {
      return res.status(503).json({ success: false, message: 'AI Cooking Guidance is temporarily unavailable' });
    }

    res
      .status(500)
      .json({ success: false, message: 'Something went wrong getting cooking guidance. Please try again.' });
  }
};

module.exports = { cookingGuidance };