import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/recipes?search=${encodeURIComponent(trimmed)}` : '/recipes');
  };

  return (
    <form
      id="recipe-search-form"
      className="search-form"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search for recipes"
    >
      <div className="search-wrapper">
        <Search size={20} className="search-icon" aria-hidden="true" />
        <input
          id="recipe-search-input"
          type="search"
          className="search-input"
          placeholder="Search for a dish, cuisine, or recipe..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search for a dish, cuisine, or recipe"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </form>
  );
};

export default SearchBar;
