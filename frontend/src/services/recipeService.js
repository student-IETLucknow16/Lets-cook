// Base URL of the backend API. Falls back to the local dev server if no
// VITE_API_URL env var is set — mirrors the convention already used by
// authController's FRONTEND_URL fallback on the backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Shared fetch wrapper: sends the HttpOnly JWT cookie automatically
 * (credentials: 'include'), parses JSON, and throws on non-2xx responses
 * so callers can use a single try/catch.
 */
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
    error.errors = data.errors;
    throw error;
  }

  return data;
};

/**
 * Fetch a paginated, filterable, searchable list of recipes.
 * @param {{search?: string, category?: string, cuisine?: string, difficulty?: string, page?: number, limit?: number}} params
 */
export const getRecipes = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return request(`/api/recipes${qs ? `?${qs}` : ''}`, { method: 'GET' });
};

export const getRecipeById = async (id) => {
  return request(`/api/recipes/${id}`, { method: 'GET' });
};

export const createRecipe = async (recipeData) => {
  return request('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipeData),
  });
};

export const updateRecipe = async (id, recipeData) => {
  return request(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(recipeData),
  });
};

export const deleteRecipe = async (id) => {
  return request(`/api/recipes/${id}`, { method: 'DELETE' });
};
