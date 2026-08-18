"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface ComponentSettings {
    Hero?: boolean;
    WhoWeAre?: boolean;
    WhatWeOffer?: boolean;
    FeaturedProducts?: boolean;
    ShopSection?: boolean;
    Contact?: boolean;
    Footer?: boolean;
    Login?: boolean;
    Signup?: boolean;
    [key: string]: boolean | undefined;
}

export interface OnboardingSettings {
    mode: "open" | "closed" | "invite_only" | "admin_approval";
    inviteCode: string;
    closedMessage: string;
}

export interface SiteSettings {
    components: ComponentSettings;
    onboarding?: OnboardingSettings;
}

interface SettingsContextType {
    siteSettings: SiteSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    isComponentEnabled: (componentKey: string) => boolean;
    setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
}

const defaultComponents: ComponentSettings = {
    Hero: true,
    WhoWeAre: true,
    WhatWeOffer: true,
    FeaturedProducts: true,
    ShopSection: true,
    Contact: true,
    Footer: true,
    Login: true,
    Signup: true,
};

const SettingsContext = createContext<SettingsContextType>({
    siteSettings: { components: defaultComponents },
    loading: true,
    refreshSettings: async () => { },
    isComponentEnabled: () => true,
    setSiteSettings: () => { },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>({ components: defaultComponents });
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get("/settings");
            if (res.data) {
                setSiteSettings(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch site settings", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const isComponentEnabled = useCallback(
        (componentKey: string): boolean => {
            if (!siteSettings || !siteSettings.components) return true;
            return siteSettings.components[componentKey] !== false;
        },
        [siteSettings]
    );

    return (
        <SettingsContext.Provider
            value={{
                siteSettings,
                loading,
                refreshSettings: fetchSettings,
                isComponentEnabled,
                setSiteSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
