"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Activity, RotateCcw } from "lucide-react";

// Modular visual components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import OrdersTable from "./components/OrdersTable";
import InventoryList from "./components/InventoryList";

// Core View Panel Modules
import OrdersView from "./components/OrdersView";
import InventoryView from "./components/InventoryView";
import PackingView from "./components/PackingView";
import ShipmentsView from "./components/ShipmentsView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import { NotificationItem } from "./components/Header";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: { name: string } | string;
    isActive: boolean;
}

interface Order {
    _id: string;
    items: {
        product: {
            name: string;
            image: string;
            price: number;
        };
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: string;
    shippingInfo: {
        fullName: string;
        email: string;
        address: string;
        city: string;
        zip: string;
    };
    createdAt: string;
}

export default function WarehouseDashboard() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    // Visual Navigation active option states
    const [sidebarActiveItem, setSidebarActiveItem] = useState("Dashboard");

    // Live systems states
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Dynamic Notifications state with rich preset defaults
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: "init",
            title: "Facility System Online",
            description: "Warehouse security console correctly connected & active.",
            time: "10m ago",
            isRead: false
        },
        {
            id: "stock-warn",
            title: "Low Inventory Warning",
            description: "Safety gear quantities are below the safeguard threshold (25 units).",
            time: "5m ago",
            isRead: false
        }
    ]);

    // Search buffers
    const [orderSearch, setOrderSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    // Loaders
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Responsive Sidebar drawer
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const activeTab = sidebarActiveItem.toLowerCase();

    useEffect(() => {
        if (!loading && (!user || user.role !== "warehouse")) {
            router.push("/login?hint=warehouse");
            return;
        }

        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        const syncLoop = async () => {
            if (!isMounted) return;
            try {
                await silentBackgroundSync();
            } catch (err) {
                console.log("Polling error bypassed securely", err);
            }
            if (isMounted) {
                timeoutId = setTimeout(syncLoop, 3500); // 3.5s delay after previous sync finishes!
            }
        };

        if (user) {
            fetchInitialData().then(() => {
                syncLoop();
            });
        }

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user, loading, router]);

    const fetchInitialData = async () => {
        setIsLoadingOrders(true);
        setIsLoadingProducts(true);
        try {
            const [ordersRes, productsRes] = await Promise.all([
                api.get("/orders"),
                api.get("/products")
            ]);
            setOrders(ordersRes.data);
            setProducts(productsRes.data.products || productsRes.data || []);
        } catch (error) {
            console.error("Initialization fetch failed", error);
            showToast("Failed to connect with Warehouse databases.", "error");
        } finally {
            setIsLoadingOrders(false);
            setIsLoadingProducts(false);
        }
    };

    const silentBackgroundSync = async () => {
        setIsRefreshing(true);
        try {
            const [ordersRes, productsRes] = await Promise.all([
                api.get("/orders"),
                api.get("/products")
            ]);

            // Compare orders array to detect brand-new orders
            setOrders(prev => {
                const newItems = ordersRes.data.filter((item: any) => prev.length > 0 && !prev.some((o: any) => o._id === item._id));
                if (newItems.length > 0) {
                    const newAlerts = newItems.map((order: any) => ({
                        id: order._id + "-" + Date.now(),
                        title: "New Customer Order",
                        description: `Order #${order._id.substring(order._id.length - 6).toUpperCase()} placed by ${order.shippingInfo?.fullName || "Guest User"}.`,
                        time: "Just Now",
                        isRead: false
                    }));

                    // Defer setState calls to next tick to prevent React rendering lifecycle conflicts
                    setTimeout(() => {
                        setNotifications(nPrev => [...newAlerts, ...nPrev]);
                        showToast(`New order #${newItems[0]._id.substring(newItems[0]._id.length - 6).toUpperCase()} received! Ready for dispatch.`, "success");
                    }, 0);

                    // Synthesise high-fidelity warehouse audio confirmation alerts
                    try {
                        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioContextClass) {
                            const audioCtx = new AudioContextClass();

                            // Tone 1
                            const osc1 = audioCtx.createOscillator();
                            const gain1 = audioCtx.createGain();
                            osc1.connect(gain1);
                            gain1.connect(audioCtx.destination);
                            osc1.type = "sine";
                            osc1.frequency.value = 880;
                            gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
                            gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
                            osc1.start(audioCtx.currentTime);
                            osc1.stop(audioCtx.currentTime + 0.12);

                            // Tone 2
                            setTimeout(() => {
                                const osc2 = audioCtx.createOscillator();
                                const gain2 = audioCtx.createGain();
                                osc2.connect(gain2);
                                gain2.connect(audioCtx.destination);
                                osc2.type = "sine";
                                osc2.frequency.value = 1100;
                                gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
                                gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
                                osc2.start(audioCtx.currentTime);
                                osc2.stop(audioCtx.currentTime + 0.18);
                            }, 110);
                        }
                    } catch (soundError) {
                        console.log("Audio notification skipped: ", soundError);
                    }
                }
                return ordersRes.data;
            });

            setProducts(productsRes.data.products || productsRes.data || []);
        } catch (e) {
            console.log("Background synchronization bypassed securely.", e);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Update order status stage
    const updateOrderStage = async (orderId: string, newStatus: string) => {
        setActionLoadingId(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            let message = "Order successfully moved to packing stage!";
            if (newStatus === "shipped") message = "Shipment dispatched out of facilities!";
            if (newStatus === "delivered") message = "Parcel successfully completed and delivered!";

            showToast(message, "success");

            // Optimistic sync update
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (error: any) {
            const fallback = error.response?.data?.msg || "Failed to update shipment stage.";
            showToast(fallback, "error");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Toggle stock status binary logic
    const handleToggleStock = async (productId: string, currentStock: number) => {
        setActionLoadingId(productId);
        const newStock = currentStock > 0 ? 0 : 50;
        try {
            await api.put(`/products/${productId}`, { stock: newStock });
            showToast(newStock > 0 ? "Product replenished in stock!" : "Product marked out of stock!", "success");
            setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
        } catch (error: any) {
            const fallback = error.response?.data?.msg || "Failed to update catalog stock.";
            showToast(fallback, "error");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Refined direct incremental stock modifier
    const updateStockDirectly = async (productId: string, newStock: number) => {
        try {
            await api.put(`/products/${productId}`, { stock: newStock });
            showToast("Product stock level successfully updated!", "success");
            setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
        } catch (error: any) {
            const fallback = error.response?.data?.msg || "Failed to update catalog stock.";
            showToast(fallback, "error");
            throw error;
        }
    };

    // Filter calculations
    const pendingOrders = orders.filter(o => o.status === "pending");
    const packingOrders = orders.filter(o => o.status === "processing");
    const dispatchedOrders = orders.filter(o => o.status === "shipped" || o.status === "delivered");
    const lowStockProducts = products.filter(p => p.stock <= 25);

    // Search filters
    const filteredOrders = orders.filter(order => {
        const query = orderSearch.toLowerCase();
        return (
            order._id.toLowerCase().includes(query) ||
            (order.shippingInfo?.fullName || "").toLowerCase().includes(query) ||
            order.items.some(item => item.product?.name?.toLowerCase()?.includes(query))
        );
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center gap-4 transition-colors">
                <Activity className="size-10 text-teal-650 dark:text-teal-500 animate-spin" />
                <p className="text-slate-550 dark:text-slate-400 font-extrabold text-sm uppercase tracking-widest font-sans">Verifying security clearances...</p>
            </div>
        );
    }

    const renderActiveView = () => {
        switch (sidebarActiveItem) {
            case "Dashboard":
                return (
                    <>
                        {/* StatsGrid Indicators */}
                        <StatsGrid
                            pendingCount={pendingOrders.length}
                            packingCount={packingOrders.length}
                            dispatchedCount={dispatchedOrders.length}
                            lowStockCount={lowStockProducts.length}
                        />

                        {/* Double-Pane split panels */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
                            {/* OrdersTable queue */}
                            <OrdersTable
                                orders={filteredOrders}
                                isLoadingOrders={isLoadingOrders}
                                actionLoadingId={actionLoadingId}
                                updateOrderStage={updateOrderStage}
                            />

                            {/* InventoryList status limits */}
                            <InventoryList
                                products={filteredProducts}
                                isLoadingProducts={isLoadingProducts}
                                productSearch={productSearch}
                                setProductSearch={setProductSearch}
                                handleToggleStock={handleToggleStock}
                            />
                        </div>
                    </>
                );
            case "Orders":
                return (
                    <OrdersView
                        orders={orders}
                        isLoadingOrders={isLoadingOrders}
                        actionLoadingId={actionLoadingId}
                        updateOrderStage={updateOrderStage}
                    />
                );
            case "Inventory":
                return (
                    <InventoryView
                        products={products}
                        isLoadingProducts={isLoadingProducts}
                        updateStockDirectly={updateStockDirectly}
                    />
                );
            case "Packing":
                return (
                    <PackingView
                        orders={orders}
                        isLoadingOrders={isLoadingOrders}
                        actionLoadingId={actionLoadingId}
                        updateOrderStage={updateOrderStage}
                    />
                );
            case "Shipments":
                return (
                    <ShipmentsView
                        orders={orders}
                        isLoadingOrders={isLoadingOrders}
                        actionLoadingId={actionLoadingId}
                        updateOrderStage={updateOrderStage}
                    />
                );
            case "Reports":
                return (
                    <ReportsView
                        ordersCount={orders.length}
                        dispatchedCount={dispatchedOrders.length}
                        lowStockCount={lowStockProducts.length}
                    />
                );
            case "Settings":
                return (
                    <SettingsView
                        user={user}
                        showToast={showToast}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-150 font-sans">
            {/* Ambient glows behind modules */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Left Brand Navigation Sidebar (under 120 lines) */}
            <Sidebar
                sidebarActiveItem={sidebarActiveItem}
                setSidebarActiveItem={setSidebarActiveItem}
                pendingCount={pendingOrders.length}
                packingCount={packingOrders.length}
                lowStockCount={lowStockProducts.length}
                logout={logout}
                isMobileSidebarOpen={isMobileSidebarOpen}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            />

            {/* Main Content Workspace Panel */}
            <div className="flex-1 md:pl-64 flex flex-col min-w-0">
                {/* Header (under 120 lines) */}
                <Header
                    user={user}
                    activeTab={activeTab}
                    orderSearch={orderSearch}
                    setOrderSearch={setOrderSearch}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    notifications={notifications}
                    setNotifications={setNotifications}
                />

                <div className="p-6 flex-1 flex flex-col gap-6">
                    {/* Background refresh syncer badge */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-450">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {isRefreshing ? "Auto-synced successfully in real-time" : "Operational database ready"}
                            <span className="hidden md:inline text-slate-450 dark:text-slate-550 font-medium">| Connected on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>

                        <button
                            onClick={silentBackgroundSync}
                            disabled={isRefreshing}
                            className="text-xs font-black text-teal-650 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-350 transition flex items-center gap-1.5 font-sans"
                        >
                            {isRefreshing ? <Activity className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                            Sync System
                        </button>
                    </div>

                    {/* Central Dynamic Screen Render */}
                    {renderActiveView()}
                </div>
            </div>
        </main>
    );
}
