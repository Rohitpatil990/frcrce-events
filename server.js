/**
 * Main Server File
 * Event Management System
 * FRCRCE - Fr. Conceicao Rodrigues College of Engineering
 */

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./backend/config/database');
const errorHandler = require('./backend/middleware/errorHandler');

if (process.env.NODE_ENV === 'production') {
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32 || /change|secret|example|your_/i.test(jwtSecret)) {
    throw new Error('Production requires a strong JWT_SECRET of at least 32 characters.');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('Production requires MONGODB_URI.');
  }
}

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: true
}));
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/certificates', express.static(path.join(__dirname, 'public/certificates')));

// API Routes
app.use('/api/auth', require('./backend/routes/authRoutes'));
app.use('/api/events', require('./backend/routes/eventRoutes'));
app.use('/api/registrations', require('./backend/routes/registrationRoutes'));
app.use('/api/attendance', require('./backend/routes/attendanceRoutes'));
app.use('/api/certificates', require('./backend/routes/certificateRoutes'));
app.use('/api/admin', require('./backend/routes/adminRoutes'));

// Root route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'login.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    message: databaseReady ? 'Server and database are ready' : 'Database is not ready',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🎓 Event Management System - FRCRCE');
  console.log('='.repeat(50));
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
