import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock, ChefHat, Trash2 } from 'lucide-react';

const FALLBACK_IMAGE = '/images.jpg';

/**
 * RecipeCard — presentational only. Favorite/delete state and API calls are
 * owned by the parent page (Recipes, Favorites) so multiple cards on the
 * same page stay in sync and pages can decide what happens after each action
 * (e.g. Favorites page removes the card from the list on unfavorite).
 */
const RecipeCard = ({ recipe, currentUserId, isFavorited, onFavoriteToggle, onDelete }) => {
  const navigate = useNavigate();

  if (!recipe) return null;

  const { _id, title, image, cuisine, category, difficulty, cookingTime, createdBy } = recipe;
  const isOwner = Boolean(currentUserId) && createdBy?._id?.toString() === currentUserId?.toString();

  const handleView = () => navigate(`/recipes/${_id}`);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle?.(_id, !isFavorited);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(_id);
  };

  return (
    <div
      className="recipe-card"
      onClick={handleView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleView(); }}
    >
      <div className="recipe-card-image-wrapper">
        <img
          src={image || FALLBACK_IMAGE}
          alt={title}
          className="recipe-card-image"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />

        <button
          className={`recipe-favorite-btn ${isFavorited ? 'recipe-favorite-btn-active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={isFavorited}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={18} aria-hidden="true" fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {isOwner && (
          <button
            className="recipe-delete-btn"
            onClick={handleDeleteClick}
            aria-label="Delete recipe"
            title="Delete recipe"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}

        <span className={`recipe-difficulty-badge difficulty-${(difficulty || '').toLowerCase()}`}>
          {difficulty}
        </span>
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{title}</h3>
        <div className="recipe-card-tags">
          <span className="recipe-tag">{cuisine}</span>
          <span className="recipe-tag">{category}</span>
        </div>
        <div className="recipe-card-meta">
          <span className="recipe-meta-item">
            <Clock size={14} aria-hidden="true" /> {cookingTime} min
          </span>
        </div>
        <button
          className="btn btn-primary recipe-view-btn"
          onClick={(e) => { e.stopPropagation(); handleView(); }}
        >
          <ChefHat size={16} aria-hidden="true" /> View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
