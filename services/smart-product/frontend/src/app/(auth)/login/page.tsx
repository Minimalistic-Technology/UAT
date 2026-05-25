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
import { Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError('');
            const res = await api.post('/auth/login', data);
            if (res.data.success) {
                toast.success(`Welcome back, ${res.data.user.name}! ✨`, { style: { borderRadius: '12px', background: '#333', color: '#fff' } });
                login(res.data.user, res.data.token);
                if (res.data.user.role === 'Admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access your account</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    Sign In
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
        </motion.div>
    );
}
