import React from 'react';
import RecipeCard from './RecipeCard';
import { ChefHat } from 'lucide-react';

const RecipeGrid = ({
  recipes,
  loading,
  currentUserId,
  favoriteIds,
  onFavoriteToggle,
  onDelete,
  emptyMessage = 'No recipes found',
}) => {
  if (loading) {
    return (
      <div className="recipe-grid-status">
        <div className="spinner spinner-dark" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="recipe-grid-status recipe-grid-empty">
        <ChefHat size={40} aria-hidden="true" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          currentUserId={currentUserId}
          isFavorited={favoriteIds?.has(recipe._id)}
          onFavoriteToggle={onFavoriteToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;