import React from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FoodGallery from '../components/FoodGallery';
import Footer from '../components/Footer';

/**
 * Home — The main authenticated landing page.
 *
 * Structure:
 *   <Navbar>        — sticky top nav (profile, logo, favorites, logout)
 *   <main>
 *     <hero>        — "Let's Cook" heading + subtitle + SearchBar
 *     <gallery>     — decorative food image collage
 *   </main>
 *   <Footer>        — links + copyright
 */
const Home = () => {
  return (
    <div className="home-page">
      <Navbar />

      <main id="home-main" className="home-main">

        {/* ── Hero ── */}
        <section id="home-hero" className="home-hero" aria-labelledby="home-heading">
          <h1 id="home-heading" className="home-title">Let's Cook</h1>
          <p className="home-subtitle">
            Discover delicious recipes and make something amazing.
          </p>
          <SearchBar />
        </section>

        {/* ── Food Gallery ── */}
        <div className="home-gallery-wrapper">
          <FoodGallery />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
