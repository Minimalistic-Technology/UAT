"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';

export interface RouteConfig {
    _id: string;
    path: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface RouteContextType {
    routes: RouteConfig[];
    refreshRoutes: () => Promise<void>;
    isRouteActive: (pathPattern: string) => boolean;
}

const RouteContext = createContext<RouteContextType>({
    routes: [],
    refreshRoutes: async () => { },
    isRouteActive: () => true,
});

export const useDynamicRoutes = () => useContext(RouteContext);

export const RouteProvider = ({ children }: { children: React.ReactNode }) => {
    const [routes, setRoutes] = useState<RouteConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    const fetchRoutes = async () => {
        try {
            const { data } = await api.get('/dynamic-routes');
            setRoutes(data);
        } catch (error) {
            console.error("Failed to fetch dynamic routes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, [pathname]);

    // Skip route checking if loading or if it's admin route (to prevent lockout from admin)
    // You cannot block the route checking itself, but you can always allow /admin
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Sort routes by length path descending so that specific routes (e.g. /signup) match before generic routes (e.g. / )
    const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);
    const currentRouteConfig = sortedRoutes.find(r => pathname === r.path || pathname.startsWith(r.path + '/'));

    // If a route exist in DB but is disabled, block it.
    if (currentRouteConfig && !currentRouteConfig.isActive && !pathname.startsWith('/admin')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center p-8">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Route Disabled</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md font-bold text-lg">
                    THIS ROUTE IS TEMPORARILY BLOCKED BY ADMIN
                </p>
                <p className="text-sm text-slate-500 mt-4">{currentRouteConfig.name} is currently offline.</p>
            </div>
        );
    }

    const isRouteActive = (pathPattern: string) => {
        const sorted = [...routes].sort((a, b) => b.path.length - a.path.length);
        const route = sorted.find(r => r.path === pathPattern || pathPattern.startsWith(r.path + '/'));
        // If route does not exist in DB, assume it's active true by default
        return route ? route.isActive : true;
    };

    return (
        <RouteContext.Provider value={{ routes, refreshRoutes: fetchRoutes, isRouteActive }}>
            {children}
        </RouteContext.Provider>
    );
};
