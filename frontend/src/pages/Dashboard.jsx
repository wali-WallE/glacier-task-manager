import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        try {
            const response = await api.post('/teams', {
                name: teamName,
                description: teamDescription
            });

            setStatusMessage(`Success! Team "${response.data.team.name}" was created.`);
            setTeamName('');
            setTeamDescription('');

        } catch (err) {
            console.error('Failed to create team:', err);
            setStatusMessage(err.response?.data?.error || 'Error creating team');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                <h2>Glacier Task Dashboard</h2>
                <button
                    onClick={handleLogout}
                    style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Log Out
                </button>
            </div>

            {/* New Team Creation Section */}
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
                <h3>Create a New Team</h3>

                {statusMessage && (
                    <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: statusMessage.includes('Success') ? '#d4edda' : '#f8d7da', color: statusMessage.includes('Success') ? '#155724' : '#721c24', borderRadius: '4px' }}>
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Team Name (e.g., Frontend Ninjas)"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                        style={{ padding: '10px' }}
                    />
                    <textarea
                        placeholder="What is this team working on?"
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        rows="3"
                        style={{ padding: '10px', resize: 'vertical' }}
                    />
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                        Create Team
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;