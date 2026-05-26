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

const getTeamMembers = async (req, res) => {
    const { teamId } = req.params;
    try {
        const result = await db.query(
            `SELECT u.id, u.email AS username FROM users u 
            JOIN team_members tm ON u.id = tm.user_id 
            WHERE tm.team_id = $1`,
            [teamId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Server error fetching members' });
    }
};

const addTeamMember = async (req, res) => {
    const { teamId } = req.params;
    const { email } = req.body;

    try {
        const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'No user found with that email address.' });
        }

        const newUserId = userResult.rows[0].id;

        const existingMember = await db.query(
            'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
            [teamId, newUserId]
        );

        if (existingMember.rows.length > 0) {
            return res.status(400).json({ error: 'User is already a member of this team.' });
        }

        await db.query(
            'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
            [teamId, newUserId, 'member']
        );

        res.status(200).json({ message: 'Member added successfully!' });
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: `DB Error: ${error.message}` });
    }
};

module.exports = {
    createTeam, getUserTeams, getTeamMembers, addTeamMember
};