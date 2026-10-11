import React, { useEffect } from 'react';

export default function UserProfileModal({ isOpen, onClose, onLogout, user }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    const roleConfig = {
        ADMIN: {
            title: 'Facility Administrator',
            tag: '🛡️ ADMIN',
            color: '#4f46e5',
            gradient: 'linear-gradient(135deg, #4f46e5, #ec4899)',
            clearance: 'Full System & Facility Management Access',
            dept: 'Campus Operations & Infrastructure'
        },
        TECHNICIAN: {
            title: 'Certified Field Technician',
            tag: '⚡ TECHNICIAN',
            color: '#0284c7',
            gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            clearance: 'Diagnostic & On-site Maintenance Clearance',
            dept: 'Facility Maintenance & Technical Services'
        },
        FACULTY: {
            title: 'College Faculty Member',
            tag: '👨‍🏫 FACULTY',
            color: '#4338ca',
            gradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
            clearance: 'Academic Faculty Priority Reporting',
            dept: user.department || 'Academic Department'
        },
        STUDENT: {
            title: 'Verified Enrolled Student',
            tag: '🎓 STUDENT',
            color: 'var(--primary)',
            gradient: 'linear-gradient(135deg, var(--primary), #818cf8)',
            clearance: 'Campus Community Ticket Reporting',
            dept: user.department || 'Undergraduate / Postgraduate Studies'
        }
    };

    const currentRole = roleConfig[user.role] || roleConfig.STUDENT;
    const initial = user.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="modal-dialog user-profile-dialog"
                style={{ maxWidth: 540 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header" style={{ padding: '20px 24px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>👤</span>
                        <div>
                            <h3 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>User Profile & Identity</h3>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Institutional Member Account
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        title="Close profile dialog"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ padding: 24 }}>
                    {/* User Hero Banner */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 18,
                            padding: '20px',
                            background: 'var(--bg-main)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border)',
                            marginBottom: 20
                        }}
                    >
                        <div
                            style={{
                                width: 62,
                                height: 62,
                                borderRadius: '50%',
                                background: currentRole.gradient,
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 26,
                                fontWeight: 800,
                                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                                flexShrink: 0
                            }}
                        >
                            {initial}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <h4
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: 'var(--text-main)',
                                        margin: 0
                                    }}
                                >
                                    {user.name}
                                </h4>
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: `${currentRole.color}15`,
                                        color: currentRole.color,
                                        border: `1px solid ${currentRole.color}30`
                                    }}
                                >
                                    {currentRole.tag}
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: 13,
                                    color: 'var(--text-muted)',
                                    marginTop: 4,
                                    wordBreak: 'break-all'
                                }}
                            >
                                ✉️ {user.email}
                            </div>
                        </div>
                    </div>

                    {/* Institutional Verification Status */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 20
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>🛡️</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                                    Verified Institutional Member
                                </div>
                                <div style={{ fontSize: 11, color: '#047857' }}>
                                    Authorized domain: <strong>@anurag.edu.in</strong>
                                </div>
                            </div>
                        </div>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#047857',
                                background: '#d1fae5',
                                padding: '3px 8px',
                                borderRadius: 4
                            }}
                        >
                            Active & Validated
                        </span>
                    </div>

                    {/* Information Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 14,
                            marginBottom: 10
                        }}
                    >
                        <div
                            style={{
                                padding: 12,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Full Name
                            </span>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
                                {user.name}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: 12,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Institutional Email
                            </span>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    marginTop: 2,
                                    wordBreak: 'break-all'
                                }}
                            >
                                {user.email}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: 12,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Role Designation
                            </span>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
                                {currentRole.title}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: 12,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Campus Division / Dept
                            </span>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
                                {currentRole.dept}
                            </div>
                        </div>

                        <div
                            style={{
                                gridColumn: '1 / -1',
                                padding: 12,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Security Clearance & Authorization
                            </span>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>
                                🔒 {currentRole.clearance}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer with Sign Out */}
                <div
                    className="modal-footer"
                    style={{
                        padding: '16px 24px',
                        background: 'var(--bg-main)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 20px',
                            fontWeight: 700
                        }}
                    >
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
