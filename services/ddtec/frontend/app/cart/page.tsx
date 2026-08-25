"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    ArrowLeft,
    Truck,
    ShieldCheck,
    Tag,
    Check,
    Sparkles,
    Percent,
    RotateCcw,
    Lock,
    PackageCheck,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { useCart } from "../_context/CartContext";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useSettings } from "../_context/SettingsContext";
import api from "@/lib/api";
import DeliveryPincodeChecker from "../_components/DeliveryPincodeChecker";

interface ActiveCoupon {
    _id: string;
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    type?: 'cart' | 'product';
}

export default function CartPage() {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
        subtotal,
        totalPrice,
        applyCoupon,
        removeCoupon,
        appliedCoupon
    } = useCart();

    const { user } = useAuth();
    const { showToast } = useToast();
    const { siteSettings } = useSettings();
    const router = useRouter();

    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
    const [availableCoupons, setAvailableCoupons] = useState<ActiveCoupon[]>([]);
    const [showCouponsDrawer, setShowCouponsDrawer] = useState(false);
    const [showPincodeChecker, setShowPincodeChecker] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        const fetchActiveCoupons = async () => {
            try {
                const res = await api.get('/coupons/active');
                if (Array.isArray(res.data)) {
                    setAvailableCoupons(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch active coupons", error);
            }
        };
        fetchActiveCoupons();
    }, []);

    const handleApplyCoupon = async (codeToApply?: string) => {
        const targetCode = (codeToApply || couponCode).trim().toUpperCase();
        if (!targetCode) return;

        setCouponLoading(true);
        setCouponMessage({ type: '', text: '' });

        try {
            const result = await applyCoupon(targetCode);
            setCouponMessage({
                type: result.success ? 'success' : 'error',
                text: result.message
            });

            if (result.success) {
                setCouponCode("");
                showToast?.(`Coupon "${targetCode}" applied successfully!`, "success");
            } else {
                showToast?.(result.message || "Failed to apply coupon", "error");
            }
        } catch {
            setCouponMessage({ type: 'error', text: "Error applying coupon. Please try again." });
        } finally {
            setCouponLoading(false);
        }
    };

    const validCartItems = cartItems.filter(item => item && item.product);

    // Dynamic Delivery Settings from Admin Config
    const deliveryConfig = siteSettings?.delivery || {
        freeDeliveryThreshold: 500,
        flatDeliveryFee: 50,
        isFreeDeliveryEnabled: true
    };

    const freeDeliveryThreshold = deliveryConfig.freeDeliveryThreshold ?? 500;
    const flatDeliveryFee = deliveryConfig.flatDeliveryFee ?? 50;
    const isFreeDeliveryEnabled = deliveryConfig.isFreeDeliveryEnabled !== false;

    const isFreeDelivery = isFreeDeliveryEnabled && subtotal >= freeDeliveryThreshold;
    const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
    const progressToFreeDelivery = isFreeDeliveryEnabled ? Math.min(100, (subtotal / freeDeliveryThreshold) * 100) : 0;
    const currentDeliveryFee = isFreeDelivery ? 0 : flatDeliveryFee;
    const grandTotal = totalPrice + currentDeliveryFee;

    // Total units count
    const totalItemsCount = validCartItems.reduce((acc, item) => acc + item.quantity, 0);

    if (loading) {
        return (
            <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                <div className="relative flex items-center justify-center">
                    <div className="size-16 rounded-full border-4 border-teal-500/20 border-t-teal-600 animate-spin" />
                    <ShoppingBag className="size-6 text-teal-600 absolute animate-pulse" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your shopping cart...</p>
            </div>
        );
    }

    if (validCartItems.length === 0) {
        return (
            <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center"
                >
                    <div className="size-24 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900/50 flex items-center justify-center mx-auto mb-6 text-teal-600 dark:text-teal-400">
                        <ShoppingBag className="size-12 stroke-[1.5]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                        Your Cart is Empty
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Looks like you haven't added any products to your cart yet. Explore our professional catalog to find what you need.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/shop"
                            className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 group"
                        >
                            <Sparkles className="size-4" /> Start Shopping
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/quotation"
                            className="w-full py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            Generate Custom Quotation
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="max-w-7xl mx-auto">
                {/* Header with Navigation & Clear Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            <Link href="/shop" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
                                <ArrowLeft className="size-3" /> Shop
                            </Link>
                            <span>/</span>
                            <span className="text-slate-900 dark:text-white">Cart</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Shopping Cart
                            </h1>
                            <span className="px-3 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
                                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/shop"
                            className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5"
                        >
                            Continue Shopping <ChevronRight className="size-4" />
                        </Link>

                        {isClearing ? (
                            <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-950/30 p-1 rounded-lg border border-red-200 dark:border-red-800">
                                <span className="text-red-600 dark:text-red-400 font-medium px-1">Clear all?</span>
                                <button
                                    onClick={() => { clearCart(); setIsClearing(false); showToast?.("Cart cleared", "info"); }}
                                    className="px-2 py-0.5 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setIsClearing(false)}
                                    className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium"
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsClearing(true)}
                                className="text-xs font-semibold text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Empty entire cart"
                            >
                                <Trash2 className="size-3.5" /> Clear Cart
                            </button>
                        )}
                    </div>
                </div>

                {/* Free Delivery Banner (Only shown when Free Delivery tier is enabled) */}
                {isFreeDeliveryEnabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs overflow-hidden relative"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl ${isFreeDelivery ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'}`}>
                                    <Truck className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {isFreeDelivery ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                🎉 You've unlocked FREE Express Delivery!
                                            </span>
                                        ) : (
                                            <span>
                                                Add <strong className="text-teal-600 dark:text-teal-400">₹{remainingForFreeDelivery.toFixed(2)}</strong> more to get <strong className="text-emerald-600 dark:text-emerald-400">Free Delivery</strong>
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Orders above ₹{freeDeliveryThreshold} ship completely free across India
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-900 self-start sm:self-auto">
                                {Math.round(progressToFreeDelivery)}% unlocked
                            </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToFreeDelivery}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full rounded-full ${isFreeDelivery ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {validCartItems.map((item) => {
                                const productPrice = item.product.price || 0;
                                const originalPrice = (item.product.discountPercentage && item.product.discountPercentage > 0)
                                    ? Math.round(productPrice / (1 - item.product.discountPercentage / 100))
                                    : null;
                                const lineTotal = productPrice * item.quantity;

                                return (
                                    <motion.div
                                        key={item._id || item.product._id}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 relative group"
                                    >
                                        {/* Product Thumbnail */}
                                        <Link
                                            href={`/product/${item.product._id}`}
                                            className="w-full sm:w-28 h-28 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative border border-slate-200/60 dark:border-slate-700/60 group-hover:border-teal-500/50 transition-colors"
                                        >
                                            {item.product.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <ShoppingBag className="size-8 text-slate-300 dark:text-slate-600" />
                                            )}

                                            {item.product.discountPercentage && item.product.discountPercentage > 0 && (
                                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-rose-500 text-white font-extrabold text-[10px] rounded-md shadow-xs">
                                                    -{item.product.discountPercentage}%
                                                </span>
                                            )}
                                        </Link>

                                        {/* Product Details & Actions */}
                                        <div className="flex-1 flex flex-col justify-between gap-3">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <Link
                                                        href={`/product/${item.product._id}`}
                                                        className="font-bold text-slate-900 dark:text-white text-base hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2"
                                                    >
                                                        {item.product.name}
                                                    </Link>

                                                    <button
                                                        onClick={() => {
                                                            removeFromCart(item.product._id);
                                                            showToast?.(`Removed ${item.product.name} from cart`, "info");
                                                        }}
                                                        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex-shrink-0"
                                                        title="Remove product"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>

                                                {/* Unit Pricing */}
                                                <div className="flex items-baseline gap-2 mt-1.5">
                                                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                                                        ₹{productPrice.toLocaleString("en-IN")}
                                                    </span>
                                                    {originalPrice && (
                                                        <span className="text-xs text-slate-400 line-through font-mono">
                                                            ₹{originalPrice.toLocaleString("en-IN")}
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">/ unit</span>
                                                </div>

                                                {/* Coupon badge if available */}
                                                {item.product.couponCode && (
                                                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                                                        <Tag className="size-3" /> Eligible for {item.product.couponCode}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity Stepper & Line Total */}
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                                {/* Quantity Pill */}
                                                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-0.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                                                        disabled={item.quantity <= 1}
                                                        className="size-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="size-3.5" />
                                                    </button>

                                                    <span className="w-9 text-center font-bold text-sm text-slate-900 dark:text-white font-mono">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                        className="size-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="size-3.5" />
                                                    </button>
                                                </div>

                                                {/* Item Subtotal */}
                                                <div className="text-right">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Total</span>
                                                    <span className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono">
                                                        ₹{lineTotal.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Order Summary & Checkout */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm sticky top-28 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Order Summary
                                </h2>
                                <span className="text-xs font-semibold text-slate-400">
                                    {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            {/* Coupon Section */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Apply Promo Coupon
                                </label>

                                {appliedCoupon ? (
                                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                                                <Tag className="size-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-200 uppercase font-mono">
                                                        {appliedCoupon.code}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                                                        Applied
                                                    </span>
                                                </div>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                                                    You saved ₹{appliedCoupon.discountAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                removeCoupon();
                                                showToast?.("Coupon removed", "info");
                                            }}
                                            className="text-xs font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Remove coupon"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                                                    placeholder="Enter coupon code"
                                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono text-sm font-semibold uppercase placeholder:normal-case placeholder:font-normal outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleApplyCoupon()}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {couponLoading ? "..." : "Apply"}
                                            </button>
                                        </div>

                                        {couponMessage.text && (
                                            <p className={`text-xs font-medium ${couponMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                {couponMessage.text}
                                            </p>
                                        )}

                                        {/* Available Coupons Drawer Toggle */}
                                        {availableCoupons.length > 0 && (
                                            <div>
                                                <button
                                                    onClick={() => setShowCouponsDrawer(!showCouponsDrawer)}
                                                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    <Sparkles className="size-3" />
                                                    {showCouponsDrawer ? "Hide available offers" : `View available offers (${availableCoupons.length})`}
                                                </button>

                                                <AnimatePresence>
                                                    {showCouponsDrawer && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
                                                        >
                                                            {availableCoupons.map((c) => (
                                                                <div
                                                                    key={c._id}
                                                                    className="p-2.5 rounded-xl border border-dashed border-teal-300 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/20 flex items-center justify-between gap-2"
                                                                >
                                                                    <div>
                                                                        <span className="font-mono font-black text-xs text-teal-800 dark:text-teal-300 uppercase">
                                                                            {c.code}
                                                                        </span>
                                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                                                                            {c.minOrderValue ? ` on ₹${c.minOrderValue}+` : ''}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleApplyCoupon(c.code)}
                                                                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pincode Checker Toggle */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                <button
                                    onClick={() => setShowPincodeChecker(!showPincodeChecker)}
                                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Truck className="size-3.5 text-teal-600" /> Check Delivery Speed & Availability
                                    </span>
                                    <span className="text-[11px] text-teal-600">{showPincodeChecker ? 'Hide' : 'Check'}</span>
                                </button>

                                <AnimatePresence>
                                    {showPincodeChecker && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden pt-3"
                                        >
                                            <DeliveryPincodeChecker compact />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Calculation Rows */}
                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Items Subtotal</span>
                                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                        ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {appliedCoupon && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Tag className="size-3.5" /> Discount ({appliedCoupon.code})
                                        </span>
                                        <span className="font-mono font-bold">
                                            -₹{appliedCoupon.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-slate-600 dark:text-slate-400 items-center">
                                    <span className="flex items-center gap-1">
                                        Delivery Charges
                                    </span>
                                    {isFreeDelivery ? (
                                        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                            FREE
                                        </span>
                                    ) : (
                                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                            ₹{flatDeliveryFee.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex justify-between items-baseline">
                                    <div>
                                        <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                                            Total Amount
                                        </span>
                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                            Inclusive of all applicable GST & taxes
                                        </span>
                                    </div>
                                    <span className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tracking-tight">
                                        ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Call To Action */}
                            <Link
                                href="/checkout"
                                className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 group"
                            >
                                <Lock className="size-4" /> Proceed to Checkout
                                <ArrowRight className="size-5 group-hover:translate-x-1.5 transition-transform" />
                            </Link>

                            {/* Trust Guarantee Badges */}
                            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                    <span>256-bit SSL Secure</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <PackageCheck className="size-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                    <span>Genuine Products</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
