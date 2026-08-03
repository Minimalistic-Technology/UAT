import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, X, Loader2, ImagePlus, ImageOff } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/app/_context/ToastContext';

interface QuotationItem {
    _id: string;
    name: string;
    price: number;
    hsnCode?: string;
    unit?: string;
    description?: string;
    image?: string;
    isActive: boolean;
    cgst?: number;
    sgst?: number;
    product?: string;
}

interface CatalogProduct {
    _id: string;
    name: string;
    price: number;
    image?: string;
    cgst?: number;
    sgst?: number;
}

const MAX_IMAGE_DIMENSION = 800;

function fileToCompressedFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => {
            const img = new window.Image();
            img.onerror = reject;
            img.onload = () => {
                let { width, height } = img;
                if (width > height && width > MAX_IMAGE_DIMENSION) {
                    height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
                    width = MAX_IMAGE_DIMENSION;
                } else if (height > MAX_IMAGE_DIMENSION) {
                    width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
                    height = MAX_IMAGE_DIMENSION;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas not supported'));
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('Failed to compress image'));
                    resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.8);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
}

const QuotationProductsView = () => {
    const { showToast } = useToast();
    const [items, setItems] = useState<QuotationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<QuotationItem | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageRemoved, setImageRemoved] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        hsnCode: '',
        unit: 'Nos',
        description: '',
        cgst: '',
        sgst: '',
        product: '',
        image: ''
    });
    const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);

    useEffect(() => {
        fetchItems();
        fetchCatalogProducts();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/quotation-items/all');
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch quotation products', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setCatalogProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const handleSelectProduct = (productId: string) => {
        const product = catalogProducts.find(p => p._id === productId);
        if (!product) {
            setFormData({ ...formData, product: '' });
            return;
        }
        setFormData({
            ...formData,
            product: product._id,
            name: product.name,
            price: String(product.price),
            cgst: String(product.cgst ?? 0),
            sgst: String(product.sgst ?? 0),
            image: product.image || ''
        });
        setImageFile(null);
        setImageRemoved(false);
        setImagePreview(product.image || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (Number(formData.price) < 0 || Number(formData.cgst) < 0 || Number(formData.sgst) < 0) {
                showToast('Price, CGST and SGST cannot be negative', 'error');
                setIsSubmitting(false);
                return;
            }

            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('price', String(Number(formData.price)));
            payload.append('hsnCode', formData.hsnCode);
            payload.append('unit', formData.unit);
            payload.append('description', formData.description);
            payload.append('cgst', String(Number(formData.cgst) || 0));
            payload.append('sgst', String(Number(formData.sgst) || 0));
            payload.append('product', formData.product);
            if (imageFile) {
                payload.append('image', imageFile);
            } else if (imageRemoved) {
                payload.append('image', '');
            } else if (formData.image) {
                payload.append('image', formData.image);
            }

            if (editingItem) {
                await api.put(`/quotation-items/${editingItem._id}`, payload);
                showToast('Quotation product updated successfully', 'success');
            } else {
                await api.post('/quotation-items', payload);
                showToast('Quotation product created successfully', 'success');
            }
            fetchItems();
            handleCloseModal();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || 'Failed to save quotation product', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/quotation-items/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
            showToast('Quotation product deleted successfully', 'success');
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || 'Failed to delete quotation product', 'error');
        }
    };

    const handleEditClick = (item: QuotationItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: String(item.price),
            hsnCode: item.hsnCode || '',
            unit: item.unit || 'Nos',
            description: item.description || '',
            cgst: String(item.cgst ?? 0),
            sgst: String(item.sgst ?? 0),
            product: item.product || '',
            image: ''
        });
        setImageFile(null);
        setImageRemoved(false);
        setImagePreview(item.image || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', price: '', hsnCode: '', unit: 'Nos', description: '', cgst: '', sgst: '', product: '', image: '' });
        setImageFile(null);
        setImagePreview('');
        setImageRemoved(false);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingImage(true);
        try {
            const compressed = await fileToCompressedFile(file);
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
            setImageRemoved(false);
        } catch (error) {
            console.error('Failed to process image', error);
            showToast('Failed to process image', 'error');
        } finally {
            setIsUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setImageRemoved(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="size-6 text-teal-600" />
                    Quotation Products
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    <Plus className="size-4" /> Add Product
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-teal-600 size-10" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No quotation products yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Add products so customers can build a quotation</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">HSN/SAC</th>
                                    <th className="p-4">Unit</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">GST</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {items.map(item => (
                                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover border border-slate-200 dark:border-slate-600" />
                                            ) : (
                                                <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                    <ImageOff className="size-5 text-slate-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                            {item.description && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{item.hsnCode || '-'}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{item.unit}</td>
                                        <td className="p-4 text-slate-900 dark:text-white font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">CGST {item.cgst ?? 0}% / SGST {item.sgst ?? 0}%</td>
                                        <td className="p-4 text-right flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingItem ? 'Edit Quotation Product' : 'Add Quotation Product'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prefill from Product (Optional)</label>
                                    <select
                                        value={formData.product}
                                        onChange={(e) => handleSelectProduct(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                    >
                                        <option value="">— Select a product to copy details —</option>
                                        {catalogProducts.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} (₹{p.price.toLocaleString('en-IN')})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">Copies name, price, image, CGST &amp; SGST — all fields below stay fully editable.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="size-20 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700/50 shrink-0">
                                            {isUploadingImage ? (
                                                <Loader2 className="animate-spin size-5 text-teal-600" />
                                            ) : imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImagePlus className="size-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors">
                                                <ImagePlus className="size-4" />
                                                {imagePreview ? 'Change Image' : 'Upload Image'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="ml-2 text-sm text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                        placeholder="e.g., Ace A1 Smartphone"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                            placeholder="Nos"
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
                                            value={formData.cgst}
                                            onChange={(e) => setFormData({ ...formData, cgst: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                            placeholder="9"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SGST (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.sgst}
                                            onChange={(e) => setFormData({ ...formData, sgst: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                            placeholder="9"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">HSN/SAC Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.hsnCode}
                                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                        placeholder="e.g., 8517"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                        rows={2}
                                        placeholder="Short description..."
                                    />
                                </div>

                                <div className="col-span-2 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isUploadingImage}
                                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-300 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-4" /> : null}
                                        {editingItem ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuotationProductsView;
