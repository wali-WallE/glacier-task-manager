import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/login');
        } catch (err) { alert('Registration failed'); }
    };

    return (
        <div className="min-h-screen bg-[#EDE9E6] flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-[#EDE9E6] w-full max-w-sm">
                <h1 className="text-2xl font-semibold text-[#5C4F4A] mb-8">Create Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:ring-1 focus:ring-[#5C766D] outline-none" />
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:ring-1 focus:ring-[#5C766D] outline-none" />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:ring-1 focus:ring-[#5C766D] outline-none" />
                    <button type="submit" className="w-full bg-[#5C4F4A] text-white py-3 rounded-lg font-medium hover:bg-[#463c38] transition-all">Get Started</button>
                </form>
                <p className="mt-6 text-center text-sm text-[#5C4F4A]/60">Already have an account? <Link to="/login" className="text-[#5C766D] font-medium">Sign In</Link></p>
            </div>
        </div>
    );
};

export default Register;