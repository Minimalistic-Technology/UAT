"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdAt?: string;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, redirectUrl?: string) => Promise<void>;
    loginWithGoogle: (credential: string, redirectUrl?: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (error) {
            console.log("No active session");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Clear any old JWT tokens from localStorage since we are now using pure httpOnly cookies
        localStorage.removeItem("token");
        localStorage.removeItem("ddtec_token");
        localStorage.removeItem("ddtec_user");

        // Check session cookie on mount via /me
        checkUser();
    }, []);

    const login = async (email: string, password: string, redirectUrl?: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            setUser(res.data.user);

            if (redirectUrl) {
                router.push(redirectUrl);
                return;
            }

            if (res.data.user.role === 'admin') {
                router.push("/admin");
            } else if (res.data.user.role === 'warehouse') {
                router.push("/warehouse");
            } else {
                router.push("/");
            }
        } catch (error: any) {
            const msg = error.response?.data?.msg || 'Login failed';
            console.warn("Login failed:", msg);
            throw new Error(msg);
        }
    };



    const loginWithGoogle = async (credential: string, redirectUrl?: string) => {
        try {
            const res = await api.post('/auth/google', { credential });

            setUser(res.data.user);

            if (redirectUrl) {
                router.push(redirectUrl);
                return;
            }

            if (res.data.user.role === 'admin') {
                router.push("/admin");
            } else if (res.data.user.role === 'warehouse') {
                router.push("/warehouse");
            } else {
                router.push("/");
            }
        } catch (error: any) {
            const msg = error.response?.data?.msg || 'Google sign-in failed';
            console.warn("Google sign-in failed:", msg);
            throw new Error(msg);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    // Signup logic is now handled directly in app/signup/page.tsx due to complexity (OTP, etc)
    // We keep interface clean.

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
