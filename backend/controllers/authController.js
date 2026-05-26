const bcrypt = require('bcrypt');
const pool = require('../db');
const passport = require('passport'); 

const registerUser = async (req, res) => {
    try {
        const { name, username, fullName, email, password } = req.body;

        const finalName = name || username || fullName || 'User';

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [finalName, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
    } catch (error) {
        console.error("REGISTRATION ERROR DETECTED:", error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

const loginUser = (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Server error during login' });
        }
        if (!user) {
            return res.status(401).json({ error: info.message }); 
        }

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

const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });

        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Destroys the cookie in the user's browser
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
};

module.exports = { registerUser, loginUser, logoutUser };