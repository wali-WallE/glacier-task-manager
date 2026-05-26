const db = require('../db');

const createTask = async (req, res) => {
    const { title, description, team_id, assigned_to } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tasks (title, description, team_id, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, team_id, assigned_to || null]
        );
        res.status(201).json({ message: 'Task created successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Server error while creating task' });
    }
};

const getTeamTasks = async (req, res) => {
    const { teamId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM tasks WHERE team_id = $1 ORDER BY created_at DESC',
            [teamId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Server error while fetching tasks' });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, assigned_to } = req.body;
    try {
        const result = await db.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3, assigned_to = $4 WHERE id = $5 RETURNING *',
            [title, description, status, assigned_to, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json({ message: 'Task updated successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Server error while updating task' });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Server error while deleting task' });
    }
};

module.exports = { createTask, getTeamTasks, updateTask, deleteTask };