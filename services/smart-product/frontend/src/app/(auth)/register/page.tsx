"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setError('');
            // Automatically register them as Admin for now
            const res = await api.post('/auth/register', { ...data, role: 'Admin' });
            if (res.data.success) {
                toast.success(`Khaata ban gaya! Welcome ${res.data.user.name} 🚀`, { style: { borderRadius: '12px', background: '#333', color: '#fff' } });
                login(res.data.user, res.data.token);
                router.push('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">Create an account</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign up to view shared products and save links</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        className="pl-9"
                        {...register('name')}
                        error={errors.name?.message}
                    />
                </div>

                <div className="relative">
                    <Mail className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
                    <Input
                        label="Email"
                        placeholder="name@example.com"
                        className="pl-9"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        {...register('password')}
                        error={errors.password?.message}
                    />
                </div>

                <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                    Create Account
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </motion.div>
    );
}
