// /mnt/data/AuthContext.jsx  (updated)
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiService from "../services/apiService";
import profileService from "../services/profileService"; // to fetch fresh profile (photo)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photo, setPhoto] = useState(null);
    const [photoObjectUrl, setPhotoObjectUrl] = useState(null); // keep for revoke

    // Revoke helper
    const safeRevoke = (url) => {
        if (url && url.startsWith("blob:")) {
            try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
        }
    };

    // Restore User on Refresh
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken) setToken(storedToken);

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // stored user was saved WITHOUT the raw photo bytes (we remove them on login)
                setUser(parsed);
            } catch (err) {
                console.error("Failed parse stored user", err);
            }
        }

        // If token exists, try to fetch the latest profile (so we can build a Blob URL for photo)
        (async () => {
            if (storedToken) {
                try {
                    const resp = await profileService.getProfile();
                    const data = resp.data || {};
                    if (data.photo) {
                        const bytes = Array.isArray(data.photo) ? data.photo : data.photo.data;
                        if (bytes && bytes.length > 0) {
                            const arr = new Uint8Array(bytes);
                            const mime = data.photoType || "image/jpeg";
                            const blob = new Blob([arr], { type: mime });
                            const url = URL.createObjectURL(blob);
                            safeRevoke(photoObjectUrl);
                            setPhotoObjectUrl(url);
                            setPhoto(url);
                        } else {
                            safeRevoke(photoObjectUrl);
                            setPhoto(null);
                        }
                    } else {
                        safeRevoke(photoObjectUrl);
                        setPhoto(null);
                    }
                } catch (e) {
                    // ignore silently, maybe unauthenticated
                    console.debug("Unable to fetch profile on init", e);
                }
            }
            setLoading(false);
        })();

        // cleanup when context unmounts
        return () => {
            safeRevoke(photoObjectUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Login
    const login = async (email, password) => {
        const data = await apiService.post('/auth/login', { email, password });

        setToken(data.token);
        setUser(data.user);

        // store token and user (BUT remove heavy photo bytes before storing)
        localStorage.setItem("loginTime", Date.now());
        localStorage.setItem('authToken', data.token);

        // Handle photo bytes (if any) -> Blob -> URL and DO NOT persist bytes in localStorage
        if (data.user.photo) {
            const bytes = Array.isArray(data.user.photo) ? data.user.photo : data.user.photo.data;
            if (bytes && bytes.length > 0) {
                const arr = new Uint8Array(bytes);
                const mime = data.user.photoType || "image/jpeg";
                const blob = new Blob([arr], { type: mime });
                const url = URL.createObjectURL(blob);

                // revoke previous if any
                safeRevoke(photoObjectUrl);
                setPhotoObjectUrl(url);
                setPhoto(url);
            } else {
                safeRevoke(photoObjectUrl);
                setPhoto(null);
            }
        } else {
            safeRevoke(photoObjectUrl);
            setPhoto(null);
        }

        // Save user WITHOUT photo bytes (to avoid huge localStorage entries)
        // Create a shallow copy and remove photo data
        const userToStore = { ...data.user };
        if (userToStore.photo) delete userToStore.photo;
        if (userToStore.photoType) delete userToStore.photoType;
        localStorage.setItem('authUser', JSON.stringify(userToStore));

        return data.user;
    };

    // Check Email Exists
    const verifyMail = async (email) => {
        const data = await apiService.get(`/auth/check-email/${email}`);
        return data === 'email-exists';
    };

    // Register
    const register = async (name, email, password) => {
        const data = await apiService.post('/auth/register', { name, email, password });

        if (data.token && data.user) {
            setToken(data.token);
            setUser(data.user);
            setPhoto(null);
            localStorage.setItem("authToken", data.token);
            const userToStore = { ...data.user };
            if (userToStore.photo) delete userToStore.photo;
            if (userToStore.photoType) delete userToStore.photoType;
            localStorage.setItem("authUser", JSON.stringify(userToStore));
        }

        return data.user;
    };

    // Logout
    const logout = async () => {
        setToken(null);
        setUser(null);

        // revoke any blob URL to free memory
        safeRevoke(photoObjectUrl);
        setPhotoObjectUrl(null);
        setPhoto(null);

        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("loginTime");
        try {
            await apiService.get("/auth/logout");
        } catch (e) {
            // ignore network errors on logout
        }
    };

    // Memoized Context
    const value = useMemo(() => ({
        user,
        token,
        loading,
        photo,
        login,
        register,
        logout,
        verifyMail,
        setPhoto
    }), [user, token, loading, photo]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuthContext() {
    return useContext(AuthContext);
}
