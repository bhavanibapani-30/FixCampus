import React, { createContext, useContext, useState } from 'react';
import { Storage, authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, showToast }) {
    const [user, setUser] = useState(() => Storage.getUser());
    const [token, setToken] = useState(() => Storage.getToken());
    const [loading] = useState(false);

    const login = async (email, password, adminKey = '') => {
        try {
            const data = await authApi.login(email, password, adminKey);
            Storage.setToken(data.token);
            const userObj = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role
            };
            Storage.setUser(userObj);
            setToken(data.token);
            setUser(userObj);
            showToast(`Welcome back, ${data.name}!`, 'success');
            return userObj;
        } catch (err) {
            showToast(err.message, 'error');
            throw err;
        }
    };

    const register = async (payload) => {
        try {
            const data = await authApi.register(payload);
            Storage.setToken(data.token);
            const userObj = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role
            };
            Storage.setUser(userObj);
            setToken(data.token);
            setUser(userObj);
            const roleName = data.role === 'FACULTY' ? 'Faculty' : data.role === 'TECHNICIAN' ? 'Technician' : 'Student';
            showToast(`Welcome! ${roleName} account created successfully.`, 'success');
            return userObj;
        } catch (err) {
            showToast(err.message, 'error');
            throw err;
        }
    };

    const logout = () => {
        Storage.clear();
        setUser(null);
        setToken(null);
        showToast('Logged out successfully', 'info');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
