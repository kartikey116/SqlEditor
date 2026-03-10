import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem('css_token');
        const saved = localStorage.getItem('css_user');
        if (token && saved) {
            try { setUser(JSON.parse(saved)); } catch { logout(); }
        }
        setLoading(false);
    }, []);

    const login = useCallback((token, userData) => {
        localStorage.setItem('css_token', token);
        localStorage.setItem('css_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('css_token');
        localStorage.removeItem('css_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
