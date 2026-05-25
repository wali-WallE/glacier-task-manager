import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            console.log('Login Successful, Session Cookie Received:', response.data);

            navigate('/dashboard');

        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Welcome Back</h2>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Log In
                </button>
            </form>

            <p style={{ marginTop: '15px', fontSize: '14px' }}>
                Need an account? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/register')}>Register here</span>
            </p>
        </div>
    );
};

export default Login;