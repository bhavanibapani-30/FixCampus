import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isOutsiderDomain } from '../../services/api';

export default function Login({ onNavigateRegister, showToast }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [loading, setLoading] = useState(false);

    const showAdminKey = email.toLowerCase().includes('admin');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            showToast('Please enter both email and password', 'error');
            return;
        }

        if (isOutsiderDomain(trimmedEmail)) {
            showToast('Access Denied: Outsiders cannot sign in. Email must follow the official Anurag College format: exactly 10 characters before @anurag.edu.in (e.g. 21H61A0501@anurag.edu.in).', 'error');
            return;
        }

        try {
            setLoading(true);
            await login(trimmedEmail, password, adminKey.trim());
        } catch {
            // Handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleFillDemo = (role) => {
        if (role === 'student') {
            setEmail('21h61a0501@anurag.edu.in');
            setPassword('Student@123');
            setAdminKey('');
        } else if (role === 'faculty') {
            setEmail('faculty001@anurag.edu.in');
            setPassword('Faculty@123');
            setAdminKey('');
        } else if (role === 'tech') {
            setEmail('tech000001@anurag.edu.in');
            setPassword('Tech@123');
            setAdminKey('');
        } else if (role === 'admin') {
            setEmail('admin00001@anurag.edu.in');
            setPassword('Admin@123');
            setAdminKey('CMS-ADMIN-2026');
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🛠️</div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your campus maintenance account</p>
                </div>

                <div className="auth-content">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Campus Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="e.g. 21H61A0501@anurag.edu.in or admin00001@anurag.edu.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {showAdminKey && (
                            <div className="form-group" id="admin-key-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="form-label" htmlFor="adminKey" style={{ marginBottom: 0, color: '#4338ca' }}>
                                        🔐 Admin Management Key <span style={{ fontSize: '11px', color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                        Management Only
                                    </span>
                                </div>
                                <input
                                    type="password"
                                    id="adminKey"
                                    className="form-control"
                                    placeholder="Enter secret admin key (e.g. CMS-ADMIN-2026)"
                                    style={{ borderColor: '#a5b4fc', background: '#fdfefe' }}
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                />
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    🔑 Key required for facility management personnel. Default: <code style={{ color: 'var(--primary)', fontWeight: 700 }}>CMS-ADMIN-2026</code>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            id="submit-btn"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Quick Demo Credentials for Fast Evaluation */}
                    <div className="demo-accounts">
                        <div className="demo-title">⚡ Quick Demo Login Credentials (College Members)</div>
                        <div className="demo-pills" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            <button type="button" className="demo-pill" onClick={() => handleFillDemo('student')}>
                                🎓 Student
                            </button>
                            <button type="button" className="demo-pill" onClick={() => handleFillDemo('faculty')}>
                                👨‍🏫 Faculty
                            </button>
                            <button type="button" className="demo-pill" onClick={() => handleFillDemo('tech')}>
                                ⚡ Tech
                            </button>
                            <button type="button" className="demo-pill" onClick={() => handleFillDemo('admin')}>
                                🛡️ Admin
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            🔒 Institutional Access: Only 10characters@anurag.edu.in allowed. Outsiders are barred.
                        </div>
                    </div>
                </div>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <a href="#register" onClick={(e) => { e.preventDefault(); onNavigateRegister(); }}>
                        Register (Faculty / Student / Tech)
                    </a>
                </div>
            </div>
        </div>
    );
}
