require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB Cached Connection for Serverless
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = db;
    console.log('MongoDB connected successfully');
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Middleware to ensure DB connection is ready before handling any API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use(express.json());

// CORS — allow local dev + deployed frontend
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

// Parse cookies (for reading JWT from httpOnly cookie)
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  req.cookies = {};
  cookieHeader.split(';').forEach(pair => {
    const [key, ...val] = pair.trim().split('=');
    if (key) req.cookies[key.trim()] = decodeURIComponent(val.join('='));
  });
  next();
});

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

// Export for Vercel serverless
module.exports = app;

// Only start HTTP server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
