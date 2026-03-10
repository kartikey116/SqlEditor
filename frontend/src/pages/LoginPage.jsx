import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';
import './AuthPage.scss';

export default function LoginPage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await loginUser(form);
            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div id="starfield" />
            <div className="orb orb-1" /><div className="orb orb-2" />

            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">⚡</div>
                    <span>Cipher<b>SQL</b>Studio</span>
                </div>
                <h2>Welcome back</h2>
                <p className="auth-sub">Sign in to continue your SQL journey</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="••••••••"
                            value={form.password} onChange={handleChange} required />
                    </div>
                    <button className="auth-submit" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Sign In →'}
                    </button>
                </form>

                <p className="auth-switch">
                    No account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
