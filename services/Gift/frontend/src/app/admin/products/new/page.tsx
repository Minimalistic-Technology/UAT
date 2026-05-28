"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Upload, Package } from "lucide-react";

const PREDEFINED_CATEGORIES = [
    "Electronics & Gadgets",
    "Apparel & Fashion",
    "Home & Living",
    "Office & Stationery",
    "Books & Media",
    "Fitness & Outdoors",
    "Food & Beverages",
    "Beauty & Personal Care",
    "Gift Cards & Vouchers",
    "Kitchen & Dining",
    "Travel & Luggage",
    "General"
];

export default function AddProductPage() {
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(files);
            setPreviews(files.map(f => URL.createObjectURL(f)));
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));
            images.forEach(img => formData.append("images", img));

            await api.post("/products", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Product added successfully!");
            router.push("/admin/products");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Package className="w-7 h-7 text-primary" /> Add New Product
                </h1>
                <p className="text-muted-foreground mt-1">Fill in the product details below.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>Basic information about the product</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Product Name *</Label>
                            <Input id="title" placeholder="e.g. iPhone 15 Pro Max" {...register("title", { required: true })} />
                            {errors.title && <p className="text-xs text-destructive">Name is required</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <textarea
                                id="description"
                                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
                                placeholder="Write product details..."
                                {...register("description", { required: true })}
                            />
                            {errors.description && <p className="text-xs text-destructive">Description is required</p>}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category-select">Category *</Label>
                                    <select
                                        id="category-select"
                                        className="w-full text-sm h-10 px-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "custom") {
                                                setIsCustomCategory(true);
                                                setValue("category", "");
                                            } else {
                                                setIsCustomCategory(false);
                                                setValue("category", val);
                                            }
                                        }}
                                        defaultValue={PREDEFINED_CATEGORIES[0]}
                                    >
                                        {PREDEFINED_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="custom">➕ Custom Category...</option>
                                    </select>
                                    <input type="hidden" defaultValue={PREDEFINED_CATEGORIES[0]} {...register("category", { required: true })} />
                                </div>

                                {isCustomCategory && (
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-category">Type Category Name *</Label>
                                        <Input
                                            id="custom-category"
                                            placeholder="Type custom category name..."
                                            onChange={(e) => setValue("category", e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($) *</Label>
                                <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price", { required: true })} />
                                {errors.price && <p className="text-xs text-destructive">Price is required</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Initial Stock Quantity</Label>
                                <Input id="stock" type="number" placeholder="10" defaultValue="10" {...register("stock")} />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <Label>Product Images</Label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
                                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">Click to upload images</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                            {previews.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {previews.map((src, i) => (
                                        <img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={loading} className="px-8 bg-primary">
                                {loading ? "Saving..." : "Save Product"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
