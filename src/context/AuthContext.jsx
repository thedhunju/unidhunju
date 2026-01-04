/*User Authentication*/

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Assuming backend has /dashboard or /me endpoint that returns user info
                    // Based on server.js: app.get('/dashboard', authenticateToken...)
                    const { data } = await api.get('/dashboard');
                    // server.js returns { message: "Welcome..." }, unfortunately not user object.
                    // We might need to decode the token for basic info or update backend.
                    // For now, let's decode the token to get user info if the dashboard call succeeds.

                    // Simple token decode (JWT payload)
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser(payload);
                } catch (err) {
                    console.error("Auth check failed", err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/login', { email, password });
            localStorage.setItem('token', data.token);

            const payload = JSON.parse(atob(data.token.split('.')[1]));
            setUser(payload);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data || 'Login failed' };
        }
    };

    const register = async (name, email, password) => {
        try {
            await api.post('/register', { name, email, password });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Use window.location to force refresh/redirect or navigate via router
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

