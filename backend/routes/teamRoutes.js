const express = require('express');
const router = express.Router();
const { createTeam, getUserTeams } = require('../controllers/teamController');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'You must be logged in to do this' });
};

router.post('/', isAuthenticated, createTeam);
router.get('/', isAuthenticated, getUserTeams);

module.exports = router;
