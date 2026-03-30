const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require("path");

const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Try again later.' }
});

// Routes
const webhookRoutes = require('./routes/webhook');
const dishesRoutes = require('./routes/dishes');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const checkoutRoutes = require('./routes/checkout');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));




app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json());

app.use(session({
  name: 'restaurant_session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false, // true في HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

const passport = require('./passport');

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/dishes', dishesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

//  Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




