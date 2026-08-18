const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * Asks the AI a cooking-guidance question about a specific recipe.
 * @param {string} recipeId
 * @param {string} message
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const getCookingGuidance = async (recipeId, message) => {
  return request('/api/ai/cooking-guidance', {
    method: 'POST',
    body: JSON.stringify({ recipeId, message }),
  });
};