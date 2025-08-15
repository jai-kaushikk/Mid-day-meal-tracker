import React, { useState } from 'react';
import axios from 'axios';

// Define the expected shape of the response data
interface AuthResponse {
  token: string;
  is_admin: boolean;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
const LoginForm: React.FC = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        try {
            // Updated API endpoint with the full backend URL
            const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/signin`, { id, password });
            const { token, is_admin } = response.data;

            // Store token and admin status in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('is_admin', JSON.stringify(is_admin));
            localStorage.setItem('user_id', id);

            window.location.href = '/recipe';
        } catch (err) {
            setError('Invalid ID or Password');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, minWidth: 340 }}>
                <h2 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: 32, fontWeight: 700, letterSpacing: 1 }}>Sign In</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <label style={{ fontWeight: 500, color: '#374151' }}>ID</label>
                    <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                        style={{ padding: 10, borderRadius: 8, border: '1px solid #c7d2fe', outline: 'none', fontSize: 16 }}
                    />
                    <label style={{ fontWeight: 500, color: '#374151' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: 10, borderRadius: 8, border: '1px solid #c7d2fe', outline: 'none', fontSize: 16 }}
                    />
                    {error && <p style={{ color: '#ef4444', margin: 0, fontWeight: 500 }}>{error}</p>}
                    <button type="submit" style={{ marginTop: 8, background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}>Sign In</button>
                </form>
            </div>
        </div>
    );
};
export default LoginForm;
