const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../db');

// 1. The Local Strategy (How we verify email and password)
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        // Find the user
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }

        const user = userResult.rows[0];

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }

        // Success! Pass the user data forward
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// 2. Serialize (Decide what to store in the session cookie)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// 3. Deserialize (Use the ID in the cookie to fetch the user from the database)
passport.deserializeUser(async (id, done) => {
    try {
        const userResult = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
        done(null, userResult.rows[0]);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;