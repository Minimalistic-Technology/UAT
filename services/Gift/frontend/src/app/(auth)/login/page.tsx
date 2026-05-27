"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '';
    const { login } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        try {
            setError('');
            const res = await api.post('/auth/login', data);
            if (res.data.success) {
                toast.success(`Welcome back, ${res.data.user.name}! ✨`);
                login(res.data.user, res.data.token);
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    router.push(res.data.user.role === 'Admin' ? '/admin/dashboard' : '/profile');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access your account</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" placeholder="name@example.com" className="pl-9" {...register('email')} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"} className="text-primary hover:underline font-medium">Sign up</Link>
            </div>
        </motion.div>
    );
}
