const bcrypt = require('bcrypt');
const pool = require('../db');
const passport = require('passport'); // Add this import

const registerUser = async (req, res) => {
    // ... (Keep your existing registerUser code exactly as it is) ...
    try {
        const { email, password } = req.body;
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// --- NEW LOGIN LOGIC ---
const loginUser = (req, res, next) => {
    // We use a custom callback here so we can return JSON instead of redirecting pages
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Server error during login' });
        }
        if (!user) {
            return res.status(401).json({ error: info.message }); // "Incorrect email or password"
        }

        // req.logIn is a Passport function that establishes the session
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Session creation failed' });
            }
            return res.status(200).json({
                message: 'Login successful!',
                user: { id: user.id, email: user.email }
            });
        });
    })(req, res, next);
};

// --- NEW LOGOUT LOGIC ---
const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });

        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Destroys the cookie in the user's browser
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
};

// Make sure to export the new functions!
module.exports = { registerUser, loginUser, logoutUser };