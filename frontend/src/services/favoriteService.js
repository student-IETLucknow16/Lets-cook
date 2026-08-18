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

/** Full favorited recipes for the current user (Favorites page). */
export const getFavorites = async () => {
  return request('/api/favorites', { method: 'GET' });
};

/** Lightweight list of favorited recipe IDs, for marking hearts as active elsewhere. */
export const getFavoriteIds = async () => {
  return request('/api/favorites/ids', { method: 'GET' });
};

/** Adds the recipe if not favorited, removes it if it already is. */
export const toggleFavorite = async (recipeId) => {
  return request(`/api/favorites/${recipeId}`, { method: 'POST' });
};