"use client";

import { useEffect } from "react";
import PurchaseRecordsView from "../components/PurchaseRecordsView";
import { useProducts } from "../hooks/useProducts";

export default function InventoryPage() {
    const { productsList, categoriesList, fetchProducts, fetchCategories } = useProducts();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PurchaseRecordsView
            productsList={productsList}
            categoriesList={categoriesList}
            onRefreshProducts={fetchProducts}
        />
    );
}
