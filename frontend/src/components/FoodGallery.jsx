import React from 'react';

/**
 * FOOD GALLERY — Decorative image collage.
 *
 * To replace placeholder images:
 *   1. Drop your food images into /public/images/
 *   2. Update the `src` values below to e.g. "/images/pasta.jpg"
 *
 * Images are purely decorative — no recipe info is shown over them.
 */
const FOOD_IMAGES = [
  {
    id: 1,
    src: '/images3.jpg',
    alt: 'A beautiful plated dish',
  },
  {
    id: 2,
    src: '/images.jpg',
    alt: 'Fresh ingredients and flavors',
  },
  {
    id: 3,
    src: '/images2.jpg',
    alt: 'Chef-crafted culinary creation',
  },
  {
    id: 4,
    src: '/images4.jpg',
    alt: 'Vibrant seasonal produce',
  },
  {
    id: 5,
    src: '/images5.jpg',
    alt: 'Delightful homemade meal',
  },
];

const FoodGallery = () => {
  return (
    <section
      className="food-gallery"
      aria-label="Food inspiration gallery"
    >
      {FOOD_IMAGES.map((img) => (
        <div
          key={img.id}
          className={`gallery-item gallery-item-${img.id}`}
        >
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            draggable={false}
          />
          {/* Subtle warm overlay for cohesion */}
          <div className="gallery-overlay" aria-hidden="true" />
        </div>
      ))}
    </section>
  );
};

export default FoodGallery;
