"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Product State
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState("");

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products");
            setProducts(data);
        } catch { toast.error("Failed to load products"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted");
            setProducts(p => p.filter(x => x._id !== id));
        } catch { toast.error("Failed to delete"); }
    };

    const openEditDialog = (product: any) => {
        setSelectedProduct(product);
        setEditName(product.title);
        setEditDesc(product.description || "");
        setEditCategory(product.category || "General");
        setEditPrice(product.price.toString());
        setEditImage(null);
        setEditImagePreview(product.thumbnail || "");
        setEditDialogOpen(true);
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName || !editDesc || !editPrice) {
            toast.error("Please fill all required fields");
            return;
        }

        setEditLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", editName);
            formData.append("description", editDesc);
            formData.append("price", editPrice);
            formData.append("category", editCategory);
            if (editImage) {
                formData.append("images", editImage);
            }

            await api.put(`/products/${selectedProduct._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Product updated successfully!");
            setEditDialogOpen(false);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update product");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">{products.length} products in your catalog</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            ) : products.length === 0 ? (
                <Card className="py-16 text-center">
                    <CardContent className="flex flex-col items-center gap-3">
                        <Package className="w-10 h-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No products yet. Add your first product!</p>
                        <Link href="/admin/products/new">
                            <Button className="mt-2 gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map((product, i) => (
                        <motion.div key={product._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                            <Card className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full rounded-2xl">
                                <div className="relative aspect-[4/3] bg-white flex items-center justify-center p-4 border-b border-border/40 overflow-hidden">
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground/45">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                    {product.stock === 0 && <Badge className="absolute top-3 left-3" variant="destructive">Out of Stock</Badge>}
                                </div>
                                <CardContent className="p-4 flex flex-col flex-1 justify-between">
                                    <div>
                                        <h3 className="font-semibold text-base truncate">{product.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{product.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-1">
                                        <span className="text-lg font-bold text-primary">${product.price?.toFixed(2)}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditDialog(product)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(product._id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Product Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Make changes to product metadata and images.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="edit-name">Product Name *</Label>
                            <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-desc">Description *</Label>
                            <textarea
                                id="edit-desc"
                                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="edit-price">Price ($) *</Label>
                                <Input id="edit-price" type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-category">Category</Label>
                                <Input id="edit-category" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
                            </div>
                        </div>

                        {/* Image Preview & Upload Change */}
                        <div className="space-y-2">
                            <Label>Product Image</Label>
                            <div className="flex items-center gap-4">
                                {editImagePreview && (
                                    <img src={editImagePreview} alt="" className="w-16 h-16 object-cover rounded-lg border flex-shrink-0" />
                                )}
                                <label className="flex items-center justify-center flex-1 h-16 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all gap-2 text-sm text-muted-foreground">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload New Image</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading ? "Updating..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
