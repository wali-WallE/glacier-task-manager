const express = require('express');
const router = express.Router();
const { validateRequest, taskSchema } = require('../middleware/validate');
const { createTask, getTeamTasks, updateTask, deleteTask } = require('../controllers/taskController');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

router.post('/', isAuthenticated, validateRequest(taskSchema), createTask);
router.get('/team/:teamId', isAuthenticated, getTeamTasks);
router.put('/:id', isAuthenticated, updateTask);
router.delete('/:id', isAuthenticated, deleteTask);

module.exports = router;