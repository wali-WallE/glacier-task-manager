import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; 

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // Stops the page from refreshing when you hit submit
        setError('');

        try {
            const response = await api.post('/auth/register', {
                email,
                password
            });

            console.log('Registration Successful:', response.data);

            navigate('/login');

        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.error || 'A server error occurred');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Create an Account</h2>

            {/* Show error messages if they exist */}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Register
                </button>
            </form>

            <p style={{ marginTop: '15px', fontSize: '14px' }}>
                Already have an account? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>Log in here</span>
            </p>
        </div>
    );
};

export default Register;