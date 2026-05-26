const express = require('express');
const router = express.Router();
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validate');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');


router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/logout', logoutUser);


module.exports = router;