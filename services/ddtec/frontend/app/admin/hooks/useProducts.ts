"use client";

import { useState } from "react";
import api from "@/lib/api";

export interface Product {
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
    packQuantity?: number;
    packUnit?: string;
    unitSize?: number;
    unitMeasure?: string;
    showAddToCart?: boolean;
    showBuyNow?: boolean;
    isActive: boolean;
    codAvailable?: boolean;
    productType?: 'physical' | 'digital';
    isReturnable?: boolean;
    showDeliveryChecker?: boolean;
    allowedCourierPartners?: string[];
    customDeliveryEstimate?: string;
    createdAt?: string;
    updatedAt?: string;
    couponDetails?: any[];
}

export function useProducts() {
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const fetchProducts = async () => {
        setLoadingProducts(true);
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
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategoriesList(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    return { productsList, setProductsList, categoriesList, loadingProducts, fetchProducts, fetchCategories };
}
