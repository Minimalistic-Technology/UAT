"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Power, Edit, Trash2, Activity, X } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "../components/ToggleSwitch";
import { useDynamicRoutes, RouteConfig } from "@/app/_context/RouteContext";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";

export default function DynamicRoutesPage() {
    const { routes, refreshRoutes } = useDynamicRoutes();
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
    const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);
    const [newRoute, setNewRoute] = useState({ path: "", name: "", description: "", isActive: true });

    const handleAddRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/dynamic-routes', newRoute);
            showToast("Route added", "success");
            setIsAddRouteModalOpen(false);
            setNewRoute({ path: "", name: "", description: "", isActive: true });
            refreshRoutes();
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to add route", "error");
        }
    };

    const handleEditRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRoute) return;
        try {
            await api.put(`/dynamic-routes/${editingRoute._id}`, {
                name: newRoute.name,
                path: newRoute.path,
                description: newRoute.description,
                isActive: newRoute.isActive,
            });
            showToast("Route updated", "success");
            setIsEditRouteModalOpen(false);
            refreshRoutes();
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to update route", "error");
        }
    };

    const handleDeleteRoute = async (id: string) => {
        const ok = await confirm({ message: "Delete this dynamic route?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/dynamic-routes/${id}`);
            showToast("Route deleted", "success");
            refreshRoutes();
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    };

    const handleToggleRoute = async (route: RouteConfig) => {
        try {
            await api.put(`/dynamic-routes/${route._id}`, { isActive: !route.isActive });
            refreshRoutes();
        } catch (err) {
            showToast("Failed to toggle route status", "error");
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Manage global system endpoints and application features.</p>
                    <button
                        onClick={() => {
                            setEditingRoute(null);
                            setNewRoute({ path: "", name: "", description: "", isActive: true });
                            setIsAddRouteModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
                    >
                        <Plus className="size-4" /> Mount Endpoint
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Status</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">System Label</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Network Pattern</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Purpose</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {routes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No active system routes parsed. Mount an endpoint to begin.</td>
                                </tr>
                            ) : (
                                routes.map((route) => (
                                    <tr key={route._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${!route.isActive ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleToggleRoute(route)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${route.isActive ? 'bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50' : 'bg-red-100/50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'}`}
                                            >
                                                <Power className="size-3.5" /> {route.isActive ? 'ONLINE' : 'OFFLINE'}
                                            </button>
                                        </td>
                                        <td className="p-4 font-bold text-slate-900 dark:text-slate-200">{route.name}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md font-mono text-sm text-teal-600 dark:text-teal-400">{route.path}</span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 max-w-xs truncate">{route.description || <span className="italic opacity-50">Core system endpoint</span>}</td>
                                        <td className="p-4 flex gap-2 justify-end">
                                            <button
                                                onClick={() => {
                                                    setEditingRoute(route);
                                                    setNewRoute({ path: route.path, name: route.name, description: route.description, isActive: route.isActive });
                                                    setIsEditRouteModalOpen(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoute(route._id)}
                                                disabled={route.path === '/admin'}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Dynamic Routes Modals */}
            <AnimatePresence>
                {(isAddRouteModalOpen || isEditRouteModalOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="size-5 text-teal-500" />
                                    {isAddRouteModalOpen ? "Mount New Endpoint" : "Reconfigure Endpoint"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddRouteModalOpen(false);
                                        setIsEditRouteModalOpen(false);
                                        setEditingRoute(null);
                                    }}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 rounded-xl transition"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form onSubmit={isAddRouteModalOpen ? handleAddRoute : handleEditRoute} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">System Label</label>
                                            <input
                                                required
                                                type="text"
                                                value={newRoute.name}
                                                onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-900 dark:text-white"
                                                placeholder="e.g. Shop Route"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Network Path</label>
                                            <input
                                                required
                                                type="text"
                                                value={newRoute.path}
                                                onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value })}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-teal-600 dark:text-teal-400"
                                                placeholder="e.g. /shop"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Operational Purpose (Optional)</label>
                                        <textarea
                                            value={newRoute.description}
                                            onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                                            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                                            rows={2}
                                            placeholder="What does this feature do?"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <ToggleSwitch
                                            isOn={newRoute.isActive}
                                            onToggle={() => setNewRoute({ ...newRoute, isActive: !newRoute.isActive })}
                                            label="Boot Endpoint (Active)"
                                            description="If toggled off, this route will be globally dead and return a 403 error."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddRouteModalOpen(false); setIsEditRouteModalOpen(false); }}
                                            className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold transition"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20"
                                        >
                                            {isAddRouteModalOpen ? "Mount Route" : "Commit Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
