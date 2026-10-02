"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../_context/AuthContext";
import { useCart } from "../../_context/CartContext";
import { useToast } from "../../_context/ToastContext";
import {
    Loader2,
    Star,
    ShoppingBag,
    Truck,
    ShieldCheck,
    ArrowLeft,
    Tag,
    Layers,
    TrendingUp,
    X,
    Maximize2,
    MessageCircle,
    Clock,
    Calendar,
    RefreshCw,
    Copy,
    Check,
    Heart,
    Share2,
    Link2,
    ChevronRight,
    Info,
    Sparkles,
    CheckCircle2,
    PackageCheck,
    Download,
    Ban,
    Trash2,
    Edit3
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { SITE_CONFIG, buildWhatsAppLink, buildWhatsAppShareLink } from "@/lib/constants";
import { useDynamicRoutes } from "../../_context/RouteContext";
import DeliveryPincodeChecker from "../../_components/DeliveryPincodeChecker";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    costPrice?: number;
    image: string;
    category: string | { _id: string; name: string };
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    brand?: string;
    modelName?: string;
    packQuantity?: number;
    packUnit?: string;
    unitSize?: number;
    unitMeasure?: string;
    showAddToCart?: boolean;
    showBuyNow?: boolean;
    couponCode?: string;
    discountPercentage?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    images?: string[];
    cgst?: number;
    sgst?: number;
    isActive?: boolean;
    productType?: 'physical' | 'digital';
    isReturnable?: boolean;
    showDeliveryChecker?: boolean;
    allowedCourierPartners?: string[];
    customDeliveryEstimate?: string;
    codAvailable?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface Review {
    _id: string;
    product: string;
    user: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const { addToCart, cartItems } = useCart();
    const { showToast } = useToast();
    const { isRouteActive } = useDynamicRoutes();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'shipping' | 'reviews'>('overview');

    // Reviews & Ratings
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, couponsRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get('/coupons/active')
                ]);

                setProduct(productRes.data);
                if (productRes.data.images && productRes.data.images.length > 0) {
                    setSelectedImage(productRes.data.images[0]);
                } else {
                    setSelectedImage(productRes.data.image);
                }

                // Filter applicable coupons
                const allCoupons = couponsRes.data || [];
                const activeCoupons = allCoupons.filter((c: any) => {
                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                    return (
                        c.type === 'product' &&
                        c.isActive &&
                        !isExpired &&
                        c.applicableProducts &&
                        c.applicableProducts.some((ap: any) => ap._id === id || ap === id)
                    );
                });
                setCoupons(activeCoupons);

            } catch (error) {
                console.error("Failed to fetch product or coupons", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/product/${id}`);
            setReviews(data || []);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchReviews();
        }
    }, [id]);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    }, []);

    useEffect(() => {
        const fetchMyReview = async () => {
            if (!id || !user) {
                setMyReview(null);
                return;
            }
            try {
                const { data } = await api.get(`/reviews/product/${id}/mine`);
                setMyReview(data || null);
            } catch (error) {
                console.error("Failed to fetch your review", error);
            }
        };
        fetchMyReview();
    }, [id, user]);

    const openReviewForm = () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname || `/product/${id}`)}`);
            return;
        }
        setReviewRating(myReview?.rating || 0);
        setReviewComment(myReview?.comment || "");
        setIsReviewFormOpen(true);
    };

    const handleSubmitReview = async () => {
        if (reviewRating < 1 || reviewRating > 5) {
            showToast?.("Please select a star rating", "error");
            return;
        }
        setSubmittingReview(true);
        try {
            await api.post(`/reviews/product/${id}`, { rating: reviewRating, comment: reviewComment });
            showToast?.(myReview ? "Review updated successfully!" : "Review submitted successfully!", "success");
            setIsReviewFormOpen(false);
            await Promise.all([
                fetchReviews(),
                api.get(`/products/${id}`).then(res => setProduct(res.data)),
                api.get(`/reviews/product/${id}/mine`).then(res => setMyReview(res.data || null))
            ]);
        } catch (error: any) {
            console.error("Failed to submit review", error);
            showToast?.(error.response?.data?.msg || "Failed to submit review.", "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        setDeletingReviewId(reviewId);
        try {
            await api.delete(`/reviews/${reviewId}`);
            showToast?.("Review deleted", "success");
            setMyReview(null);
            await Promise.all([
                fetchReviews(),
                api.get(`/products/${id}`).then(res => setProduct(res.data))
            ]);
        } catch (error: any) {
            console.error("Failed to delete review", error);
            showToast?.(error.response?.data?.msg || "Failed to delete review.", "error");
        } finally {
            setDeletingReviewId(null);
        }
    };

    const formatReviewAge = (dateString: string) => {
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "";
            const diffMs = Date.now() - d.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return "";
        }
    };

    // Date & Time formatting helpers
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "N/A";
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "N/A";
            return d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
        } catch {
            return "N/A";
        }
    };

    const getRelativeTime = (dateString?: string) => {
        if (!dateString) return "Recently updated";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "Recently updated";
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 5) return "Just updated";
            if (diffMins < 60) return `Updated ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `Updated ${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 30) return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            return `Updated on ${formatDate(dateString)}`;
        } catch {
            return "Recently updated";
        }
    };

    const handleAddToCart = async () => {
        if (!product || quantity <= 0) return;
        try {
            await addToCart(product._id, quantity);
            setQuantity(1); // Reset quantity selector back to default
        } catch {
            showToast?.("Failed to add product to cart", "error");
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;
        try {
            const isAlreadyInCart = cartItems.some(
                item => item.product?._id === product._id || (typeof item.product === 'string' && item.product === product._id)
            );

            // If product is not yet in cart, add it before redirecting
            if (!isAlreadyInCart && quantity > 0) {
                await addToCart(product._id, quantity);
            }

            router.push('/cart');
        } catch {
            showToast?.("Failed to process Buy Now request", "error");
        }
    };

    const handleCopyCoupon = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCoupon(code);
        showToast?.(`Coupon code ${code} copied to clipboard!`, "success");
        setTimeout(() => setCopiedCoupon(null), 2500);
    };

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        showToast?.(
            !isWishlisted ? `${product?.name} added to Wishlist` : `${product?.name} removed from Wishlist`,
            !isWishlisted ? "success" : "info"
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
                <Loader2 className="animate-spin text-teal-600 size-12" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Product Not Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">The product you are looking for might have been moved or removed.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
                        <ArrowLeft className="size-4" /> Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const categoryName = typeof product.category === 'object' ? product.category.name : product.category;
    const createdAtDate = product.createdAt ? formatDate(product.createdAt) : "N/A";
    const isDigital = product.productType === 'digital';
    const isReturnable = product.isReturnable !== false;
    const showDeliveryChecker = !isDigital && product.showDeliveryChecker !== false;
    const deliveryCheckerProps = {
        codAvailable: product.codAvailable !== false,
        allowedPartners: product.allowedCourierPartners,
        customEstimateMessage: product.customDeliveryEstimate || undefined
    };

    const hasDiscount = (product.discountPercentage && product.discountPercentage > 0) || (product.discountValue && product.discountValue > 0);
    const originalPrice = hasDiscount
        ? product.discountValue
            ? product.price + product.discountValue
            : Math.round(product.price / (1 - (product.discountPercentage || 0) / 100))
        : null;

    return (
        <section className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 overflow-x-auto py-2">
                    <Link href="/" className="hover:text-teal-600 transition-colors shrink-0">Home</Link>
                    <ChevronRight className="size-3.5 shrink-0" />
                    <Link href="/shop" className="hover:text-teal-600 transition-colors shrink-0">Shop</Link>
                    <ChevronRight className="size-3.5 shrink-0" />
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300 shrink-0">{categoryName}</span>
                    <ChevronRight className="size-3.5 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">{product.name}</span>
                </nav>



                {/* Main Product Display Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                        {/* Left Column: Image Gallery (5 cols) */}
                        <div className="lg:col-span-5 bg-slate-100/80 dark:bg-slate-900/60 p-6 lg:p-8 flex flex-col justify-between relative group border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">

                            {/* Stock status overlay tag */}
                            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                {product.stock === 0 ? (
                                    <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-md">
                                        Sold Out
                                    </span>
                                ) : product.stock < 5 ? (
                                    <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-md animate-pulse">
                                        Only {product.stock} Left!
                                    </span>
                                ) : (
                                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                                        <CheckCircle2 className="size-3.5" /> In Stock
                                    </span>
                                )}
                            </div>

                            {/* Wishlist & Share floating action buttons */}
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <div className="relative group/tip">
                                    <button
                                        onClick={toggleWishlist}
                                        title="Add to Wishlist"
                                        className={`p-2.5 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${isWishlisted ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500' : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-rose-500'}`}
                                    >
                                        <Heart className={`size-5 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
                                    </button>
                                    <span className="pointer-events-none absolute top-full right-0 mt-2 whitespace-nowrap rounded-md bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-medium px-2.5 py-1.5 opacity-0 translate-y-1 group-hover/tip:opacity-100 group-hover/tip:translate-y-0 transition-all duration-200 shadow-lg z-30">
                                        {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                    </span>
                                </div>
                                <div className="relative group/tip">
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: product.name,
                                                    text: `Check out ${product.name} on DDTEC`,
                                                    url: window.location.href,
                                                }).catch(() => { });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                showToast?.("Product link copied to clipboard!", "info");
                                            }
                                        }}
                                        title={canNativeShare ? "Share Product" : "Copy Product Link"}
                                        className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-md backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-all cursor-pointer"
                                    >
                                        {canNativeShare ? <Share2 className="size-5" /> : <Link2 className="size-5" />}
                                    </button>
                                    <span className="pointer-events-none absolute top-full right-0 mt-2 whitespace-nowrap rounded-md bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-medium px-2.5 py-1.5 opacity-0 translate-y-1 group-hover/tip:opacity-100 group-hover/tip:translate-y-0 transition-all duration-200 shadow-lg z-30">
                                        {canNativeShare ? "Share this product" : "Copy link to this product"}
                                    </span>
                                </div>
                            </div>

                            {/* Main Hero Image */}
                            <div className="flex-1 flex items-center justify-center py-6 min-h-[320px] sm:min-h-[420px] relative">
                                <motion.div
                                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    <motion.img
                                        key={selectedImage}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        src={selectedImage ? (selectedImage.startsWith('http') || selectedImage.startsWith('/') ? selectedImage : `/${selectedImage}`) : (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`)}
                                        alt={product.name}
                                        className={`max-h-[380px] w-auto object-contain drop-shadow-xl transition-all duration-300 ${product.stock === 0 ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                                    />

                                    <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                        <Maximize2 className="size-3.5" /> Click to expand
                                    </div>
                                </motion.div>
                            </div>

                            {/* Image Thumbnails Strip */}
                            {product.images && product.images.length > 0 && (
                                <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 overflow-x-auto py-2">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative rounded-xl overflow-hidden border-2 transition-all w-16 h-16 shrink-0 bg-white dark:bg-slate-800 ${selectedImage === img ? 'border-teal-600 ring-2 ring-teal-600/30 opacity-100 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'}`}
                                        >
                                            <img
                                                src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                                                alt={`${product.name} thumbnail ${idx + 1}`}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Product Info & Actions (7 cols) */}
                        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                            <div>
                                {/* Brand, Category & Model Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-teal-200 dark:border-teal-800">
                                        {categoryName}
                                    </span>

                                    {product.brand && (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-600">
                                            <Tag className="size-3 text-teal-600 dark:text-teal-400" /> {product.brand}
                                        </span>
                                    )}

                                    {product.modelName && (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-600">
                                            <Layers className="size-3 text-teal-600 dark:text-teal-400" /> Model: {product.modelName}
                                        </span>
                                    )}

                                    {!!product.unitMeasure && (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-600">
                                            {product.packQuantity || 1} {product.packUnit || 'Piece'} &times; {product.unitSize || 0} {product.unitMeasure}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
                                    {product.name}
                                </h1>

                                {/* Rating, Reviews & Bestseller Info */}
                                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/80">
                                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`size-4 ${i < Math.floor(product.rating || 0) ? "fill-current text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-amber-800 dark:text-amber-300 font-bold text-xs">
                                            {(product.rating || 0).toFixed(1)}
                                        </span>
                                        <span className="text-slate-400 text-xs">•</span>
                                        <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                                            {product.numReviews || 0} review{product.numReviews === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    {product.lastMonthSales > 0 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                            <TrendingUp className="size-3.5" />
                                            {product.lastMonthSales} sold this month
                                        </div>
                                    )}

                                    {product.lastMonthSales > 30 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold border border-purple-200 dark:border-purple-800">
                                            <Sparkles className="size-3.5" />
                                            Top Rated
                                        </div>
                                    )}
                                </div>

                                {/* Price Box & Coupons */}
                                <div className="mb-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-600/80 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Price</span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                                                ₹{product.price.toLocaleString("en-IN")}
                                            </span>

                                            {originalPrice && originalPrice > product.price && (
                                                <>
                                                    <span className="text-lg text-slate-400 line-through">
                                                        ₹{originalPrice.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-extrabold rounded-lg border border-rose-200 dark:border-rose-800">
                                                        {product.discountPercentage ? `${product.discountPercentage}% OFF` : `₹${product.discountValue} OFF`}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {(product.cgst || product.sgst) ? (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                                Inclusive of all taxes ({((product.cgst || 0) + (product.sgst || 0))}% GST)
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                                Inclusive of all applicable taxes
                                            </p>
                                        )}
                                    </div>

                                    {coupons.length > 0 && (
                                        <button
                                            onClick={() => setIsCouponModalOpen(true)}
                                            className="px-4 py-2.5 bg-teal-600/10 dark:bg-teal-400/10 hover:bg-teal-600/20 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl border border-teal-500/30 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                                        >
                                            <Tag className="size-4 text-teal-600 dark:text-teal-400 animate-bounce" />
                                            <span>{coupons.length} {coupons.length === 1 ? 'Coupon' : 'Coupons'} Available</span>
                                        </button>
                                    )}
                                </div>

                                {/* Short Description */}
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-4">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Delivery & Pincode Checker */}
                                {showDeliveryChecker && (
                                    <div className="mb-6">
                                        <DeliveryPincodeChecker {...deliveryCheckerProps} />
                                    </div>
                                )}

                            </div>

                            {/* Action Toolbar */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700/80 space-y-4">
                                {/* Quantity Selector & Stock Indicator */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Qty:</span>
                                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1 || product.stock === 0}
                                                className="px-3.5 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 font-bold text-sm text-slate-900 dark:text-white">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                                disabled={quantity >= product.stock || product.stock === 0}
                                                className="px-3.5 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Price:</span>
                                        <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                            ₹{(product.price * quantity).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {isRouteActive('/cart') && product.showAddToCart !== false && (
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.stock === 0}
                                            className={`py-3.5 px-6 rounded-xl font-bold border-2 border-teal-600 text-teal-600 dark:border-teal-500 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${(!isRouteActive('/checkout') || product.showBuyNow === false) ? 'sm:col-span-2' : ''}`}
                                        >
                                            <ShoppingBag className="size-5" /> Add to Cart
                                        </button>
                                    )}

                                    {isRouteActive('/checkout') && product.showBuyNow !== false && (
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={product.stock === 0}
                                            className={`py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${(!isRouteActive('/cart') || product.showAddToCart === false) ? 'sm:col-span-2' : ''}`}
                                        >
                                            <PackageCheck className="size-5" /> Buy Now
                                        </button>
                                    )}
                                </div>

                                {/* WhatsApp Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            const chatMsg = `Hi! I'm interested in this product:\n*${product.name}*\n\nCould you share more details?`;
                                            window.open(buildWhatsAppLink(chatMsg), '_blank');
                                        }}
                                        className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="size-5" /> Chat on WhatsApp
                                    </button>

                                    <button
                                        onClick={() => {
                                            const shareMsg = `Hi! Check out this product on ${SITE_CONFIG.name}:\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\n\nView here: ${window.location.href}`;
                                            window.open(buildWhatsAppShareLink(shareMsg), '_blank');
                                        }}
                                        className="w-full py-3 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="size-5" /> Share on WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Extended Details Tabs Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden mb-12">

                    {/* Tab Bar */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === 'overview' ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <Info className="size-4" /> Overview & Highlights
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === 'specs' ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <Layers className="size-4" /> Complete Specifications
                        </button>
                        {!isDigital && (
                            <button
                                onClick={() => setActiveTab('shipping')}
                                className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === 'shipping' ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                <Truck className="size-4" /> Delivery & Warranty
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <Star className="size-4" /> Customer Reviews ({product.numReviews || 0})
                        </button>
                    </div>

                    {/* Tab Content Panels */}
                    <div className="p-6 sm:p-8">

                        {/* Tab 1: Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Product Description</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 flex items-start gap-3">
                                        <div className="p-2.5 bg-teal-600 text-white rounded-xl">
                                            <ShieldCheck className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Original Guarantee</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">100% genuine product sourced directly from brand manufacturer.</p>
                                        </div>
                                    </div>

                                    {isDigital ? (
                                        <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 flex items-start gap-3">
                                            <div className="p-2.5 bg-violet-600 text-white rounded-xl">
                                                <Download className="size-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Instant Digital Delivery</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No physical shipping — access is delivered instantly after purchase.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3">
                                            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                                <Truck className="size-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Express Shipping</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fast doorstep delivery within 3-5 business days.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-start gap-3">
                                        <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                                            <Clock className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Real-time Stock</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Inventory and price updated live in real time.</p>
                                        </div>
                                    </div>

                                    {!isReturnable && (
                                        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 flex items-start gap-3">
                                            <div className="p-2.5 bg-rose-600 text-white rounded-xl">
                                                <Ban className="size-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Non-Returnable</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This product is not eligible for return or refund once purchased.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Full Specifications Matrix including Last Updated Time & Date */}
                        {activeTab === 'specs' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Technical Specifications & Audit Info</h3>
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-slate-50 dark:bg-slate-900/50 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Product ID / SKU</span>
                                        <span className="sm:col-span-2 font-mono text-slate-800 dark:text-slate-200">{product._id}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Product Name</span>
                                        <span className="sm:col-span-2 font-semibold text-slate-900 dark:text-white">{product.name}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-slate-50 dark:bg-slate-900/50 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Brand</span>
                                        <span className="sm:col-span-2 text-slate-800 dark:text-slate-200">{product.brand || "Standard Brand"}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Model Name</span>
                                        <span className="sm:col-span-2 text-slate-800 dark:text-slate-200">{product.modelName || "N/A"}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-slate-50 dark:bg-slate-900/50 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Category</span>
                                        <span className="sm:col-span-2 text-slate-800 dark:text-slate-200 capitalize">{categoryName}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Stock Availability</span>
                                        <span className="sm:col-span-2 font-semibold text-teal-600 dark:text-teal-400">
                                            {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-slate-50 dark:bg-slate-900/50 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Applicable Taxes</span>
                                        <span className="sm:col-span-2 text-slate-800 dark:text-slate-200">
                                            CGST: {product.cgst || 0}% | SGST: {product.sgst || 0}% (Total GST: {((product.cgst || 0) + (product.sgst || 0))}%)
                                        </span>
                                    </div>


                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 bg-slate-50 dark:bg-slate-900/50 text-sm">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">Product Added Date</span>
                                        <span className="sm:col-span-2 text-slate-800 dark:text-slate-200">{createdAtDate}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Shipping & Returns */}
                        {activeTab === 'shipping' && !isDigital && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Shipping & Courier Logistics</h3>

                                {showDeliveryChecker ? (
                                    <DeliveryPincodeChecker {...deliveryCheckerProps} />
                                ) : (
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                                        PIN code delivery check is not applicable for this product.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                        <Truck className="size-8 text-teal-600 mb-3" />
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">Blue Dart &amp; DTDC Express Network</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Orders dispatched daily via Blue Dart Apex air priority and DTDC Express. Doorstep transit tracked in real-time across 55,000+ PIN codes.
                                        </p>
                                    </div>

                                    {isReturnable ? (
                                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                            <ShieldCheck className="size-8 text-emerald-600 mb-3" />
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">10-Day Replacement Guarantee</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                If your product arrives damaged or defective, easily initiate a hassle-free replacement within 10 days.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                                            <Ban className="size-8 text-rose-600 mb-3" />
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Non-Returnable &amp; Non-Refundable</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                This product cannot be returned, replaced, or refunded once delivered, except in case of a valid warranty claim.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                            {(product.rating || 0).toFixed(1)} <span className="text-lg text-slate-400 font-normal">/ 5</span>
                                        </div>
                                        <div className="flex text-amber-400 my-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`size-4 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Based on {product.numReviews || 0} customer rating{product.numReviews === 1 ? '' : 's'}</p>
                                    </div>

                                    <button
                                        onClick={openReviewForm}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                                    >
                                        {myReview ? <><Edit3 className="size-3.5" /> Edit Your Review</> : "Write a Review"}
                                    </button>
                                </div>

                                {/* Review Form */}
                                <AnimatePresence>
                                    {isReviewFormOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Your Rating</p>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setReviewRating(star)}
                                                                onMouseEnter={() => setHoveredStar(star)}
                                                                onMouseLeave={() => setHoveredStar(0)}
                                                                className="p-0.5"
                                                            >
                                                                <Star
                                                                    className={`size-7 transition-colors ${star <= (hoveredStar || reviewRating) ? 'fill-current text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Your Review (optional)</p>
                                                    <textarea
                                                        value={reviewComment}
                                                        onChange={(e) => setReviewComment(e.target.value)}
                                                        maxLength={1000}
                                                        rows={3}
                                                        placeholder="Share your experience with this product..."
                                                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={handleSubmitReview}
                                                        disabled={submittingReview || reviewRating < 1}
                                                        className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        {submittingReview && <Loader2 className="size-3.5 animate-spin" />}
                                                        {myReview ? "Update Review" : "Submit Review"}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsReviewFormOpen(false)}
                                                        className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-10">
                                            <MessageCircle className="size-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Be the first to review this product!</p>
                                        </div>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{review.userName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-amber-400 size-3.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                                                            ))}
                                                        </div>
                                                        {user?.id === review.user && (
                                                            <button
                                                                onClick={() => handleDeleteReview(review._id)}
                                                                disabled={deletingReviewId === review._id}
                                                                className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors disabled:opacity-50"
                                                                title="Delete your review"
                                                            >
                                                                {deletingReviewId === review._id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-300">{review.comment}</p>
                                                )}
                                                <span className="text-[10px] text-slate-400 block mt-2">{formatReviewAge(review.createdAt)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsLightboxOpen(false)}
                                className="absolute top-4 right-4 z-20 p-2 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
                            >
                                <X className="size-5" />
                            </button>

                            {/* Main Enlarged Image */}
                            <div className="lg:col-span-2 bg-black flex items-center justify-center p-6 min-h-[350px]">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={selectedImage ? (selectedImage.startsWith('http') || selectedImage.startsWith('/') ? selectedImage : `/${selectedImage}`) : (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`)}
                                    alt={product.name}
                                    className="max-w-full max-h-[75vh] object-contain"
                                />
                            </div>

                            {/* Sidebar Info */}
                            <div className="p-6 flex flex-col justify-between overflow-y-auto">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{product.description}</p>
                                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 block mb-4">
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Product Gallery</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-slate-100 dark:bg-slate-900 ${selectedImage === img ? 'border-teal-600 ring-2 ring-teal-600/30' : 'border-slate-200 dark:border-slate-700'}`}
                                            >
                                                <img
                                                    src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                                                    alt={`${product.name} ${idx}`}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Coupons Modal */}
            <AnimatePresence>
                {isCouponModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsCouponModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <Tag className="size-5 text-teal-600" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Available Coupons</h3>
                                </div>
                                <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
                                {coupons.map((coupon: any) => (
                                    <div key={coupon._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400 block tracking-wider font-mono">
                                                    {coupon.code}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Discount: {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''} OFF
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleCopyCoupon(coupon.code)}
                                                className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1 shadow-sm"
                                            >
                                                {copiedCoupon === coupon.code ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                                {copiedCoupon === coupon.code ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        {coupon.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{coupon.description}</p>
                                        )}
                                        {coupon.minOrderValue > 0 && (
                                            <div className="text-[11px] text-slate-400 mt-2">
                                                Min Order Value: ₹{coupon.minOrderValue}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                <button
                                    onClick={() => setIsCouponModalOpen(false)}
                                    className="w-full py-2.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
