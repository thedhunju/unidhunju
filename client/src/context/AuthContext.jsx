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
                    // Optimistically set user from token first for speed
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser(payload);

                    // Then fetch fresh data from server to ensure sync
                    // Using /dashboard based on Profile.jsx usage
                    const { data } = await api.get('/dashboard');
                    if (data && data.user) {
                        setUser(prev => ({ ...prev, ...data.user }));
                    }
                } catch (err) {
                    console.error("Auth check failed", err);
                    // If fetching fails but token exists, we might want to keep the token 
                    // or let the interceptor handle 401s. 
                    // For now, if decoding fails, we clear.
                    if (err instanceof SyntaxError) {
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, name, type, password) => {
        try {
            const { data } = await api.post('/auth/kumail', { email, name, type, password });

            if (data.requiresVerification) {
                return { success: true, requiresVerification: true, message: data.message };
            }

            localStorage.setItem('token', data.token);

            const payload = JSON.parse(atob(data.token.split('.')[1]));
            setUser(payload);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Authentication failed';
            const unverified = err.response?.data?.unverified;
            return { success: false, message: errorMessage, unverified };
        }
    };

    const verifyRegister = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-registration', { email, otp });
            localStorage.setItem('token', data.token);
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            setUser(payload);
            return { success: true, message: data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Verification failed';
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    // Helper to refresh user data from token or API if needed
    const refreshUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, verifyRegister, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
