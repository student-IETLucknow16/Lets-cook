const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for reading secure JWT cookie
app.use(cookieParser());

// Base health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is running' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', userRoutes); // Mount userRoutes under /api/auth so GET /me becomes GET /api/auth/me
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
  });
});

module.exports = app;
