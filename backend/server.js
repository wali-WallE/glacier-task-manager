const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');

// Bring in the database connection
const pool = require('./db');

// Bring in our new authentication routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- NEW MIDDLEWARE ---
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // React Vite default port
app.use(express.json());

// 1. Session Configuration (Stores sessions in Postgres)
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'glacier_super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true // Crucial for security as requested by Glacier
    }
}));

// 2. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Glacier Task Manager API is officially running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is locked in and running on port ${PORT}`);
});