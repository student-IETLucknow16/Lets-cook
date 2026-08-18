import React, { useState } from 'react';
import { UtensilsCrossed, Image as ImageIcon, Clock, Video } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const INITIAL_STATE = {
  title: '',
  description: '',
  image: '',
  category: '',
  cuisine: '',
  difficulty: '',
  cookingTime: '',
  youtubeUrl: '',
};

/**
 * RecipeForm — controlled form for creating a recipe.
 * Kept generic enough to be reused for editing later (pass `initialValues`
 * and a different onSubmit) without any changes to this component.
 */
const RecipeForm = ({ initialValues = INITIAL_STATE, onSubmit, submitLabel = 'Add Recipe' }) => {
  const [formData, setFormData] = useState({ ...INITIAL_STATE, ...initialValues });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.title.trim()) return 'Recipe name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.image.trim()) return 'Food image URL is required';
    if (!/^https?:\/\/.+/i.test(formData.image.trim())) return 'Food image must be a valid URL';
    if (!formData.category.trim()) return 'Category is required';
    if (!formData.cuisine.trim()) return 'Cuisine is required';
    if (!DIFFICULTIES.includes(formData.difficulty)) return 'Please select a difficulty';
    const time = Number(formData.cookingTime);
    if (!formData.cookingTime || Number.isNaN(time) || time <= 0) return 'Cooking time must be a positive number';
    if (formData.youtubeUrl.trim() && !/^https?:\/\/.+/i.test(formData.youtubeUrl.trim())) {
      return 'YouTube URL must be a valid URL';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        category: formData.category.trim(),
        cuisine: formData.cuisine.trim(),
        cookingTime: Number(formData.cookingTime),
        youtubeUrl: formData.youtubeUrl.trim(),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="title">Recipe Name</label>
        <div className="input-wrapper">
          <UtensilsCrossed size={18} className="input-icon-left" aria-hidden="true" />
          <input
            id="title"
            name="title"
            type="text"
            className="form-input form-input-has-icon-left"
            placeholder="Butter Chicken"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-input recipe-form-textarea"
          placeholder="A creamy and flavorful Indian chicken dish."
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="image">Food Image URL</label>
        <div className="input-wrapper">
          <ImageIcon size={18} className="input-icon-left" aria-hidden="true" />
          <input
            id="image"
            name="image"
            type="url"
            className="form-input form-input-has-icon-left"
            placeholder="https://example.com/image.jpg"
            value={formData.image}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="recipe-form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            className="form-input"
            placeholder="Main Course"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cuisine">Cuisine</label>
          <input
            id="cuisine"
            name="cuisine"
            type="text"
            className="form-input"
            placeholder="Indian"
            value={formData.cuisine}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="recipe-form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            className="form-input"
            value={formData.difficulty}
            onChange={handleChange}
          >
            <option value="">Select difficulty</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cookingTime">Cooking Time (minutes)</label>
          <div className="input-wrapper">
            <Clock size={18} className="input-icon-left" aria-hidden="true" />
            <input
              id="cookingTime"
              name="cookingTime"
              type="number"
              min="1"
              className="form-input form-input-has-icon-left"
              placeholder="45"
              value={formData.cookingTime}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="youtubeUrl">YouTube Tutorial URL (optional)</label>
        <div className="input-wrapper">
          <Video size={18} className="input-icon-left" aria-hidden="true" />
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            className="form-input form-input-has-icon-left"
            placeholder="https://www.youtube.com/watch?v=..."
            value={formData.youtubeUrl}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary recipe-form-submit" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default RecipeForm;
