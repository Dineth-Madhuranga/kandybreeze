require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Connect to MongoDB — guard against multiple connections in serverless warm starts
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));
}

app.use(express.json());

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Session — using MemoryStore (works reliably on serverless)
app.use(session({
  secret: process.env.SESSION_SECRET || 'kandy-breeze-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 86400000,
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    dbState: mongoose.connection.readyState
  });
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Export for Vercel serverless handler
module.exports = app;

// Only start HTTP server locally (Vercel sets process.env.VERCEL)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
