import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ReporterPortal from './components/Reporter/ReporterPortal';
import TechnicianPortal from './components/Technician/TechnicianPortal';
import AdminPortal from './components/Admin/AdminPortal';
import Toast from './components/Toast';

function AppContent({ showToast }) {
    const { user, loading } = useAuth();
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-main)',
                fontFamily: 'inherit'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🛠️</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>Loading FixCampus...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        if (authView === 'register') {
            return (
                <Register
                    onNavigateLogin={() => setAuthView('login')}
                    showToast={showToast}
                />
            );
        }
        return (
            <Login
                onNavigateRegister={() => setAuthView('register')}
                showToast={showToast}
            />
        );
    }

    // Role-based main view
    if (user.role === 'ADMIN') {
        return <AdminPortal showToast={showToast} />;
    }

    if (user.role === 'TECHNICIAN') {
        return <TechnicianPortal showToast={showToast} />;
    }

    // Both STUDENT and FACULTY access ReporterPortal
    return <ReporterPortal showToast={showToast} />;
}

export default function App() {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3800);
    };

    const handleDismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <AuthProvider showToast={showToast}>
            <AppContent showToast={showToast} />
            <Toast toasts={toasts} onDismiss={handleDismissToast} />
        </AuthProvider>
    );
}
