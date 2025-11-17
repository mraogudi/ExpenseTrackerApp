import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiService from "../services/apiService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photo, setPhoto] = useState(null);

    // ------------------------------
    // Restore auth state on refresh
    // ------------------------------
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken) setToken(storedToken);

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Restore profile photo (byte[] → Base64)
            if (parsedUser.photo && Array.isArray(parsedUser.photo) && parsedUser.photo.length > 0) {
                const base64 = byteArrayToBase64(parsedUser.photo);
                setPhoto(`data:image/jpeg;base64,${base64}`);
            }
        }

        setLoading(false);
    }, []);

    // ------------------------------
    // Login User
    // ------------------------------
    const login = async (email, password) => {
        const data = await apiService.post('/auth/login', { email, password });

        setToken(data.token);
        setUser(data.user);

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));

        // Convert backend byte[] → Base64 → image URL
        if (data.user.photo && Array.isArray(data.user.photo) && data.user.photo.length > 0) {
            const base64 = byteArrayToBase64(data.user.photo);
            setPhoto(`data:image/jpeg;base64,${base64}`);
        } else {
            setPhoto(null);
        }

        return data.user;
    };

    // ------------------------------
    // Check Email Exists
    // ------------------------------
    const verifyMail = async (email) => {
        const data = await apiService.get(`/auth/check-email/${email}`);
        return data === 'email-exists';
    };

    // ------------------------------
    // Register User
    // ------------------------------
    const register = async (name, email, password) => {
        const data = await apiService.post('/auth/register', { name, email, password });

        if (data.token && data.user) {
            setToken(data.token);
            setUser(data.user);
            setPhoto(null);

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));

            return data.user;
        }

        return data;
    };

    // ------------------------------
    // Logout
    // ------------------------------
    const logout = async () => {
        const token = localStorage.getItem('authToken');

        await apiService.get(`/auth/logout`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setToken(null);
        setUser(null);
        setPhoto(null);

        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    // ------------------------------
    // Memoized context value
    // ------------------------------
    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            photo,
            login,
            register,
            logout,
            verifyMail
        }),
        [user, token, loading, photo]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------------------
// Custom Hook
// ------------------------------
export function useAuthContext() {
    return useContext(AuthContext);
}

// ------------------------------
// Helper: Byte[] → Base64
// ------------------------------
function byteArrayToBase64(byteArray) {
    const uint8Array = new Uint8Array(byteArray);
    let binary = '';
    uint8Array.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
}
