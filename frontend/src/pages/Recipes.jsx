import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeGrid from '../components/RecipeGrid';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import * as recipeService from '../services/recipeService';
import * as favoriteService from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';

const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const [recipes, setRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters are seeded from the URL so a link like /recipes?search=Chicken
  // (from the Home page search bar) works on direct load.
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    cuisine: searchParams.get('cuisine') || '',
    difficulty: searchParams.get('difficulty') || '',
  });

  // Distinct category/cuisine values seen so far, used to populate the filter dropdowns.
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  const fetchRecipes = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await recipeService.getRecipes({ ...currentFilters, page: currentPage, limit: 12 });
      setRecipes(data.recipes || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);

      setCategories((prev) => Array.from(new Set([...prev, ...data.recipes.map((r) => r.category)])).sort());
      setCuisines((prev) => Array.from(new Set([...prev, ...data.recipes.map((r) => r.cuisine)])).sort());
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep the URL in sync with filters/page so links stay shareable and back/forward works.
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.cuisine) params.cuisine = filters.cuisine;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    fetchRecipes(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // Load which recipes the user has already favorited so hearts render correctly.
  useEffect(() => {
    favoriteService
      .getFavoriteIds()
      .then((data) => setFavoriteIds(new Set(data.recipeIds || [])))
      .catch(() => {}); // non-critical — hearts just default to unfilled if this fails
  }, []);

  const handleFavoriteToggle = async (recipeId, nextState) => {
    // Optimistic update so the heart responds instantly.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (nextState) next.add(recipeId); else next.delete(recipeId);
      return next;
    });
    try {
      await favoriteService.toggleFavorite(recipeId);
    } catch (err) {
      // Revert on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (nextState) next.delete(recipeId); else next.add(recipeId);
        return next;
      });
      setErrorMsg(err.message || 'Failed to update favorites');
    }
  };

  const handleDelete = async (recipeId) => {
    const confirmed = window.confirm('Delete this recipe? This cannot be undone.');
    if (!confirmed) return;

    try {
      await recipeService.deleteRecipe(recipeId);
      // Refetch so pagination/counts stay accurate rather than just splicing locally.
      fetchRecipes(filters, page);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete recipe');
    }
  };

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category: '', cuisine: '', difficulty: '' });
    setPage(1);
  };

  const heading = useMemo(() => {
    if (filters.search) return `Results for "${filters.search}"`;
    return 'Explore Recipes';
  }, [filters.search]);

  return (
    <div className="home-page">
      <Navbar />

      <main className="recipes-main">
        <section className="recipes-header">
          <h1 className="recipes-title">{heading}</h1>
          {!loading && <p className="recipes-subtitle">{total} recipe{total === 1 ? '' : 's'} found</p>}
          <Link to="/add-recipe" className="btn btn-primary recipes-add-btn">
            <Plus size={16} aria-hidden="true" /> Add Recipe
          </Link>
        </section>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          categories={categories}
          cuisines={cuisines}
        />

        {errorMsg && <div className="alert alert-error recipes-alert">{errorMsg}</div>}

        <RecipeGrid
          recipes={recipes}
          loading={loading}
          currentUserId={currentUserId}
          favoriteIds={favoriteIds}
          onFavoriteToggle={handleFavoriteToggle}
          onDelete={handleDelete}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>

      <Footer />
    </div>
  );
};

export default Recipes;