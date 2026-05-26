"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

export default function AddProductPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));
            images.forEach(img => formData.append('images', img));

            await api.post('/products', formData);
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Failed to create product', error);
            const serverMsg = error.response?.data?.error || error.message;
            alert(`Server Error: ${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Simple Product</h1>
                <p className="text-muted-foreground mt-1">Fill in the basic details to add a new item.</p>
            </div>

            <div className="glass-card p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Product Name"
                        placeholder="e.g. iPhone 15 Pro Max"
                        {...register('title', { required: 'Name is required' })}
                        error={errors.title?.message as string}
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Description</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all shadow-sm"
                            placeholder="Write some details about the item..."
                            {...register('description', { required: 'Description is required' })}
                        />
                        {errors.description?.message && <p className="mt-1.5 text-xs text-red-500">{errors.description.message as string}</p>}
                    </div>

                    <Input
                        type="number"
                        label="Price ($)"
                        placeholder="e.g. 99.99"
                        step="0.01"
                        {...register('price', { required: 'Price is required' })}
                        error={errors.price?.message as string}
                    />

                    <div className="space-y-2 pb-4">
                        <label className="block text-sm font-medium text-muted-foreground">Upload Pictures</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button type="submit" isLoading={loading} className="px-10 rounded-full">
                            Save Item
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
