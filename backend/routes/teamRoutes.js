const express = require('express');
const router = express.Router();
const { validateRequest, teamSchema } = require('../middleware/validate');
const { createTeam, getUserTeams, getTeamMembers, addTeamMember, deleteTeam, removeMember } = require('../controllers/teamController');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'You must be logged in to do this' });
};

router.post('/', isAuthenticated, validateRequest(teamSchema), createTeam);
router.get('/', isAuthenticated, getUserTeams);
router.get('/:teamId/members', isAuthenticated, getTeamMembers);
router.post('/:teamId/members', isAuthenticated, addTeamMember);

router.delete('/:teamId', isAuthenticated, deleteTeam);
router.delete('/:teamId/members/:memberId', isAuthenticated, removeMember);

module.exports = router;