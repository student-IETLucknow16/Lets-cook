import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Bot, Clock, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookingAssistant from '../components/ai/CookingAssistant';
import * as recipeService from '../services/recipeService';

/**
 * Extracts a YouTube video ID from common URL formats so we can embed it.
 * Returns null if the URL doesn't look like a YouTube link — callers should
 * fall back to a plain "open in new tab" link in that case.
 */
const getYoutubeEmbedId = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1];
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1];
    }
    return null;
  } catch {
    return null;
  }
};

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRecipe = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await recipeService.getRecipeById(id);
        if (isMounted) setRecipe(data.recipe);
      } catch (err) {
        if (isMounted) setErrorMsg(err.message || 'Recipe not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRecipe();
    return () => { isMounted = false; };
  }, [id]);

  /**
   * Opens the recipe-scoped AI chat. CookingAssistant receives the full
   * `recipe` object and reads title/description/category/cuisine/difficulty/
   * cookingTime itself when building each request.
   */
  const handleAiGuidanceClick = () => {
    setShowAiAssistant(true);
  };

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="recipe-details-status">
          <div className="spinner spinner-dark" style={{ width: '40px', height: '40px' }} />
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMsg || !recipe) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="recipe-details-status recipe-details-error">
          <p>{errorMsg || 'Recipe not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/recipes')}>
            Back to Recipes
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { title, description, image, category, cuisine, difficulty, cookingTime, youtubeUrl } = recipe;
  const youtubeId = getYoutubeEmbedId(youtubeUrl);

  return (
    <div className="home-page">
      <Navbar />

      <main className="recipe-details-main">
        <Link to="/recipes" className="back-btn recipe-details-back">
          <ArrowLeft size={18} aria-hidden="true" /> Back to Recipes
        </Link>

        <div className="recipe-details-image-wrapper">
          <img src={image} alt={title} className="recipe-details-image" />
        </div>

        <div className="recipe-details-content">
          <h1 className="recipe-details-title">{title}</h1>

          <div className="recipe-card-tags recipe-details-tags">
            <span className="recipe-tag">{cuisine}</span>
            <span className="recipe-tag">{category}</span>
            <span className={`recipe-difficulty-badge difficulty-${(difficulty || '').toLowerCase()}`}>
              {difficulty}
            </span>
            <span className="recipe-meta-item">
              <Clock size={14} aria-hidden="true" /> {cookingTime} min
            </span>
          </div>

          <p className="recipe-details-description">{description}</p>

          <div className="recipe-details-actions">
            {youtubeId ? (
              <div className="youtube-embed-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`${title} — YouTube tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : youtubeUrl ? (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary recipe-action-btn"
              >
                <Play size={18} aria-hidden="true" /> Watch YouTube Tutorial
              </a>
            ) : (
              <p className="recipe-no-video-msg">No YouTube tutorial available for this recipe yet.</p>
            )}

            <button
              type="button"
              className="btn btn-social recipe-action-btn recipe-ai-btn"
              onClick={handleAiGuidanceClick}
            >
              <Bot size={18} aria-hidden="true" /> AI Cooking Guidance
            </button>

            {showAiAssistant && (
              <CookingAssistant recipe={recipe} onClose={() => setShowAiAssistant(false)} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecipeDetails;