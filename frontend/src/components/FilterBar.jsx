import React from 'react';
import { Search, X } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

/**
 * FilterBar — controlled search + filter inputs for the Recipes page.
 * Parent owns state and passes it down, so this stays a "dumb" component.
 */
const FilterBar = ({ filters, onFilterChange, onClear, categories = [], cuisines = [] }) => {
  const handleChange = (field) => (e) => {
    onFilterChange({ ...filters, [field]: e.target.value });
  };

  const hasActiveFilters = filters.search || filters.category || filters.cuisine || filters.difficulty;

  return (
    <div className="recipe-filter-bar">
      <div className="filter-search-wrapper">
        <Search size={18} className="search-icon" aria-hidden="true" />
        <input
          type="search"
          className="search-input filter-search-input"
          placeholder="Search by dish, cuisine, or category..."
          value={filters.search || ''}
          onChange={handleChange('search')}
          aria-label="Search recipes"
        />
      </div>

      <select
        className="filter-select"
        value={filters.category || ''}
        onChange={handleChange('category')}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.cuisine || ''}
        onChange={handleChange('cuisine')}
        aria-label="Filter by cuisine"
      >
        <option value="">All Cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.difficulty || ''}
        onChange={handleChange('difficulty')}
        aria-label="Filter by difficulty"
      >
        <option value="">All Difficulties</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button type="button" className="filter-clear-btn" onClick={onClear} aria-label="Clear filters">
          <X size={16} aria-hidden="true" /> Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
