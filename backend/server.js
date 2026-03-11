require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());

// Allow multiple origins (local dev + deployed frontend)
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'kandy-breeze-secret',
  resave: false,
  saveUninitialized: false,
  // Store sessions in MongoDB so they persist across serverless cold starts
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 86400, // 1 day in seconds
    autoRemove: 'native'
  }),
  cookie: {
    secure: isProduction,      // HTTPS only in production
    httpOnly: true,
    maxAge: 86400000,          // 1 day in ms
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend build in non-serverless environments (local monolith)
if (!isProduction) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
