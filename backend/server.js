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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());

// CORS — allow local dev and deployed frontend
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

// Session — use MongoDB store so sessions survive serverless cold starts
app.use(session({
  secret: process.env.SESSION_SECRET || 'kandy-breeze-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 86400,
    autoRemove: 'native'
  }),
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 86400000,
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// Export for Vercel serverless
module.exports = app;

// Start local server only when not in serverless (Vercel sets VERCEL env var)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
