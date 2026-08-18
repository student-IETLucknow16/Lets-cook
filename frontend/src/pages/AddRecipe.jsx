import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeForm from '../components/RecipeForm';
import * as recipeService from '../services/recipeService';

const AddRecipe = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreate = async (recipeData) => {
    const data = await recipeService.createRecipe(recipeData);
    setSuccessMsg('Recipe added successfully! Redirecting...');
    setTimeout(() => {
      navigate(`/recipes/${data.recipe._id}`);
    }, 1200);
  };

  return (
    <div className="home-page">
      <Navbar />

      <main className="add-recipe-main">
        <div className="auth-container add-recipe-container">
          <div className="auth-header">
            <h1 className="auth-logo">Add a Recipe</h1>
            <p className="auth-subtitle">Share your dish with the Let's Cook community.</p>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <RecipeForm onSubmit={handleCreate} submitLabel="Add Recipe" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddRecipe;
