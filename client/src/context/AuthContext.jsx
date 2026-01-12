import { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
    const { getToken, signOut } = useClerkAuth();

    // Map Clerk user to our app's user structure
    const user = clerkUser ? {
        _id: clerkUser.id,
        name: clerkUser.fullName,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        imageUrl: clerkUser.imageUrl
    } : null;

    useEffect(() => {
        const setupAuth = async () => {
            if (clerkUser) {
                try {
                    const token = await getToken();
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (err) {
                    console.error("Failed to get token", err);
                }
            } else {
                delete axios.defaults.headers.common['Authorization'];
            }
        };

        if (isUserLoaded) {
            setupAuth();
        }
    }, [clerkUser, isUserLoaded, getToken]);

    // Backward compatibility helpers
    const login = () => { /* Handled by Clerk */ };
    const register = () => { /* Handled by Clerk */ };
    const logout = () => signOut();

    const loading = !isUserLoaded;

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
