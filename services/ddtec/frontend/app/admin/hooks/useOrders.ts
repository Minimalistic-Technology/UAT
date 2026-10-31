"use client";

import { useState } from "react";
import api from "@/lib/api";

export function useOrders() {
    const [ordersList, setOrdersList] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await api.get('/orders');
            setOrdersList(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    return { ordersList, setOrdersList, loadingOrders, fetchOrders };
}
