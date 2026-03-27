// context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_PROFILE_KEY = "ml_user_profile";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      if (payload) {
        const isExpired =
          typeof payload.exp === "number" && payload.exp * 1000 < Date.now();

        if (!isExpired) {
          const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
          if (savedProfile) {
            try {
              setUserState(JSON.parse(savedProfile));
            } catch {
              setUserState({
                id: (payload.sub as string) || "",
                email: (payload.email as string) || "",
              });
            }
          } else {
            setUserState({
              id: (payload.sub as string) || "",
              email: (payload.email as string) || "",
            });
          }
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem(USER_PROFILE_KEY);
        }
      }
    }

    setIsLoading(false);
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem(USER_PROFILE_KEY);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
