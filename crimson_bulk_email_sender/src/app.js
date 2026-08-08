const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Enable CORS and body parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static dashboard assets from frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API Routes
app.use('/api', apiRouter);

// Fallback to React SPA index.html on direct URL entry or page refresh
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
