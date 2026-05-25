const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// This creates the actual /register endpoint
router.post('/register', registerUser);
// This creates the actual /login endpoint
router.post('/login', loginUser);
// This creates the actual /logout endpoint
router.post('/logout', logoutUser);

module.exports = router;