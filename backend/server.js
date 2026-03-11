require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Guard against multiple connections on serverless warm starts
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));
}

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

// Session — stored in MongoDB Atlas so sessions persist across serverless instances
app.use(session({
  secret: process.env.SESSION_SECRET || 'kandy-breeze-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 86400,           // sessions expire after 1 day
    autoRemove: 'native',
    touchAfter: 3600      // only update session every hour to reduce writes
  }),
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 86400000,     // 1 day in ms
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

// Export for Vercel serverless
module.exports = app;

// Only start HTTP server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
