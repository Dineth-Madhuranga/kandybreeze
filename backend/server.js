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

// Connect to MongoDB (non-blocking — function can still handle requests while connecting)
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

// Session with MongoDB store
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  ttl: 86400,
  autoRemove: 'native',
  touchAfter: 3600
});

sessionStore.on('error', (err) => {
  console.error('Session store error:', err);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'kandy-breeze-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
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
    dbState: mongoose.connection.readyState // 0=disconnected,1=connected,2=connecting
  });
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Export for Vercel serverless
module.exports = app;

// Local dev server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
