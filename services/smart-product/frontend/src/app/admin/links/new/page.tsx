"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function CreateShareLinkPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const [expiryDate, setExpiryDate] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Fetch products to select from
        api.get('/products').then(({ data }) => setProducts(data)).catch(console.error);
    }, []);

    const toggleProduct = (id: string) => {
        const newPaths = new Set(selectedIds);
        if (newPaths.has(id)) newPaths.delete(id);
        else newPaths.add(id);
        setSelectedIds(newPaths);
    };

    const handleGenerate = async () => {
        if (selectedIds.size === 0) return toast.error('Please select at least one product');
        setLoading(true);
        try {
            const payload: any = {
                selectedProducts: Array.from(selectedIds)
            };
            if (expiryDate) payload.expiryDate = new Date(expiryDate).toISOString();
            if (password) payload.password = password;

            const res = await api.post('/share/create', payload);

            const shareUrl = `${window.location.origin}/share/${res.data.token}`;
            navigator.clipboard.writeText(shareUrl);

            toast.success(`Share Link generated & copied!`);
            router.push('/admin/links');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate secure link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Generate Share Link</h1>
                <p className="text-muted-foreground mt-1">Select products to share securely</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Select Products ({selectedIds.size} selected)</h2>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {products.map(product => (
                            <div
                                key={product._id}
                                onClick={() => toggleProduct(product._id)}
                                className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selectedIds.has(product._id)
                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                    : 'border-secondary/50 hover:border-primary/50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedIds.has(product._id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                    {selectedIds.has(product._id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <div className="flex-1 font-medium">{product.title}</div>
                                <div className="font-semibold text-primary">${product.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Link Settings</h2>
                        <Input
                            label="Expiry Date (Optional)"
                            type="datetime-local"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                        <Input
                            label="Password Protect (Optional)"
                            type="password"
                            placeholder="Leave empty for public"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button className="w-full mt-4" onClick={handleGenerate} isLoading={loading}>
                            Generate Secure Link
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
