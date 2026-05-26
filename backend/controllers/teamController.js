const db = require('../db'); 

const createTeam = async (req, res) => {
    const { name, description } = req.body;

    const userId = req.user.id;

    try {
        const teamResult = await db.query(
            'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, description, userId]
        );

        const newTeam = teamResult.rows[0];

        await db.query(
            'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
            [newTeam.id, userId, 'admin']
        );

        res.status(201).json({
            message: 'Team created successfully!',
            team: newTeam
        });

    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Server error while creating team' });
    }
};

const getUserTeams = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT t.* FROM teams t 
             JOIN team_members tm ON t.id = tm.team_id 
             WHERE tm.user_id = $1 ORDER BY t.created_at DESC`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching user teams:', error);
        res.status(500).json({ error: 'Server error while fetching teams' });
    }
};

module.exports = {
    createTeam, getUserTeams
};