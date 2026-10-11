import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isOutsiderDomain } from '../../services/api';

export default function Register({ onNavigateLogin, showToast }) {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [staffKey, setStaffKey] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedName = name.trim();

        if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        // Strict Outsider Barrier
        if (isOutsiderDomain(trimmedEmail)) {
            showToast('Access Denied: Outsiders cannot join. Email must follow official Anurag College format: exactly 10 characters before @anurag.edu.in (e.g. 21H61A0501@anurag.edu.in or faculty001@anurag.edu.in).', 'error');
            return;
        }

        // Technician Staff Verification
        if (role === 'TECHNICIAN' && !staffKey.trim()) {
            showToast('Technician verification key is required to register as campus technician.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            setLoading(true);
            await register({
                name: trimmedName,
                email: trimmedEmail,
                password,
                role,
                department: department.trim() || undefined,
                staffKey: role === 'TECHNICIAN' ? staffKey.trim() : undefined
            });
        } catch {
            // Handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const getSubmitButtonLabel = () => {
        if (loading) return 'Creating Account...';
        if (role === 'FACULTY') return 'Join as Faculty';
        if (role === 'TECHNICIAN') return 'Join as Campus Technician';
        return 'Join as Student';
    };

    return (
        <div className="auth-body">
            <div className="auth-card" style={{ maxWidth: 520 }}>
                <div className="auth-header">
                    <div className="auth-logo">🏛️</div>
                    <h1>College Portal Registration</h1>
                    <p>Exclusively for College Faculty, Students, and Campus Technicians</p>
                </div>

                <div className="auth-content">
                    {/* Outsider Prevention Security Notice Banner */}
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        marginBottom: 22,
                        fontSize: 12,
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        lineHeight: 1.45
                    }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>🛡️</span>
                        <div>
                            <strong>Institutional Access Only:</strong> Outsiders cannot join this platform. Only verified Anurag College members with an authorized email format (<strong>exactly 10 characters before @anurag.edu.in</strong>, e.g. <code>21H61A0501@anurag.edu.in</code> or <code>faculty001@anurag.edu.in</code>) are permitted to create an account.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="role">
                                Select Your Campus Role <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <select
                                id="role"
                                className="form-control"
                                style={{ fontWeight: 600 }}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="STUDENT">🎓 Student (Hostels, Labs, Classrooms)</option>
                                <option value="FACULTY">👨‍🏫 Faculty / Professor (Academic Dept & Lecture Halls)</option>
                                <option value="TECHNICIAN">⚡ Campus Technician (Certified Maintenance Staff)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="name">
                                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                placeholder="e.g. Alex Johnson or Dr. Sharma"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="department">
                                Department / Branch <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                id="department"
                                className="form-control"
                                placeholder="e.g. Computer Science, Mechanical Engineering"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <label className="form-label" htmlFor="email" style={{ marginBottom: 0 }}>
                                    Official College Email <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>
                                    10-Char @anurag.edu.in Required
                                </span>
                            </div>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="e.g. 21H61A0501@anurag.edu.in or faculty001@anurag.edu.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                                ⚠️ Format: exactly 10 characters before @anurag.edu.in. Outsiders are strictly prohibited.
                            </div>
                        </div>

                        {/* Technician Staff Key (Shown only when Technician role is selected) */}
                        {role === 'TECHNICIAN' && (
                            <div className="form-group" style={{
                                background: '#f0fdf4',
                                padding: 14,
                                borderRadius: 8,
                                border: '1px dashed #86efac',
                                marginBottom: 20
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label className="form-label" htmlFor="staffKey" style={{ marginBottom: 0, color: '#166534', fontWeight: 700 }}>
                                        🔑 Technician Staff Key <span style={{ color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                        Verified Personnel
                                    </span>
                                </div>
                                <input
                                    type="password"
                                    id="staffKey"
                                    className="form-control"
                                    placeholder="Enter staff verification key (e.g. CMS-TECH-2026)"
                                    style={{ background: '#ffffff' }}
                                    value={staffKey}
                                    onChange={(e) => setStaffKey(e.target.value)}
                                    required
                                />
                                <div style={{ fontSize: 11, color: '#166534', marginTop: 5 }}>
                                    🔑 Key issued by Facilities Management. Default: <code style={{ fontWeight: 700, color: '#15803d' }}>CMS-TECH-2026</code>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                Password <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                placeholder="At least 6 characters"
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">
                                Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-control"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            id="submit-btn"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700 }}
                            disabled={loading}
                        >
                            {getSubmitButtonLabel()}
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Already have a college account?{' '}
                    <a href="#login" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
                        Sign in here
                    </a>
                </div>
            </div>
        </div>
    );
}
