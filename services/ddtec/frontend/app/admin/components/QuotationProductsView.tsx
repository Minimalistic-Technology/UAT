import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface QuotationItem {
    _id: string;
    name: string;
    price: number;
    hsnCode?: string;
    unit?: string;
    description?: string;
    isActive: boolean;
}

const QuotationProductsView = () => {
    const [items, setItems] = useState<QuotationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<QuotationItem | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        hsnCode: '',
        unit: 'Nos',
        description: ''
    });

    useEffect(() => {
        fetchItems();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData, price: Number(formData.price) };
            if (editingItem) {
                await api.put(`/quotation-items/${editingItem._id}`, payload);
                alert('Quotation product updated successfully');
            } else {
                await api.post('/quotation-items', payload);
                alert('Quotation product created successfully');
            }
            fetchItems();
            handleCloseModal();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || 'Failed to save quotation product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/quotation-items/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete quotation product');
        }
    };

    const handleEditClick = (item: QuotationItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: String(item.price),
            hsnCode: item.hsnCode || '',
            unit: item.unit || 'Nos',
            description: item.description || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', price: '', hsnCode: '', unit: 'Nos', description: '' });
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
                                    <th className="p-4">Name</th>
                                    <th className="p-4">HSN/SAC</th>
                                    <th className="p-4">Unit</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {items.map(item => (
                                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                            {item.description && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{item.hsnCode || '-'}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{item.unit}</td>
                                        <td className="p-4 text-slate-900 dark:text-white font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
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
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingItem ? 'Edit Quotation Product' : 'Add Quotation Product'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
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
