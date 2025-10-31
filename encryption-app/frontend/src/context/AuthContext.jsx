import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Rest of your AuthContext code remains the same...
// import axios from 'axios';

// Create the context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem('token');
        } catch {
            return null;
        }
    });

    const fetchUser = useCallback(async () => {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [logout]);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token, fetchUser]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            
            if (response.data.success) {
                const { token: newToken, user: userData } = response.data;
                localStorage.setItem('token', newToken);
                setToken(newToken);
                setUser(userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post('/api/auth/register', { username, email, password });
            
            if (response.data.success) {
                const { token: newToken, user: userData } = response.data;
                localStorage.setItem('token', newToken);
                setToken(newToken);
                setUser(userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook - MAKE SURE THIS IS EXPORTED
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Default export (optional)
export default AuthContext;