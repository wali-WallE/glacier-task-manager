const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');

const pool = require('./db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://glacier-task-manager-gilt.vercel.app'
    ],
    credentials: true
}));

app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('Glacier Task Manager API is officially running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is locked in and running on port ${PORT}`);
});