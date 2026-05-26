const express = require('express');
const router = express.Router();
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validate');
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/authController');

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/logout', logoutUser);

router.get('/me', getCurrentUser);

module.exports = router;