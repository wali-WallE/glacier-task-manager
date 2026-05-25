import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Hit the backend logout route to destroy the secure session cookie
            await api.post('/auth/logout');

            console.log('Logged out successfully');

            // Teleport the user back to the login screen
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
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

            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3>Welcome to the inside!</h3>
                <p>Your secure session is active. This is where we will build the task and team management interface.</p>
            </div>
        </div>
    );
};

export default Dashboard;