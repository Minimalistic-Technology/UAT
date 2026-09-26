"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, DollarSign, ShoppingBag, Loader2, Trash2, Edit, Plus, X, Tag, Image as ImageIcon, Layers, Ticket, Shield, ChevronLeft, ChevronRight, Mail, Truck, Folder, Settings, Coins, Power, Activity, FileText, Calendar, Eye, ExternalLink, Clock, Calculator, CheckCircle2, BookmarkCheck, Upload, Building2 } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "./components/ToggleSwitch";
import CategoriesView from "./components/CategoriesView";
import QuotationProductsView from "./components/QuotationProductsView";
import CreateQuotationView from "./components/CreateQuotationView";
import SavedQuotationsView from "@/app/quotation/saved/page";
import ScheduleMailView from "./components/ScheduleMailView";

import DeliveredOrdersGraph from "./components/DeliveredOrdersGraph";
import PurchasesGraph from "./components/PurchasesGraph";
import PurchaseRecordsView from "./components/PurchaseRecordsView";
import ContactsView from "./components/ContactsView";
import LeadsView from "./components/LeadsView";
import ClientsView from "./components/ClientsView";
import CompanyView from "./components/CompanyView";
import { useDynamicRoutes, RouteConfig } from "@/app/_context/RouteContext";
import { useToast } from "../_context/ToastContext";
import { useConfirm } from "../_context/ConfirmContext";
import { useSettings } from "../_context/SettingsContext";

interface DashboardStats {
    users: number;
    products: number;
    revenue: number;
    orders: number;
    deliveredStats?: {
        totalDeliveredCount: number;
        totalDeliveredRevenue: number;
        trends: Array<{
            date: string;
            label: string;
            day: string;
            count: number;
            revenue: number;
        }>;
        statusBreakdown: Record<string, { count: number; revenue: number }>;
    };
    recentActivity: Array<{
        _id: string;
        totalAmount: number;
        status: string;
        createdAt: string;
        shippingInfo: { fullName: string };
    }>;
}

interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    creditBalance?: number;
}



interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    image?: string;
    images?: string[];
    category: string | { _id: string; name: string };
    stock: number;
    rating?: number;
    numReviews?: number;
    lastMonthSales?: number;
    brand?: string;
    modelName?: string;
    couponCode?: string;
    discountPercentage?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    cgst?: number;
    sgst?: number;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    isActive: boolean;
    codAvailable?: boolean;
    productType?: 'physical' | 'digital';
    isReturnable?: boolean;
    showDeliveryChecker?: boolean;
    allowedCourierPartners?: string[];
    customDeliveryEstimate?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Blog {
    _id: string;
    title: string;
    content: string;
    author: string;
    image: string;
    slug: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface Message {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    createdAt: string;
}

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const confirm = useConfirm();
    const { refreshSettings } = useSettings();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'users' | 'orders' | 'inventory' | 'messages' | 'coupons' | 'blogs' | 'categories' | 'settings' | 'dynamic_routes' | 'quotation_products' | 'create_quotation' | 'saved_quotations' | 'schedule_mail' | 'contacts' | 'leads' | 'clients' | 'company'>('dashboard');

    // Data for Manage Views
    const [usersList, setUsersList] = useState<User[]>([]);
    const [userTabMode, setUserTabMode] = useState<'customers' | 'staff'>('customers');
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [ordersList, setOrdersList] = useState<any[]>([]);
    const [messagesList, setMessagesList] = useState<Message[]>([]);
    const [couponsList, setCouponsList] = useState<any[]>([]);
    const [blogsList, setBlogsList] = useState<Blog[]>([]);

    const [productsList, setProductsList] = useState<Product[]>([]);
    const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [categoriesList, setCategoriesList] = useState<any[]>([]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategoriesList(data);
        } catch (error) { console.error("Failed to fetch categories", error); }
    };

    // Add Product Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        imagesInput: "",
        category: "",
        stock: "",
        brand: "",
        modelName: "",
        rating: "",
        lastMonthSales: "",
        couponCode: "",
        discountPercentage: "",
        cgst: "",
        sgst: "",
        weightKg: "",
        lengthCm: "",
        widthCm: "",
        heightCm: "",
        codAvailable: true,
        productType: "physical",
        isReturnable: true,
        showDeliveryChecker: true,
        allowedCourierPartners: ["BLUEDART", "DTDC"] as string[],
        customDeliveryEstimate: ""
    });

    interface NewProductFormErrors {
        name?: string;
        price?: string;
        stock?: string;
        category?: string;
        cgst?: string;
        sgst?: string;
        discountPercentage?: string;
        rating?: string;
        lastMonthSales?: string;
        couponCode?: string;
    }
    const [newProductErrors, setNewProductErrors] = useState<NewProductFormErrors>({});

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewingCoupons, setViewingCoupons] = useState<{ productName: string, coupons: any[] } | null>(null);
    const [newProductImageDraft, setNewProductImageDraft] = useState("");
    const [editProductImageDraft, setEditProductImageDraft] = useState("");
    const [newProductImageFiles, setNewProductImageFiles] = useState<File[]>([]);
    const [editProductImageFiles, setEditProductImageFiles] = useState<File[]>([]);

    // Create User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });

    // Edit User State
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Edit Order State
    const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    // Order Details State
    const [viewingOrder, setViewingOrder] = useState<any>(null);

    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Coupon Modal State
    const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
    const [isEditCouponModalOpen, setIsEditCouponModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expiresAt: '',
        applicableProducts: [] as string[],
        isActive: true
    });

    // Blog Modal State
    const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
    const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [newBlog, setNewBlog] = useState({
        title: '',
        content: '',
        author: '',
        image: '',
        slug: '',
        tags: [] as string[]
    });

    // Dynamic Routes State
    const { routes, refreshRoutes } = useDynamicRoutes();
    const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
    const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);
    const [newRoute, setNewRoute] = useState({ path: "", name: "", description: "", isActive: true });

    const searchParams = useSearchParams();

    const VALID_VIEWS = [
        'dashboard', 'products', 'users', 'orders', 'inventory', 'messages', 'coupons',
        'blogs', 'categories', 'settings', 'dynamic_routes', 'quotation_products',
        'create_quotation', 'saved_quotations', 'schedule_mail', 'contacts', 'leads', 'clients', 'company'
    ] as const;

    useEffect(() => {
        const viewParam = searchParams?.get("view");
        if (viewParam && (VALID_VIEWS as readonly string[]).includes(viewParam)) {
            setActiveView(viewParam as typeof VALID_VIEWS[number]);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== "admin") {
                router.push("/");
            } else {
                fetchStats();
            }
        }
    }, [user, authLoading, router]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchMessages = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/contact');
            setMessagesList(res.data);
        } catch (error) { console.error("Failed to fetch messages", error); }
        finally { setLoadingData(false); }
    };

    const fetchCoupons = async () => {
        setLoadingData(true);
        try {
            const [couponsRes, productsRes] = await Promise.all([
                api.get('/coupons'),
                api.get('/products') // Need products for the create/edit modal dropdowns
            ]);
            setCouponsList(couponsRes.data);
            setProductsList(productsRes.data);
        } catch (error) { console.error("Failed to fetch coupons", error); }
        finally { setLoadingData(false); }
    };

    const fetchBlogs = async () => {
        setLoadingData(true);
        try {
            const { data } = await api.get('/blogs');
            setBlogsList(data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchOrders = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/orders');
            setOrdersList(res.data);
        } catch (error) { console.error("Failed to fetch orders", error); }
        finally { setLoadingData(false); }
    };

    useEffect(() => {
        if (activeView === 'products' || activeView === 'inventory' || activeView === 'dashboard') fetchProducts();
        if (activeView === 'users') fetchUsers();
        if (activeView === 'orders' || activeView === 'dashboard') fetchOrders();
        if (activeView === 'messages') fetchMessages();
        if (activeView === 'coupons') fetchCoupons();
        if (activeView === 'blogs') fetchBlogs();
        if (activeView === 'settings') fetchSettings();
    }, [activeView]);

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const res = await api.get('/settings');
            setSiteSettings(res.data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const toggleSettingComponent = async (componentKey: string, currentValue: boolean) => {
        if (!siteSettings) return;
        try {
            const updatedComponents = {
                ...siteSettings.components,
                [componentKey]: !currentValue
            };
            const res = await api.put('/settings', { components: updatedComponents });
            setSiteSettings(res.data);
            refreshSettings();
        } catch (error: any) {
            showToast(error.response?.data?.msg || "Failed to update settings", "error");
        }
    };

    const updateOnboardingSetting = (key: string, value: any) => {
        const updatedOnboarding = {
            ...(siteSettings?.onboarding || { mode: 'open', inviteCode: 'DDTEC-INVITE-2026', closedMessage: 'New user onboarding is currently restricted by administrator.' }),
            [key]: value
        };
        setSiteSettings((prev: any) => ({
            ...prev,
            onboarding: updatedOnboarding
        }));
        saveOnboardingConfig(updatedOnboarding);
    };

    const saveOnboardingConfig = async (onboardingPayload?: any) => {
        try {
            const payload = onboardingPayload || siteSettings?.onboarding;
            const res = await api.put('/settings', { onboarding: payload });
            setSiteSettings(res.data);
            refreshSettings();
            showToast?.("User onboarding restriction settings updated!", "success");
        } catch (error: any) {
            showToast?.("Failed to update onboarding settings", "error");
        }
    };

    const updateDeliverySetting = (key: string, value: any) => {
        const updatedDelivery = {
            ...(siteSettings?.delivery || { freeDeliveryThreshold: 500, flatDeliveryFee: 50, isFreeDeliveryEnabled: true }),
            [key]: value
        };
        setSiteSettings((prev: any) => ({
            ...prev,
            delivery: updatedDelivery
        }));
    };

    const saveDeliveryConfig = async (deliveryPayload?: any) => {
        try {
            const payload = deliveryPayload || siteSettings?.delivery || { freeDeliveryThreshold: 500, flatDeliveryFee: 50, isFreeDeliveryEnabled: true };
            const res = await api.put('/settings', { delivery: payload });
            setSiteSettings(res.data);
            refreshSettings();
            showToast?.("Delivery & shipping settings updated successfully!", "success");
        } catch (error: any) {
            showToast?.("Failed to update delivery settings", "error");
        }
    };

    const fetchUsers = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/admin/users');
            setUsersList(res.data);
        } catch (error) { console.error(error); }
        finally { setLoadingData(false); }
    };



    const fetchProducts = async () => {
        setLoadingData(true);
        try {
            const [productsRes, couponsRes] = await Promise.all([
                api.get('/products'),
                api.get('/coupons')
            ]);

            const coupons = couponsRes.data;
            const productsWithCoupons = productsRes.data.map((p: any) => {
                // Find ALL applicable coupons for this product
                const activeCoupons = coupons.filter((c: any) =>
                    c.type === 'product' &&
                    c.isActive &&
                    c.applicableProducts &&
                    c.applicableProducts.some((ap: any) => ap._id === p._id || ap === p._id)
                );

                return {
                    ...p,
                    couponDetails: activeCoupons // Now an array
                };
            });

            setProductsList(productsWithCoupons);
        } catch (error) { console.error(error); }
        finally { setLoadingData(false); }
    };



    const handleDeleteUser = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this user?", variant: "danger" });
        if (!ok) return;
        await api.delete(`/admin/users/${id}`);
        showToast("User deleted successfully", "success");
        fetchUsers();
    };

    const handleDeleteProduct = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this product?", variant: "danger" });
        if (!ok) return;
        await api.delete(`/products/${id}`);
        showToast("Product deleted successfully", "success");
        fetchProducts();
    };

    // Parses the comma-separated `imagesInput` string into a clean list of URLs
    const parseImageUrlList = (imagesInput: string): string[] =>
        imagesInput.split(',').map(u => u.trim()).filter(Boolean);

    // Validates that a string is a well-formed, absolute http(s) image URL
    const validateImageUrl = (rawUrl: string): string | null => {
        const url = rawUrl.trim();
        if (!url) return null;

        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return 'Enter a valid URL (must start with http:// or https://)';
        }

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return 'Only http:// or https:// URLs are allowed';
        }

        return null;
    };

    // Adds one or more URLs as tags to the given form's image list in a single state update,
    // running validation + dedup checks against both existing tags and each other.
    const addImageUrlTags = (rawUrls: string[], target: 'new' | 'edit') => {
        const currentInput = target === 'new' ? newProduct.imagesInput : editingProduct.imagesInput;
        const existing = parseImageUrlList(currentInput);
        const combined = [...existing];
        let addedCount = 0;

        for (const rawUrl of rawUrls) {
            const url = rawUrl.trim().replace(/,$/, '').trim();
            if (!url) continue;

            const error = validateImageUrl(url);
            if (error) {
                showToast(error, 'error');
                continue;
            }

            if (combined.some(u => u.toLowerCase() === url.toLowerCase())) {
                showToast('This image URL has already been added', 'error');
                continue;
            }

            combined.push(url);
            addedCount++;
        }

        if (addedCount === 0) return;

        const updated = combined.join(', ');
        if (target === 'new') {
            setNewProduct(prev => ({ ...prev, imagesInput: updated }));
        } else {
            setEditingProduct((prev: any) => ({ ...prev, imagesInput: updated }));
        }
    };

    // Adds a single URL as a tag and clears the draft input (used for Enter key / blur)
    const addImageUrlTag = (rawUrl: string, target: 'new' | 'edit') => {
        if (!rawUrl.trim()) return;
        addImageUrlTags([rawUrl], target);
        if (target === 'new') setNewProductImageDraft("");
        else setEditProductImageDraft("");
    };

    // Removes a single URL tag from the given form's image list
    const removeImageUrlTag = (urlToRemove: string, target: 'new' | 'edit') => {
        const currentInput = target === 'new' ? newProduct.imagesInput : editingProduct.imagesInput;
        const updated = parseImageUrlList(currentInput).filter(u => u !== urlToRemove).join(', ');
        if (target === 'new') {
            setNewProduct(prev => ({ ...prev, imagesInput: updated }));
        } else {
            setEditingProduct((prev: any) => ({ ...prev, imagesInput: updated }));
        }
    };

    // Handles typing in the image URL input: adds a tag on Enter, ignores stray commas here
    // (commas are handled in the onChange handler so pasted lists split correctly)
    const handleImageUrlInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, target: 'new' | 'edit') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addImageUrlTag(target === 'new' ? newProductImageDraft : editProductImageDraft, target);
        }
    };

    // Handles changes to the image URL draft input: splits on comma so both typing "url,"
    // and pasting "url1, url2, url3" add tags immediately, keeping only the trailing
    // (possibly incomplete) segment in the input.
    const handleImageUrlInputChange = (value: string, target: 'new' | 'edit') => {
        if (value.includes(',')) {
            const parts = value.split(',');
            const toAdd = parts.slice(0, -1);
            addImageUrlTags(toAdd, target);
            const remainder = parts[parts.length - 1];
            if (target === 'new') setNewProductImageDraft(remainder);
            else setEditProductImageDraft(remainder);
        } else {
            if (target === 'new') setNewProductImageDraft(value);
            else setEditProductImageDraft(value);
        }
    };

    // Queues selected image files locally — they are only uploaded to Cloudinary
    // when the product form is actually submitted (create/update), not on selection.
    const queueProductImageFiles = (files: FileList | null, target: 'new' | 'edit') => {
        if (!files || files.length === 0) return;
        const filesArray = Array.from(files);
        if (target === 'new') {
            setNewProductImageFiles(prev => [...prev, ...filesArray]);
        } else {
            setEditProductImageFiles(prev => [...prev, ...filesArray]);
        }
    };

    const removeQueuedProductImageFile = (index: number, target: 'new' | 'edit') => {
        if (target === 'new') {
            setNewProductImageFiles(prev => prev.filter((_, i) => i !== index));
        } else {
            setEditProductImageFiles(prev => prev.filter((_, i) => i !== index));
        }
    };

    const COUPON_CODE_REGEX = /^[A-Za-z0-9_-]{3,20}$/;

    const validateNewProduct = (data: typeof newProduct): NewProductFormErrors => {
        const errors: NewProductFormErrors = {};

        if (!data.name.trim()) {
            errors.name = 'Product name is required';
        } else if (data.name.trim().length > 150) {
            errors.name = 'Product name must be 150 characters or fewer';
        }

        if (data.price === "" || data.price === null) {
            errors.price = 'Price is required';
        } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
            errors.price = 'Price must be a number greater than 0';
        }

        if (data.stock === "" || data.stock === null) {
            errors.stock = 'Stock is required';
        } else if (isNaN(Number(data.stock)) || Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) {
            errors.stock = 'Stock must be a whole number of 0 or more';
        }

        if (!data.category) {
            errors.category = 'Category is required';
        }

        if (data.cgst !== "" && (isNaN(Number(data.cgst)) || Number(data.cgst) < 0 || Number(data.cgst) > 100)) {
            errors.cgst = 'CGST must be between 0 and 100';
        }

        if (data.sgst !== "" && (isNaN(Number(data.sgst)) || Number(data.sgst) < 0 || Number(data.sgst) > 100)) {
            errors.sgst = 'SGST must be between 0 and 100';
        }

        if (data.discountPercentage !== "" && (isNaN(Number(data.discountPercentage)) || Number(data.discountPercentage) < 0 || Number(data.discountPercentage) > 100)) {
            errors.discountPercentage = 'Discount must be between 0 and 100';
        }

        if (data.rating !== "" && (isNaN(Number(data.rating)) || Number(data.rating) < 0 || Number(data.rating) > 5)) {
            errors.rating = 'Rating must be between 0 and 5';
        }

        if (data.lastMonthSales !== "" && (isNaN(Number(data.lastMonthSales)) || Number(data.lastMonthSales) < 0 || !Number.isInteger(Number(data.lastMonthSales)))) {
            errors.lastMonthSales = 'Last month sales must be a whole number of 0 or more';
        }

        if (data.couponCode.trim() && !COUPON_CODE_REGEX.test(data.couponCode.trim())) {
            errors.couponCode = 'Coupon code must be 3-20 letters, numbers, hyphens or underscores';
        }

        return errors;
    };

    const hasNewProductErrors = (errors: NewProductFormErrors): boolean => Object.values(errors).some(Boolean);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateNewProduct(newProduct);
        setNewProductErrors(errors);
        if (hasNewProductErrors(errors)) {
            showToast("Please fix the highlighted fields", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrls = parseImageUrlList(newProduct.imagesInput);

            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('price', String(Number(newProduct.price)));
            formData.append('stock', String(Number(newProduct.stock)));
            formData.append('description', newProduct.description);
            formData.append('category', newProduct.category);
            formData.append('brand', newProduct.brand);
            formData.append('modelName', newProduct.modelName);
            formData.append('rating', String(Number(newProduct.rating) || 0));
            formData.append('lastMonthSales', String(Number(newProduct.lastMonthSales) || 0));
            if (newProduct.couponCode) formData.append('couponCode', newProduct.couponCode);
            formData.append('discountPercentage', String(Number(newProduct.discountPercentage) || 0));
            formData.append('cgst', String(Number(newProduct.cgst) || 0));
            formData.append('sgst', String(Number(newProduct.sgst) || 0));
            formData.append('weightKg', String(Number(newProduct.weightKg) || 0.5));
            formData.append('lengthCm', String(Number(newProduct.lengthCm) || 10));
            formData.append('widthCm', String(Number(newProduct.widthCm) || 10));
            formData.append('heightCm', String(Number(newProduct.heightCm) || 10));
            formData.append('codAvailable', String(newProduct.codAvailable));
            formData.append('productType', newProduct.productType);
            formData.append('isReturnable', String(newProduct.isReturnable));
            formData.append('showDeliveryChecker', String(newProduct.showDeliveryChecker));
            formData.append('customDeliveryEstimate', newProduct.customDeliveryEstimate);
            newProduct.allowedCourierPartners.forEach(code => formData.append('allowedCourierPartners', code));
            imageUrls.forEach(url => formData.append('imageUrls', url));
            newProductImageFiles.forEach(file => formData.append('images', file));

            const res = await api.post('/products', formData);

            if (res.status === 200 || res.status === 201) {
                fetchProducts();
                setIsAddModalOpen(false);
                setNewProduct({
                    name: "", price: "", description: "", image: "", imagesInput: "", category: "", stock: "", brand: "",
                    modelName: "", rating: "", lastMonthSales: "", couponCode: "", discountPercentage: "", cgst: "", sgst: "",
                    weightKg: "", lengthCm: "", widthCm: "", heightCm: "", codAvailable: true,
                    productType: "physical", isReturnable: true, showDeliveryChecker: true,
                    allowedCourierPartners: ["BLUEDART", "DTDC"], customDeliveryEstimate: ""
                });
                setNewProductImageDraft("");
                setNewProductImageFiles([]);
                setNewProductErrors({});
                showToast("Product Added Successfully", "success");
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || 'Failed to add product', "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleEditClick = (product: Product) => {
        const images = (product as any).images || [];
        const imagesInput = images.length > 0 ? images.join(', ') : (product as any).image;

        setEditingProduct({
            ...product,
            price: String(product.price),
            stock: String(product.stock),
            description: (product as any).description || "",
            image: (product as any).image || "",
            imagesInput: imagesInput || "",
            category: (typeof product.category === 'object' && product.category !== null) ? (product.category as any)._id : product.category,
            brand: (product as any).brand || "",
            modelName: (product as any).modelName || "",
            rating: String((product as any).rating || 0),
            lastMonthSales: String((product as any).lastMonthSales || 0),
            couponCode: (product as any).couponCode || "",
            discountPercentage: String((product as any).discountPercentage || 0),
            cgst: String((product as any).cgst || 0),
            sgst: String((product as any).sgst || 0),
            weightKg: String((product as any).weightKg ?? 0.5),
            lengthCm: String((product as any).lengthCm ?? 10),
            widthCm: String((product as any).widthCm ?? 10),
            heightCm: String((product as any).heightCm ?? 10),
            codAvailable: (product as any).codAvailable !== false,
            productType: (product as any).productType === 'digital' ? 'digital' : 'physical',
            isReturnable: (product as any).isReturnable !== false,
            showDeliveryChecker: (product as any).showDeliveryChecker !== false,
            allowedCourierPartners: (product as any).allowedCourierPartners?.length ? (product as any).allowedCourierPartners : ["BLUEDART", "DTDC"],
            customDeliveryEstimate: (product as any).customDeliveryEstimate || ""
        });
        setEditProductImageDraft("");
        setEditProductImageFiles([]);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if ([editingProduct.price, editingProduct.stock, editingProduct.discountPercentage, editingProduct.cgst, editingProduct.sgst, editingProduct.weightKg, editingProduct.lengthCm, editingProduct.widthCm, editingProduct.heightCm]
            .some((v: string) => v !== "" && Number(v) < 0)) {
            showToast("Price, stock, discount, CGST, SGST, weight and dimensions cannot be negative", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrls = parseImageUrlList(editingProduct.imagesInput);

            const formData = new FormData();
            formData.append('name', editingProduct.name);
            formData.append('price', String(Number(editingProduct.price)));
            formData.append('stock', String(Number(editingProduct.stock)));
            formData.append('description', editingProduct.description || '');
            formData.append('category', editingProduct.category || '');
            formData.append('brand', editingProduct.brand || '');
            formData.append('modelName', editingProduct.modelName || '');
            formData.append('rating', String(Number(editingProduct.rating) || 0));
            formData.append('lastMonthSales', String(Number(editingProduct.lastMonthSales) || 0));
            if (editingProduct.couponCode) formData.append('couponCode', editingProduct.couponCode);
            formData.append('discountPercentage', String(Number(editingProduct.discountPercentage) || 0));
            formData.append('cgst', String(Number(editingProduct.cgst) || 0));
            formData.append('sgst', String(Number(editingProduct.sgst) || 0));
            formData.append('weightKg', String(Number(editingProduct.weightKg) || 0.5));
            formData.append('lengthCm', String(Number(editingProduct.lengthCm) || 10));
            formData.append('widthCm', String(Number(editingProduct.widthCm) || 10));
            formData.append('heightCm', String(Number(editingProduct.heightCm) || 10));
            formData.append('codAvailable', String(editingProduct.codAvailable !== false));
            formData.append('productType', editingProduct.productType === 'digital' ? 'digital' : 'physical');
            formData.append('isReturnable', String(editingProduct.isReturnable !== false));
            formData.append('showDeliveryChecker', String(editingProduct.showDeliveryChecker !== false));
            formData.append('customDeliveryEstimate', editingProduct.customDeliveryEstimate || '');
            (editingProduct.allowedCourierPartners?.length ? editingProduct.allowedCourierPartners : ["BLUEDART", "DTDC"]).forEach((code: string) => formData.append('allowedCourierPartners', code));
            formData.append('imagesFieldPresent', 'true');
            imageUrls.forEach((url: string) => formData.append('imageUrls', url));
            editProductImageFiles.forEach(file => formData.append('images', file));

            const res = await api.put(`/products/${editingProduct._id}`, formData);

            if (res.status === 200) {
                fetchProducts();
                setIsEditModalOpen(false);
                setEditingProduct(null);
                setEditProductImageFiles([]);
                showToast("Product Updated Successfully", "success");
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || 'Failed to update product', "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewChange = (view: 'dashboard' | 'products' | 'users' | 'orders' | 'inventory' | 'messages' | 'coupons' | 'blogs' | 'categories' | 'settings' | 'dynamic_routes' | 'quotation_products' | 'create_quotation' | 'saved_quotations' | 'schedule_mail' | 'contacts' | 'leads' | 'clients' | 'company') => {
        setActiveView(view);
        router.push(`/admin?view=${view}`, { scroll: false });
        if (view === 'users') fetchUsers();
        if (view === 'products' || view === 'inventory' || view === 'dashboard') fetchProducts();
        if (view === 'orders' || view === 'dashboard') fetchOrders();
        if (view === 'messages') fetchMessages();
        if (view === 'coupons') fetchCoupons();
        if (view === 'blogs') fetchBlogs();
        if (view === 'categories' || view === 'products' || view === 'inventory') fetchCategories();
        if (view === 'settings') fetchSettings();
    };




    const toggleUserStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/auth/users/${id}/status`); // Assuming implemented
            setUsersList(prev => prev.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            console.error(error);
            showToast("Failed to update user status", "error");
        }
    };

    const toggleProductStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/products/${id}/status`); // Assuming implemented
            setProductsList(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
        } catch (error) {
            console.error(error);
            showToast("Failed to update product status", "error");
        }
    };

    const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/coupons/${id}`, { isActive: !currentStatus });
            setCouponsList(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (error) {
            console.error(error);
            showToast("Failed to update coupon status", "error");
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this coupon?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/coupons/${id}`);
            setCouponsList(prev => prev.filter(c => c._id !== id));
            showToast("Coupon deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete coupon", "error");
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/coupons', newCoupon);
            setCouponsList(prev => [...prev, data]);
            setIsAddCouponModalOpen(false);
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                expiresAt: '',
                applicableProducts: [],
                isActive: true
            });
            showToast("Coupon created successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to create coupon", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCoupon) return;
        setIsSubmitting(true);
        try {
            const { data } = await api.put(`/coupons/${editingCoupon._id}`, editingCoupon);
            setCouponsList(prev => prev.map(c => c._id === editingCoupon._id ? data : c));
            setIsEditCouponModalOpen(false);
            setEditingCoupon(null);
            showToast("Coupon updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update coupon", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Blog Handlers
    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/blogs', newBlog);
            setBlogsList(prev => [data, ...prev]);
            setIsAddBlogModalOpen(false);
            setNewBlog({ title: '', content: '', author: '', image: '', slug: '', tags: [] });
            showToast("Blog created successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to create blog", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog) return;
        setIsSubmitting(true);
        try {
            const { data } = await api.put(`/blogs/${editingBlog._id}`, editingBlog);
            setBlogsList(prev => prev.map(b => b._id === editingBlog._id ? data : b));
            setIsEditBlogModalOpen(false);
            setEditingBlog(null);
            showToast("Blog updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update blog", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBlog = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this blog?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/blogs/${id}`);
            setBlogsList(prev => prev.filter(b => b._id !== id));
            showToast("Blog deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete blog", "error");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/create-user', newUser);
            fetchUsers();
            setIsAddUserModalOpen(false);
            setNewUser({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });
            showToast("User created successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to create user", "error");
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleEditUserClick = (user: User) => {
        const { password, ...rest } = user as any; // distinct password from rest logic
        setEditingUser(rest);
        setIsEditUserModalOpen(true);
    };



    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...editingUser };
            if (!payload.password) delete payload.password;

            await api.put(`/auth/users/${editingUser._id}`, payload);
            fetchUsers();
            setIsEditUserModalOpen(false);
            setEditingUser(null);
            showToast("User updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update user", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrdersList(prev => prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update order status", "error");
        }
    };

    const handleEditOrderClick = (order: any) => {
        setEditingOrder({
            ...order,
            fullName: order.shippingInfo?.fullName || "",
            address: order.shippingInfo?.address || "",
            city: order.shippingInfo?.city || "",
            pincode: order.shippingInfo?.pincode || order.shippingInfo?.zip || "",
            phone: order.shippingInfo?.phone || ""
        });
        setIsEditOrderModalOpen(true);
    };

    const handleUpdateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updateData = {
                status: editingOrder.status,
                shippingInfo: {
                    fullName: editingOrder.fullName,
                    address: editingOrder.address,
                    city: editingOrder.city,
                    pincode: editingOrder.pincode,
                    phone: editingOrder.phone
                }
            };
            const res = await api.put(`/orders/${editingOrder._id}`, updateData);
            setOrdersList(prev => prev.map(o => o._id === editingOrder._id ? res.data : o));
            setIsEditOrderModalOpen(false);
            showToast("Order updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update order", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this order?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/orders/${orderId}`);
            setOrdersList(prev => prev.filter(o => o._id !== orderId));
            showToast("Order deleted successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to delete order", "error");
        }
    };




    if (authLoading || !user || user.role !== 'admin' || loadingStats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    if (!user || user.role !== "admin") return null;

    // --- Dynamic Routes Logic ---
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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen pt-24 transition-all duration-300 bg-white border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700 ${isSidebarCollapsed ? 'w-20' : 'w-64'} -translate-x-full md:translate-x-0`} aria-label="Sidebar">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-50 text-slate-500"
                >
                    {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </button>

                <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-slate-800 scrollbar-hide">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <button onClick={() => handleViewChange('dashboard')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'dashboard' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Layers className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Overview</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('categories')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'categories' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Folder className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Categories</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('products')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'products' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Package className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Products</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('inventory')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'inventory' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Layers className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Inventory</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('saved_quotations')} className={`w-full flex items-center p-2 rounded-lg group ${['saved_quotations', 'create_quotation', 'quotation_products'].includes(activeView) ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <FileText className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3 font-semibold">Quotation</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('orders')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'orders' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <ShoppingBag className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Orders</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('users')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'users' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Users className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">User & Staff</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('messages')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'messages' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Mail className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Messages</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('coupons')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'coupons' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Ticket className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Coupons</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('schedule_mail')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'schedule_mail' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Calendar className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Schedule Mail</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('contacts')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'contacts' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Users className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Contacts</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('leads')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'leads' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Activity className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Lead</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('clients')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'clients' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Users className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Client</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('company')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'company' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Building2 className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Company</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('blogs')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'blogs' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Edit className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Blogs</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('settings')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'settings' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Settings className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Site Settings</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('dynamic_routes')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'dynamic_routes' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Activity className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Dynamic Routes</span>}
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className={`flex-1 min-w-0 p-8 pt-24 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* View Coupons Modal */}
                <AnimatePresence>
                    {viewingCoupons && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Coupons for {viewingCoupons.productName}</h3>
                                    <button onClick={() => setViewingCoupons(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="size-6" />
                                    </button>
                                </div>
                                <div className="p-6 max-h-[60vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        {viewingCoupons.coupons.length > 0 ? (
                                            viewingCoupons.coupons.map((coupon: any) => (
                                                <div key={coupon._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 block">{coupon.code}</span>
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                Discount: {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''} off
                                                            </span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    {coupon.expiresAt && (
                                                        <div className="text-xs text-slate-400">
                                                            Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {coupon.usageLimit && (
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            Usage: {coupon.usedCount} / {coupon.usageLimit}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-500 py-8">No active coupons found for this product.</div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => setViewingCoupons(null)}
                                        className="w-full px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto">

                    {activeView === 'dashboard' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title="Total Users"
                                    value={stats?.users || 0}
                                    icon={<Users className="size-6 text-blue-600" />}
                                    bg="bg-blue-50 dark:bg-blue-900/20"
                                />
                                <StatCard
                                    title="Total Products"
                                    value={stats?.products || 0}
                                    icon={<Package className="size-6 text-teal-600" />}
                                    bg="bg-teal-50 dark:bg-teal-900/20"
                                />
                                <StatCard
                                    title="Total Orders"
                                    value={stats?.orders || 0}
                                    icon={<ShoppingBag className="size-6 text-purple-600" />}
                                    bg="bg-purple-50 dark:bg-purple-900/20"
                                />
                                <StatCard
                                    title="Total Revenue"
                                    value={`₹${(stats?.revenue || 0).toLocaleString()}`}
                                    icon={<DollarSign className="size-6 text-green-600" />}
                                    bg="bg-green-50 dark:bg-green-900/20"
                                />
                            </div>

                            {/* Orders & Purchases Analytics Graphs */}
                            <div className="space-y-8 mb-8">
                                <DeliveredOrdersGraph deliveredStats={stats?.deliveredStats} allOrders={ordersList} />
                                <PurchasesGraph products={productsList} />
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                                    <div className="space-y-4">
                                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                            stats.recentActivity.map((order) => (
                                                <div key={order._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="size-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                                        <ShoppingBag className="size-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 dark:text-white">Order placed by {order.shippingInfo?.fullName || "Guest"}</p>
                                                        <p className="text-sm text-slate-500">
                                                            ₹{order.totalAmount.toFixed(2)} - {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500">No recent activity.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleViewChange('products')} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group">
                                            <Package className="size-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium text-slate-900 dark:text-white block">Manage Products</span>
                                        </button>
                                        <button onClick={() => handleViewChange('users')} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group">
                                            <Users className="size-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium text-slate-900 dark:text-white block">Manage Users</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeView === 'users' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                                        <button
                                            onClick={() => setUserTabMode('customers')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${userTabMode === 'customers'
                                                ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            <Users className="size-4" /> Customers
                                        </button>
                                        <button
                                            onClick={() => setUserTabMode('staff')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${userTabMode === 'staff'
                                                ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            <Shield className="size-4" /> Staff Members
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shrink-0">
                                    <Plus className="size-4" /> Add {userTabMode === 'customers' ? 'User' : 'Staff'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Status</th>
                                            {userTabMode === 'customers' && <th className="p-4">Credit</th>}
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {usersList
                                            .filter(u => userTabMode === 'customers' ? u.role === 'user' : u.role !== 'user')
                                            .map(u => (
                                                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-4 font-medium text-slate-900 dark:text-white">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.name || u.email.split('@')[0])}</td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                            {u.role.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {u.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {userTabMode === 'customers' && (
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                                <Coins className="size-3.5 text-amber-500" />
                                                                {u.creditBalance || 0}
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                                        {!u.isActive && (
                                                            <button
                                                                onClick={() => toggleUserStatus(u._id, u.isActive)}
                                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                                                title="Approve User Account"
                                                            >
                                                                <CheckCircle2 className="size-3.5" /> Approve Account
                                                            </button>
                                                        )}
                                                        <ToggleSwitch isOn={u.isActive} onToggle={() => toggleUserStatus(u._id, u.isActive)} />
                                                        <button onClick={() => handleEditUserClick(u)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit User">
                                                            <Edit className="size-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete User">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeView === 'products' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                                <button onClick={() => { setNewProductErrors({}); setNewProductImageFiles([]); setIsAddModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                                    <Plus className="size-4" /> Add Product
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Coupons</th>
                                            <th className="p-4">Stock</th>
                                            <th className="p-4">Last Updated</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {productsList.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {(typeof p.category === 'object' && p.category !== null) ? (p.category as any).name : p.category}
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-medium">₹{p.price}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        {p.couponCode && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold">
                                                                <Tag className="size-3" /> {p.couponCode}
                                                            </span>
                                                        )}
                                                        {(p as any).couponDetails && (p as any).couponDetails.length > 0 && (
                                                            <button
                                                                onClick={() => setViewingCoupons({ productName: p.name, coupons: (p as any).couponDetails })}
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                <Ticket className="size-3" />
                                                                {(p as any).couponDetails.length} Linked Coupon{(p as any).couponDetails.length !== 1 ? 's' : ''}
                                                            </button>
                                                        )}
                                                        {!p.couponCode && (!(p as any).couponDetails || (p as any).couponDetails.length === 0) && (
                                                            <span className="text-xs text-slate-400 italic">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right flex justify-end items-center gap-1">
                                                    <button onClick={() => setViewingProductDetails(p)} className="text-teal-600 hover:text-teal-800 p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition-colors" title="View Full Product Details & Timestamps">
                                                        <Eye className="size-4" />
                                                    </button>
                                                    <a href={`/product/${p._id}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors" title="Preview Public Storefront">
                                                        <ExternalLink className="size-4" />
                                                    </a>
                                                    <ToggleSwitch isOn={p.isActive} onToggle={() => toggleProductStatus(p._id, p.isActive)} />
                                                    <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit Product">
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete Product">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeView === 'inventory' && (
                        <div className="space-y-8">
                            <PurchaseRecordsView
                                productsList={productsList}
                                categoriesList={categoriesList}
                                onRefreshProducts={fetchProducts}
                            />
                        </div>
                    )}


                    {activeView === 'orders' && (
                        <div className="space-y-8">
                            <DeliveredOrdersGraph deliveredStats={stats?.deliveredStats} allOrders={ordersList} />
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                                    <span className="text-sm text-slate-500">{ordersList.length} Total Orders</span>
                                </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Order ID / Date</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {ordersList.map(order => (
                                            <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4">
                                                    <div className="font-mono text-xs uppercase text-slate-900 dark:text-white">#{order._id.slice(-8)}</div>
                                                    <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{order.shippingInfo?.fullName || "Guest"}</div>
                                                    <div className="text-xs text-slate-400">{order.user?.email || 'Guest'}</div>
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-bold">₹{order.totalAmount.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                        className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border-none cursor-pointer
                                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOrderClick(order)}
                                                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Layers className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </div>
                    )}

                    {activeView === 'messages' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                                <span className="text-sm text-slate-500">{messagesList.length} Total Messages</span>
                            </div>
                            <div className="overflow-x-auto">
                                {loadingData ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="animate-spin text-teal-600 size-10" />
                                    </div>
                                ) : messagesList.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Mail className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 text-lg">No messages yet</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Messages from the contact form will appear here</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">From</th>
                                                <th className="p-4">Message</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {messagesList.map(msg => (
                                                <tr key={msg._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-900 dark:text-white">{msg.firstName} {msg.lastName}</div>
                                                        <div className="text-sm text-slate-400">{msg.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 max-w-md">{msg.message}</p>
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <a
                                                            href={`mailto:${msg.email}?subject=Re: Your message&body=Hi ${msg.firstName},%0D%0A%0D%0A`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                                        >
                                                            <Mail className="size-4" />
                                                            Reply
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'blogs' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                                <button onClick={() => setIsAddBlogModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                                    <Plus className="size-4" /> Add Blog
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                {loadingData ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="animate-spin text-teal-600 size-10" />
                                    </div>
                                ) : blogsList.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Edit className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 text-lg">No blogs yet</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Create your first blog post to get started</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">Title</th>
                                                <th className="p-4">Author</th>
                                                <th className="p-4">Slug</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {blogsList.map(blog => (
                                                <tr key={blog._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1 max-w-xs">{blog.title}</div>
                                                        {blog.tags && blog.tags.length > 0 && (
                                                            <div className="flex gap-1 mt-1">
                                                                {blog.tags.slice(0, 2).map((tag, idx) => (
                                                                    <span key={idx} className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400">{blog.author}</td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{blog.slug}</td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {new Date(blog.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => { setEditingBlog(blog); setIsEditBlogModalOpen(true); }}
                                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                            title="Edit Blog"
                                                        >
                                                            <Edit className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBlog(blog._id)}
                                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                            title="Delete Blog"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'categories' && <CategoriesView />}

                    {['saved_quotations', 'create_quotation', 'quotation_products'].includes(activeView) && (
                        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                            <button
                                onClick={() => handleViewChange('saved_quotations')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                    activeView === 'saved_quotations'
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <BookmarkCheck className="size-4" />
                                Saved Quotations
                            </button>
                            <button
                                onClick={() => handleViewChange('create_quotation')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                    activeView === 'create_quotation'
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <Calculator className="size-4" />
                                Create Quotation
                            </button>
                            <button
                                onClick={() => handleViewChange('quotation_products')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                    activeView === 'quotation_products'
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <FileText className="size-4" />
                                Quotation Catalog
                            </button>
                        </div>
                    )}

                    {activeView === 'quotation_products' && <QuotationProductsView />}

                    {activeView === 'create_quotation' && <CreateQuotationView />}

                    {activeView === 'saved_quotations' && <SavedQuotationsView />}

                    {activeView === 'schedule_mail' && <ScheduleMailView />}

                    {activeView === 'contacts' && <ContactsView />}

                    {activeView === 'leads' && <LeadsView />}

                    {activeView === 'clients' && <ClientsView />}

                    {activeView === 'company' && <CompanyView />}

                    {/* Add Product Modal */}
                    <AnimatePresence>
                        {
                            isAddModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h3>
                                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddProduct} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            required
                                                            type="text"
                                                            value={newProduct.name}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, name: e.target.value });
                                                                if (newProductErrors.name) setNewProductErrors(prev => ({ ...prev, name: undefined }));
                                                            }}
                                                            className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.name ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="e.g. Cordless Drill"
                                                        />
                                                    </div>
                                                    {newProductErrors.name && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.name}</p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                            <input
                                                                required
                                                                type="number"
                                                                min="0"
                                                                value={newProduct.price}
                                                                onChange={(e) => {
                                                                    setNewProduct({ ...newProduct, price: e.target.value });
                                                                    if (newProductErrors.price) setNewProductErrors(prev => ({ ...prev, price: undefined }));
                                                                }}
                                                                className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.price ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        {newProductErrors.price && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.price}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock <span className="text-red-500">*</span></label>
                                                        <input
                                                            required
                                                            type="number"
                                                            min="0"
                                                            value={newProduct.stock}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, stock: e.target.value });
                                                                if (newProductErrors.stock) setNewProductErrors(prev => ({ ...prev, stock: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.stock ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="100"
                                                        />
                                                        {newProductErrors.stock && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.stock}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={newProduct.cgst}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, cgst: e.target.value });
                                                                if (newProductErrors.cgst) setNewProductErrors(prev => ({ ...prev, cgst: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.cgst ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="9"
                                                        />
                                                        {newProductErrors.cgst && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.cgst}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={newProduct.sgst}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, sgst: e.target.value });
                                                                if (newProductErrors.sgst) setNewProductErrors(prev => ({ ...prev, sgst: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.sgst ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="9"
                                                        />
                                                        {newProductErrors.sgst && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.sgst}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                                                        <input
                                                            type="number"
                                                            min="0.05"
                                                            step="0.01"
                                                            value={newProduct.weightKg}
                                                            onChange={(e) => setNewProduct({ ...newProduct, weightKg: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="0.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Length (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={newProduct.lengthCm}
                                                            onChange={(e) => setNewProduct({ ...newProduct, lengthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={newProduct.widthCm}
                                                            onChange={(e) => setNewProduct({ ...newProduct, widthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={newProduct.heightCm}
                                                            onChange={(e) => setNewProduct({ ...newProduct, heightCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 -mt-2">Packed weight and dimensions are used to calculate Blue Dart / DTDC freight rates at checkout.</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="newProductCodAvailable"
                                                        checked={newProduct.codAvailable}
                                                        onChange={(e) => setNewProduct({ ...newProduct, codAvailable: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="newProductCodAvailable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash on Delivery (COD) available</label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Type</label>
                                                        <select
                                                            value={newProduct.productType}
                                                            onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        >
                                                            <option value="physical">Physical (shipped)</option>
                                                            <option value="digital">Digital (no shipping/delivery)</option>
                                                        </select>
                                                        <p className="text-xs text-slate-400 mt-1">Digital products hide shipping, delivery &amp; courier info on the product page.</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-6">
                                                        <input
                                                            type="checkbox"
                                                            id="newProductIsReturnable"
                                                            checked={newProduct.isReturnable}
                                                            onChange={(e) => setNewProduct({ ...newProduct, isReturnable: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="newProductIsReturnable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Returnable / refundable</label>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="newProductShowDeliveryChecker"
                                                            checked={newProduct.showDeliveryChecker}
                                                            onChange={(e) => setNewProduct({ ...newProduct, showDeliveryChecker: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="newProductShowDeliveryChecker" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show delivery / pincode checker on product page</label>
                                                    </div>

                                                    {newProduct.showDeliveryChecker && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allowed courier partners</label>
                                                                <div className="flex items-center gap-4">
                                                                    {["BLUEDART", "DTDC"].map(code => (
                                                                        <label key={code} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={newProduct.allowedCourierPartners.includes(code)}
                                                                                onChange={(e) => {
                                                                                    const current = newProduct.allowedCourierPartners;
                                                                                    if (!e.target.checked && current.length === 1) return; // keep at least one selected
                                                                                    const next = e.target.checked
                                                                                        ? [...current, code]
                                                                                        : current.filter(c => c !== code);
                                                                                    setNewProduct({ ...newProduct, allowedCourierPartners: next });
                                                                                }}
                                                                                className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                                            />
                                                                            {code === "BLUEDART" ? "Blue Dart" : "DTDC"}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-slate-400 mt-1">Restrict to one carrier for oversized, hazardous or high-value items only that carrier handles.</p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom delivery estimate (optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={newProduct.customDeliveryEstimate}
                                                                    onChange={(e) => setNewProduct({ ...newProduct, customDeliveryEstimate: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                                    placeholder="e.g. Made to order — ships in 7-10 business days"
                                                                />
                                                                <p className="text-xs text-slate-400 mt-1">Overrides the live courier ETA shown to customers. Leave blank to use the real-time estimate.</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.brand}
                                                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Bosch"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.modelName}
                                                            onChange={(e) => setNewProduct({ ...newProduct, modelName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. GSB 600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="5"
                                                            value={newProduct.rating}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, rating: e.target.value });
                                                                if (newProductErrors.rating) setNewProductErrors(prev => ({ ...prev, rating: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.rating ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="4.5"
                                                        />
                                                        {newProductErrors.rating && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.rating}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={newProduct.lastMonthSales}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, lastMonthSales: e.target.value });
                                                                if (newProductErrors.lastMonthSales) setNewProductErrors(prev => ({ ...prev, lastMonthSales: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.lastMonthSales ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="50"
                                                        />
                                                        {newProductErrors.lastMonthSales && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.lastMonthSales}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.couponCode}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, couponCode: e.target.value });
                                                                if (newProductErrors.couponCode) setNewProductErrors(prev => ({ ...prev, couponCode: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.couponCode ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="e.g. SAVE10"
                                                        />
                                                        {newProductErrors.couponCode && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.couponCode}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={newProduct.discountPercentage}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, discountPercentage: e.target.value });
                                                                if (newProductErrors.discountPercentage) setNewProductErrors(prev => ({ ...prev, discountPercentage: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.discountPercentage ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="10"
                                                        />
                                                        {newProductErrors.discountPercentage && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.discountPercentage}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category <span className="text-red-500">*</span></label>
                                                    <select
                                                        required
                                                        value={newProduct.category}
                                                        onChange={(e) => {
                                                            setNewProduct({ ...newProduct, category: e.target.value });
                                                            if (newProductErrors.category) setNewProductErrors(prev => ({ ...prev, category: undefined }));
                                                        }}
                                                        className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.category ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesList.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    {newProductErrors.category && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.category}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs</label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            type="text"
                                                            value={newProductImageDraft}
                                                            onChange={(e) => handleImageUrlInputChange(e.target.value, 'new')}
                                                            onKeyDown={(e) => handleImageUrlInputKeyDown(e, 'new')}
                                                            onBlur={() => addImageUrlTag(newProductImageDraft, 'new')}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Paste a URL and press Enter or comma to add"
                                                        />
                                                    </div>
                                                    {parseImageUrlList(newProduct.imagesInput).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {parseImageUrlList(newProduct.imagesInput).map((url, idx) => (
                                                                <span
                                                                    key={`${url}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-700 dark:text-teal-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={url}>{url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImageUrlTag(url, 'new')}
                                                                        className="text-teal-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 my-3">
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Or</span>
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                    </div>

                                                    <label className="flex flex-col items-center justify-center gap-1.5 w-full py-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-all">
                                                        <Upload className="size-5" />
                                                        Upload Image(s)
                                                        <span className="text-[11px] font-normal text-slate-400">You can select multiple image files at once. They&apos;ll be uploaded when you save.</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => {
                                                                queueProductImageFiles(e.target.files, 'new');
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {newProductImageFiles.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {newProductImageFiles.map((file, idx) => (
                                                                <span
                                                                    key={`${file.name}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={file.name}>{file.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeQueuedProductImageFile(idx, 'new')}
                                                                        className="text-indigo-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                                    <textarea
                                                        value={newProduct.description}
                                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                        placeholder="Product details..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Product'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Edit Product Modal */}
                    <AnimatePresence>
                        {
                            isEditModalOpen && editingProduct && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Product</h3>
                                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateProduct} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            required
                                                            type="text"
                                                            value={editingProduct.name}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Cordless Drill"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                            <input
                                                                required
                                                                type="number"
                                                                min="0"
                                                                value={editingProduct.price}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock <span className="text-red-500">*</span></label>
                                                        <input
                                                            required
                                                            type="number"
                                                            min="0"
                                                            value={editingProduct.stock}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={editingProduct.cgst}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, cgst: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="9"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={editingProduct.sgst}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, sgst: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="9"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                                                        <input
                                                            type="number"
                                                            min="0.05"
                                                            step="0.01"
                                                            value={editingProduct.weightKg}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, weightKg: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="0.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Length (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={editingProduct.lengthCm}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, lengthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={editingProduct.widthCm}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, widthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={editingProduct.heightCm}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, heightCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 -mt-2">Packed weight and dimensions are used to calculate Blue Dart / DTDC freight rates at checkout.</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="editProductCodAvailable"
                                                        checked={editingProduct.codAvailable !== false}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, codAvailable: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="editProductCodAvailable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash on Delivery (COD) available</label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Type</label>
                                                        <select
                                                            value={editingProduct.productType === 'digital' ? 'digital' : 'physical'}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, productType: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        >
                                                            <option value="physical">Physical (shipped)</option>
                                                            <option value="digital">Digital (no shipping/delivery)</option>
                                                        </select>
                                                        <p className="text-xs text-slate-400 mt-1">Digital products hide shipping, delivery &amp; courier info on the product page.</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-6">
                                                        <input
                                                            type="checkbox"
                                                            id="editProductIsReturnable"
                                                            checked={editingProduct.isReturnable !== false}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, isReturnable: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="editProductIsReturnable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Returnable / refundable</label>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="editProductShowDeliveryChecker"
                                                            checked={editingProduct.showDeliveryChecker !== false}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, showDeliveryChecker: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="editProductShowDeliveryChecker" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show delivery / pincode checker on product page</label>
                                                    </div>

                                                    {editingProduct.showDeliveryChecker !== false && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allowed courier partners</label>
                                                                <div className="flex items-center gap-4">
                                                                    {["BLUEDART", "DTDC"].map(code => {
                                                                        const current: string[] = editingProduct.allowedCourierPartners?.length ? editingProduct.allowedCourierPartners : ["BLUEDART", "DTDC"];
                                                                        return (
                                                                            <label key={code} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={current.includes(code)}
                                                                                    onChange={(e) => {
                                                                                        if (!e.target.checked && current.length === 1) return; // keep at least one selected
                                                                                        const next = e.target.checked
                                                                                            ? [...current, code]
                                                                                            : current.filter(c => c !== code);
                                                                                        setEditingProduct({ ...editingProduct, allowedCourierPartners: next });
                                                                                    }}
                                                                                    className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                                                />
                                                                                {code === "BLUEDART" ? "Blue Dart" : "DTDC"}
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <p className="text-xs text-slate-400 mt-1">Restrict to one carrier for oversized, hazardous or high-value items only that carrier handles.</p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom delivery estimate (optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.customDeliveryEstimate || ""}
                                                                    onChange={(e) => setEditingProduct({ ...editingProduct, customDeliveryEstimate: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                                    placeholder="e.g. Made to order — ships in 7-10 business days"
                                                                />
                                                                <p className="text-xs text-slate-400 mt-1">Overrides the live courier ETA shown to customers. Leave blank to use the real-time estimate.</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={editingProduct.brand}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Bosch"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingProduct.modelName}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, modelName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. GSB 600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="5"
                                                            value={editingProduct.rating}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, rating: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="4.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                        <input
                                                            type="number"
                                                            value={editingProduct.lastMonthSales}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, lastMonthSales: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="50"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category <span className="text-red-500">*</span></label>
                                                    <select
                                                        required
                                                        value={editingProduct.category}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesList.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs</label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            type="text"
                                                            value={editProductImageDraft}
                                                            onChange={(e) => handleImageUrlInputChange(e.target.value, 'edit')}
                                                            onKeyDown={(e) => handleImageUrlInputKeyDown(e, 'edit')}
                                                            onBlur={() => addImageUrlTag(editProductImageDraft, 'edit')}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Paste a URL and press Enter or comma to add"
                                                        />
                                                    </div>
                                                    {parseImageUrlList(editingProduct.imagesInput).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {parseImageUrlList(editingProduct.imagesInput).map((url, idx) => (
                                                                <span
                                                                    key={`${url}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-700 dark:text-teal-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={url}>{url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImageUrlTag(url, 'edit')}
                                                                        className="text-teal-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 my-3">
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Or</span>
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                    </div>

                                                    <label className="flex flex-col items-center justify-center gap-1.5 w-full py-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-all">
                                                        <Upload className="size-5" />
                                                        Upload Image(s)
                                                        <span className="text-[11px] font-normal text-slate-400">You can select multiple image files at once. They&apos;ll be uploaded when you save.</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => {
                                                                queueProductImageFiles(e.target.files, 'edit');
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {editProductImageFiles.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {editProductImageFiles.map((file, idx) => (
                                                                <span
                                                                    key={`${file.name}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={file.name}>{file.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeQueuedProductImageFile(idx, 'edit')}
                                                                        className="text-indigo-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                                    <textarea
                                                        value={editingProduct.description}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                        placeholder="Product details..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update Product'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Coupons View */}
                    {activeView === 'coupons' && (
                        <div className="space-y-8">
                            {/* Header & Create Button */}
                            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage discount codes</p>
                                <button
                                    onClick={() => setIsAddCouponModalOpen(true)}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                                >
                                    <Plus className="size-4" /> Create Coupon
                                </button>
                            </div>

                            {/* Active Coupons */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Ticket className="size-5 text-teal-500" /> Active Coupons
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">Code</th>
                                                <th className="p-4">Discount</th>
                                                <th className="p-4">Expiry</th>
                                                <th className="p-4 text-center">Status</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {couponsList.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).map(coupon => (
                                                <tr key={coupon._id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!coupon.isActive ? 'opacity-60' : ''}`}>
                                                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        {coupon.code}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={coupon.isActive}
                                                            onChange={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                                                            className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {couponsList.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-500">No active coupons found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Expired Coupons */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden opacity-80">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Trash2 className="size-5 text-slate-400" /> Expired Coupons
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">Code</th>
                                                <th className="p-4">Discount</th>
                                                <th className="p-4">Expired On</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {couponsList.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).map(coupon => (
                                                <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors bg-red-50/10">
                                                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400 line-through">
                                                        {coupon.code}
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-500">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                                    </td>
                                                    <td className="p-4 text-red-500 text-sm font-medium">
                                                        {new Date(coupon.expiresAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {couponsList.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-slate-500">No expired coupons found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* View Order Modal */}
                    <AnimatePresence>
                        {viewingOrder && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h3>
                                            <p className="text-sm text-slate-500">#{viewingOrder._id}</p>
                                        </div>
                                        <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 overflow-y-auto space-y-6">
                                        {/* Status & Date */}
                                        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${viewingOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : viewingOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {viewingOrder.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Date</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Customer & Shipping */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Users className="size-4" /> Customer Details
                                                </h4>
                                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <p><span className="font-medium text-slate-900 dark:text-white">Name:</span> {viewingOrder.shippingInfo?.fullName || 'N/A'}</p>
                                                    <p><span className="font-medium text-slate-900 dark:text-white">Email:</span> {viewingOrder.shippingInfo?.email || 'N/A'}</p>
                                                    <p><span className="font-medium text-slate-900 dark:text-white">Phone:</span> {viewingOrder.shippingInfo?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Truck className="size-4" /> Shipping Address
                                                </h4>
                                                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                    <p>{viewingOrder.shippingInfo?.address || 'N/A'}</p>
                                                    <p>{viewingOrder.shippingInfo?.city || 'N/A'}, {viewingOrder.shippingInfo?.pincode || viewingOrder.shippingInfo?.zip || ''}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <ShoppingBag className="size-4" /> Ordered Items
                                            </h4>
                                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                                                        <tr>
                                                            <th className="p-3 font-medium">Product</th>
                                                            <th className="p-3 font-medium text-center">Qty</th>
                                                            <th className="p-3 font-medium text-right">Price</th>
                                                            <th className="p-3 font-medium text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                        {viewingOrder.items.map((item: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="p-3">
                                                                    <div className="flex items-center gap-3">
                                                                        {item.product?.image ? (
                                                                            <img src={item.product?.image} alt={item.product?.name} className="size-10 rounded-lg object-cover bg-slate-100" />
                                                                        ) : (
                                                                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">IMG</div>
                                                                        )}
                                                                        <div>
                                                                            <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                                                                            <p className="text-xs text-slate-400">ID: {item.product?._id || item.product}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">₹{item.price.toLocaleString()}</td>
                                                                <td className="p-3 text-right font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Payment & Totals */}
                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Payment Method</span>
                                                <span className="font-bold text-slate-900 dark:text-white uppercase">{viewingOrder.paymentMethod}</span>
                                            </div>
                                            {viewingOrder.coupon && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Coupon Applied</span>
                                                    <span className="font-medium text-teal-600">{viewingOrder.coupon}</span>
                                                </div>
                                            )}
                                            {viewingOrder.discountAmount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Discount</span>
                                                    <span className="font-medium text-green-600">-₹{viewingOrder.discountAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                                <span className="text-slate-900 dark:text-white font-bold">Total Amount</span>
                                                <span className="text-2xl font-bold text-teal-600">₹{viewingOrder.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => setViewingOrder(null)}
                                            className="w-full px-4 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Add User Modal */}
                    <AnimatePresence>
                        {
                            isAddUserModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h3>
                                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleCreateUser} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={newUser.firstName}
                                                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={newUser.lastName}
                                                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={newUser.email}
                                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={newUser.phone}
                                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                                    <input
                                                        required
                                                        type="password"
                                                        value={newUser.password}
                                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                                    <select
                                                        value={newUser.role}
                                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddUserModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create User'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >



                    {/* Edit User Modal */}
                    <AnimatePresence>
                        {
                            isEditUserModalOpen && editingUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                                            <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateUser} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingUser.firstName || ''}
                                                            onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingUser.lastName || ''}
                                                            onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={editingUser.email || ''}
                                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={editingUser.phone || ''}
                                                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password (leave blank to keep current)</label>
                                                    <input
                                                        type="password"
                                                        value={editingUser.password || ''}
                                                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditUserModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update User'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Edit Order Modal */}
                    <AnimatePresence>
                        {
                            isEditOrderModalOpen && editingOrder && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Order Details</h3>
                                            <button onClick={() => setIsEditOrderModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateOrder} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                                    <select
                                                        value={editingOrder.status}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingOrder.fullName}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, fullName: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                                    <textarea
                                                        value={editingOrder.address}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[100px]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            value={editingOrder.city}
                                                            onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                                                        <input
                                                            type="text"
                                                            value={editingOrder.pincode}
                                                            onChange={(e) => setEditingOrder({ ...editingOrder, pincode: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={editingOrder.phone}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditOrderModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Create Coupon Modal */}
                    <AnimatePresence>
                        {isAddCouponModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Coupon</h3>
                                        <button onClick={() => setIsAddCouponModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateCoupon} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newCoupon.code}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                                    placeholder="SUMMER25"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                                    <select
                                                        value={newCoupon.discountType}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount ($)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        min="0"
                                                        value={newCoupon.discountValue}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    value={newCoupon.expiresAt}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="newCouponActive"
                                                    checked={newCoupon.isActive}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                                                    className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <label htmlFor="newCouponActive" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                                    Active immediately
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddCouponModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Coupon'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit Coupon Modal */}
                    <AnimatePresence>
                        {isEditCouponModalOpen && editingCoupon && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Coupon</h3>
                                        <button onClick={() => setIsEditCouponModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUpdateCoupon} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingCoupon.code}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                                    <select
                                                        value={editingCoupon.discountType}
                                                        onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount ($)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        min="0"
                                                        value={editingCoupon.discountValue}
                                                        onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    value={editingCoupon.expiresAt ? new Date(editingCoupon.expiresAt).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiresAt: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="editCouponActive"
                                                    checked={editingCoupon.isActive}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                                                    className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <label htmlFor="editCouponActive" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                                    Active
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditCouponModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Add Blog Modal */}
                    <AnimatePresence>
                        {isAddBlogModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Blog</h3>
                                        <button onClick={() => setIsAddBlogModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateBlog} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newBlog.title}
                                                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="Enter blog title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL-friendly)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newBlog.slug}
                                                    onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                                    placeholder="my-blog-post"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={newBlog.author}
                                                        onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                                    <input
                                                        type="url"
                                                        value={newBlog.image}
                                                        onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                                <input
                                                    type="text"
                                                    value={newBlog.tags.join(', ')}
                                                    onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="technology, tools, tips"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                                <textarea
                                                    required
                                                    value={newBlog.content}
                                                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[200px] resize-y"
                                                    placeholder="Write your blog content here..."
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddBlogModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Blog'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit Blog Modal */}
                    <AnimatePresence>
                        {isEditBlogModalOpen && editingBlog && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Blog</h3>
                                        <button onClick={() => setIsEditBlogModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUpdateBlog} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingBlog.title}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL-friendly)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingBlog.slug}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={editingBlog.author}
                                                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                                    <input
                                                        type="url"
                                                        value={editingBlog.image}
                                                        onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                                <input
                                                    type="text"
                                                    value={editingBlog.tags.join(', ')}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                                <textarea
                                                    required
                                                    value={editingBlog.content}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[200px] resize-y"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditBlogModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {activeView === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400">Configure global application states, features, and visibility of homepage sections.</p>
                            </div>

                            {loadingSettings && !siteSettings ? (
                                <div className="flex items-center justify-center p-12">
                                    <Loader2 className="animate-spin size-8 text-teal-600" />
                                </div>
                            ) : (
                                siteSettings && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Authentication Controls */}
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authentication & Access</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control login options for the website. The Signup link is shown automatically whenever registration isn't restricted below.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <ToggleSwitch
                                                        isOn={siteSettings.components.Login !== false}
                                                        onToggle={() => toggleSettingComponent('Login', siteSettings.components.Login !== false)}
                                                        label="Allow Public Logins"
                                                        description="When disabled, public login is blocked (admins and staff bypass this restriction to avoid lockout)."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery & Shipping Rates Controls */}
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <Truck className="size-5 text-teal-600" /> Delivery & Shipping Rates
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure free delivery threshold and standard shipping fees.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <ToggleSwitch
                                                        isOn={siteSettings.delivery?.isFreeDeliveryEnabled !== false}
                                                        onToggle={() => {
                                                            const currentVal = siteSettings.delivery?.isFreeDeliveryEnabled !== false;
                                                            updateDeliverySetting('isFreeDeliveryEnabled', !currentVal);
                                                            saveDeliveryConfig({ ...(siteSettings.delivery || {}), isFreeDeliveryEnabled: !currentVal });
                                                        }}
                                                        label="Enable Free Delivery Tier"
                                                        description="Automatically waive delivery fee when cart total exceeds threshold."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                                            Free Delivery Threshold (₹)
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="10"
                                                                value={siteSettings.delivery?.freeDeliveryThreshold ?? 500}
                                                                onChange={(e) => updateDeliverySetting('freeDeliveryThreshold', Number(e.target.value))}
                                                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                                            />
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mt-1">Orders at or above this amount get free delivery</p>
                                                    </div>

                                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                                            Standard Shipping Fee (₹)
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="5"
                                                                value={siteSettings.delivery?.flatDeliveryFee ?? 50}
                                                                onChange={(e) => updateDeliverySetting('flatDeliveryFee', Number(e.target.value))}
                                                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                                            />
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mt-1">Applied on orders below free delivery threshold</p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => saveDeliveryConfig()}
                                                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Save Delivery Settings
                                                </button>
                                            </div>
                                        </div>

                                        {/* User Onboarding Restrictions Control Card */}
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 col-span-1 md:col-span-2">
                                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <Shield className="size-5 text-teal-600" /> Restrict New User Onboarding
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Select how new users can register on your platform. Restrict, require invitation code, or demand manual admin approval.
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-lg uppercase">
                                                    Mode: {siteSettings.onboarding?.mode || 'open'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {/* Mode 1: Open */}
                                                <button
                                                    type="button"
                                                    onClick={() => updateOnboardingSetting('mode', 'open')}
                                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'open' ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🟢 Open Registration</span>
                                                        {siteSettings.onboarding?.mode === 'open' && <CheckCircle2 className="size-4 text-teal-600" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                        Anyone can sign up freely without restriction.
                                                    </p>
                                                </button>

                                                {/* Mode 2: Closed */}
                                                <button
                                                    type="button"
                                                    onClick={() => updateOnboardingSetting('mode', 'closed')}
                                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'closed' ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🔴 Closed / Paused</span>
                                                        {siteSettings.onboarding?.mode === 'closed' && <CheckCircle2 className="size-4 text-rose-600" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                        Completely block all new user signups.
                                                    </p>
                                                </button>

                                                {/* Mode 3: Invite Only */}
                                                <button
                                                    type="button"
                                                    onClick={() => updateOnboardingSetting('mode', 'invite_only')}
                                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'invite_only' ? 'border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🔑 Invite-Only Code</span>
                                                        {siteSettings.onboarding?.mode === 'invite_only' && <CheckCircle2 className="size-4 text-cyan-600" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                        Requires entering secret invitation code.
                                                    </p>
                                                </button>

                                                {/* Mode 4: Admin Approval */}
                                                <button
                                                    type="button"
                                                    onClick={() => updateOnboardingSetting('mode', 'admin_approval')}
                                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'admin_approval' ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🛡️ Admin Approval</span>
                                                        {siteSettings.onboarding?.mode === 'admin_approval' && <CheckCircle2 className="size-4 text-amber-600" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                        New accounts stay inactive until Admin approves.
                                                    </p>
                                                </button>
                                            </div>

                                            {/* Config Inputs */}
                                            {siteSettings.onboarding?.mode === 'invite_only' && (
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                                        Secret Invitation Code (Users must provide this code during registration)
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={siteSettings.onboarding?.inviteCode || 'DDTEC-INVITE-2026'}
                                                            onChange={(e) => updateOnboardingSetting('inviteCode', e.target.value.toUpperCase())}
                                                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => saveOnboardingConfig()}
                                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                                                        >
                                                            Save Code
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {siteSettings.onboarding?.mode === 'closed' && (
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                                        Custom Registration Closed Message
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={siteSettings.onboarding?.closedMessage || 'New user onboarding is currently restricted by administrator.'}
                                                            onChange={(e) => updateOnboardingSetting('closedMessage', e.target.value)}
                                                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => saveOnboardingConfig()}
                                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                                                        >
                                                            Save Message
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Home Page Sections Control */}
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Homepage Sections Visibility</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dynamically enable or disable major landing page features.</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                                {[
                                                    { key: 'Hero', label: 'Hero Banner', desc: 'Main intro banner section at the top of the homepage.' },
                                                    { key: 'WhoWeAre', label: 'Who We Are', desc: 'About section describing the company and goals.' },
                                                    { key: 'WhatWeOffer', label: 'What We Offer', desc: 'Listing of key services or features provided.' },
                                                    { key: 'FeaturedProducts', label: 'Featured Products Slider', desc: 'Showcase highlighted products to homepage visitors.' },
                                                    { key: 'ShopSection', label: 'Shop/Products Grid', desc: 'Main product list catalog layout.' },
                                                    { key: 'Contact', label: 'Contact Form & Location', desc: 'Contact page form and map details.' },
                                                    { key: 'Footer', label: 'Footer Bar', desc: 'Bottom navigation links and copyright information.' }
                                                ].map((section) => (
                                                    <div key={section.key} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                        <ToggleSwitch
                                                            isOn={siteSettings.components[section.key] !== false}
                                                            onToggle={() => toggleSettingComponent(section.key, siteSettings.components[section.key] !== false)}
                                                            label={section.label}
                                                            description={section.desc}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {activeView === 'dynamic_routes' && (
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
                    )}

                </div>
            </main>

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

            {/* View Product Details Modal for Admin */}
            <AnimatePresence>
                {viewingProductDetails && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-teal-600 text-white rounded-xl">
                                        <Eye className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingProductDetails.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">SKU: {viewingProductDetails._id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/product/${viewingProductDetails._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1"
                                    >
                                        <ExternalLink className="size-3.5" /> View Live Page
                                    </a>
                                    <button onClick={() => setViewingProductDetails(null)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                        <X className="size-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                                {/* Timestamp Banner */}
                                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                                        <Clock className="size-4 text-teal-600 dark:text-teal-400" />
                                        <span><strong>Last Updated:</strong> {viewingProductDetails.updatedAt ? new Date(viewingProductDetails.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : 'N/A'} at {viewingProductDetails.updatedAt ? new Date(viewingProductDetails.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : 'N/A'}</span>
                                    </div>
                                    {viewingProductDetails.createdAt && (
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <Calendar className="size-3.5 text-teal-600" />
                                            <span>Created: {new Date(viewingProductDetails.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Specifications Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pricing & Financials</span>
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Selling Price:</span>
                                                <span className="font-bold text-teal-600 dark:text-teal-400">₹{viewingProductDetails.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Cost Price (COGS):</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{viewingProductDetails.costPrice || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">CGST / SGST Rate:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{viewingProductDetails.cgst || 0}% / {viewingProductDetails.sgst || 0}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Inventory & Brand</span>
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Stock Quantity:</span>
                                                <span className={`font-bold ${viewingProductDetails.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{viewingProductDetails.stock} units</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Brand / Model:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{viewingProductDetails.brand || 'N/A'} / {viewingProductDetails.modelName || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Category:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{typeof viewingProductDetails.category === 'object' ? (viewingProductDetails.category as any).name : viewingProductDetails.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {viewingProductDetails.description && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            {viewingProductDetails.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                                <button
                                    onClick={() => setViewingProductDetails(null)}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

function StatCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
            </div>
        </div>
    );
}

export default AdminDashboard;
