const db = require('../db');

const createTask = async (req, res) => {
    const { title, description, team_id, assigned_to, due_date } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tasks (title, description, team_id, assigned_to, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, team_id, assigned_to || null, due_date || null]
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
    const { title, description, status, assigned_to, due_date } = req.body;
    try {
        const result = await db.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3, assigned_to = $4, due_date = $5 WHERE id = $6 RETURNING *',
            [title, description, status, assigned_to, due_date || null, id]
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
    const userId = req.user.id;

    try {
        const taskResult = await db.query('SELECT team_id FROM tasks WHERE id = $1', [id]);
        if (taskResult.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        const teamId = taskResult.rows[0].team_id;

        const roleCheck = await db.query(
            'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
            [teamId, userId]
        );

        if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Only workspace admins can delete tasks.' });
        }

        await db.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Server error while deleting task' });
    }
};

module.exports = { createTask, getTeamTasks, updateTask, deleteTask };