import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeGrid from '../components/RecipeGrid';
import * as recipeService from '../services/recipeService';
import * as favoriteService from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';

/**
 * Favorites — shows every recipe the current user has favorited.
 * Since everything rendered here is by definition favorited, favoriteIds
 * is just derived from the loaded recipe list.
 */
const Favorites = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await favoriteService.getFavorites();
      setRecipes(data.recipes || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteToggle = async (recipeId, nextState) => {
    // On this page, un-favoriting removes the card immediately.
    if (!nextState) {
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    }
    try {
      await favoriteService.toggleFavorite(recipeId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update favorites');
      fetchFavorites(); // resync with the server if the optimistic removal was wrong
    }
  };

  const handleDelete = async (recipeId) => {
    const confirmed = window.confirm('Delete this recipe? This cannot be undone.');
    if (!confirmed) return;

    try {
      await recipeService.deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete recipe');
    }
  };

  const favoriteIds = new Set(recipes.map((r) => r._id));

  return (
    <div className="home-page">
      <Navbar />

      <main className="recipes-main">
        <section className="recipes-header">
          <h1 className="recipes-title">
            <Heart size={28} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 8 }} />
            My Favorites
          </h1>
          {!loading && (
            <p className="recipes-subtitle">
              {recipes.length} recipe{recipes.length === 1 ? '' : 's'} saved
            </p>
          )}
        </section>

        {errorMsg && <div className="alert alert-error recipes-alert">{errorMsg}</div>}

        <RecipeGrid
          recipes={recipes}
          loading={loading}
          currentUserId={currentUserId}
          favoriteIds={favoriteIds}
          onFavoriteToggle={handleFavoriteToggle}
          onDelete={handleDelete}
          emptyMessage="You haven't favorited any recipes yet. Tap the heart on a recipe to save it here."
        />
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;