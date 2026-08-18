const { GoogleGenAI } = require('@google/genai');

let client = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.code = 'missing_api_key';
    throw error;
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return client;
};

const buildSystemInstructions = (recipe) => `
You are a friendly, practical cooking guidance assistant inside the "Let's Cook" app.

You are helping the user with exactly ONE recipe.

Recipe context:
- Name: ${recipe.title}
- Description: ${recipe.description}
- Category: ${recipe.category}
- Cuisine: ${recipe.cuisine}
- Difficulty: ${recipe.difficulty}
- Cooking Time: ${recipe.cookingTime} minutes
- YouTube Tutorial: ${
  recipe.youtubeUrl ? recipe.youtubeUrl : 'Not provided'
}

Your responsibilities:
- Answer questions related to this recipe.
- Give practical, beginner-friendly cooking guidance.
- Explain cooking concepts in simple language.
- Suggest reasonable ingredient substitutions when asked.
- Suggest variations of the recipe.
- Answer questions about the recipe's difficulty, cuisine, and cooking time.
- If the user asks something unrelated to cooking, politely redirect them back to cooking-related questions.

IMPORTANT:
The database does NOT store detailed ingredients or step-by-step instructions.

Never invent or assume specific ingredients, quantities, or preparation steps that aren't provided.

If the user asks about something that depends on missing recipe details, explain that detailed steps are not currently stored for this recipe.

Response style:
- Friendly
- Concise
- Practical
- Beginner-friendly
- Use short paragraphs or bullet points when useful
`;

const getCookingGuidance = async (recipe, message) => {
  const geminiClient = getClient();

  const instructions = buildSystemInstructions(recipe);

  const prompt = `${instructions}

User's question:
${message}`;

  const response = await geminiClient.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  const text = response.text?.trim();

  return (
    text ||
    "I'm not sure how to answer that. Could you try rephrasing your question?"
  );
};

module.exports = { getCookingGuidance };