"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Gift, PackageOpen, AlertCircle, Calendar, ArrowRight, ArrowLeft, Check, CheckCircle2, User, Mail, ShieldAlert, BadgeInfo } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";

export default function SharedLinkView() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(`/login?redirect=/share/${token}`);
        }
    }, [isAuthenticated, token, router]);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Selection & Form States
    const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Information Form Values
    const [empName, setEmpName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [empId, setEmpId] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [submittingOrder, setSubmittingOrder] = useState(false);

    useEffect(() => {
        if (token) {
            api.get(`/share/${token}`)
                .then(res => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.response?.data?.error || 'Gift collection not found or expired');
                    setLoading(false);
                });
        }
    }, [token]);

    // Pre-fill user data when user changes or authenticates
    useEffect(() => {
        if (user) {
            setEmpName(user.name || '');
            setEmpEmail(user.email || '');
        }
    }, [user]);

    const toggleSelection = (productId: string) => {
        const updated = new Set<string>();
        if (!selectedIds.has(productId)) {
            updated.add(productId);
        }
        setSelectedIds(updated);
    };

    const handleNext = () => {
        if (selectedIds.size === 0) {
            return;
        }
        setStep('form');
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!empName || !empEmail || !empId || !address) {
            return;
        }

        setSubmittingOrder(true);
        try {
            await api.post('/orders', {
                sharedLinkId: data._id,
                employeeName: empName,
                employeeEmail: empEmail,
                employeeId: empId,
                address,
                notes,
                selectedProducts: Array.from(selectedIds)
            });
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit order selection. Please try again.');
        } finally {
            setSubmittingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="space-y-8 w-full max-w-6xl px-4">
                    <div className="text-center space-y-4 mb-16">
                        <Skeleton className="h-8 w-32 mx-auto rounded-full" />
                        <Skeleton className="h-12 w-3/4 max-w-md mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-destructive/20">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Link Unavailable</h1>
                    <p className="text-muted-foreground text-lg max-w-sm mx-auto">{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-20">
            {/* Background Glow */}
            <div className="absolute top-0 inset-x-0 h-96 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.15),transparent_70%)]" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 md:pt-20">
                {/* Header */}
                <header className="mb-12 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 flex items-center justify-center gap-2 mx-auto w-fit">
                        <Gift className="w-4 h-4 animate-bounce" /> {APP_NAME} Collection
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                        A Gift Chosen <span className="text-primary">Specially</span> For You
                    </motion.h1>

                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {step === 'select' ? "Click/select the products you want to claim, then press 'Next' to fill in shipping details." :
                            step === 'form' ? "Complete your details below to submit your claim order directly to Admin." : ""}
                    </p>
                </header>

                <AnimatePresence mode="wait">
                    {/* STEP 1: SELECT PRODUCTS */}
                    {step === 'select' && (
                        <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                            {/* Products Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data?.selectedProducts.map((product: any, idx: number) => {
                                    const isSelected = selectedIds.has(product._id);
                                    return (
                                        <motion.div
                                            key={product._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                                            onClick={() => toggleSelection(product._id)}
                                            className="cursor-pointer"
                                        >
                                            <Card className={`overflow-hidden relative group h-full border transition-all duration-305 bg-card flex flex-col rounded-2xl ${isSelected ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border/60 hover:border-primary/40 hover:shadow-lg"}`}>

                                                {/* Selected Check overlay */}
                                                {isSelected && (
                                                    <div className="absolute top-3 left-3 z-20 bg-primary text-primary-foreground p-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </div>
                                                )}

                                                <div className="relative aspect-[4/3] bg-white flex items-center justify-center p-6 border-b border-border/40 overflow-hidden">
                                                    {product.thumbnail ? (
                                                        <img
                                                            src={product.thumbnail}
                                                            alt={product.title}
                                                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-muted-foreground/45">
                                                            <PackageOpen className="w-10 h-10 mb-2" />
                                                            <span className="text-sm font-medium">No Image</span>
                                                        </div>
                                                    )}

                                                    {product.stock === 0 && (
                                                        <Badge variant="destructive" className="absolute top-4 left-4 shadow-md font-semibold text-xs px-2.5 py-0.5">
                                                            Out of Stock
                                                        </Badge>
                                                    )}
                                                    <Badge variant="secondary" className="absolute top-4 right-4 shadow-sm font-bold text-sm bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md px-3 py-1 border-none rounded-full">
                                                        ${product.price?.toFixed(2)}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-6 flex flex-col flex-1 justify-between">
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wider text-primary font-bold mb-2">{product.category}</div>
                                                        <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2 leading-snug">{product.title}</h3>
                                                        <p className="text-muted-foreground text-xs line-clamp-3 leading-relaxed">{product.description}</p>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
                                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                                            {isSelected ? 'Selected' : 'Click to Select'}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Sticky footer action for selection */}
                            <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-6 border rounded-2xl shadow-md gap-4">
                                <div className="text-center sm:text-left">
                                    <h3 className="font-bold text-lg">Selected: {selectedIds.size} product(s)</h3>
                                    <p className="text-xs text-muted-foreground">Confirm selection and proceed to submit info.</p>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto gap-2 bg-primary hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl"
                                    disabled={selectedIds.size === 0}
                                    onClick={handleNext}
                                >
                                    Proceed to Claim <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: SHIPPING / EMPLOYEE FORM */}
                    {step === 'form' && (
                        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl mx-auto">
                            <Card className="rounded-2xl border p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <Button variant="ghost" size="icon" onClick={() => setStep('select')} className="rounded-full">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <div>
                                        <h2 className="font-bold text-xl">Enter Claim Details</h2>
                                        <p className="text-xs text-muted-foreground">Submit details to request delivery approval.</p>
                                    </div>
                                </div>

                                {!isAuthenticated ? (
                                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center text-center gap-4">
                                        <ShieldAlert className="w-10 h-10 text-amber-500" />
                                        <div>
                                            <h4 className="font-bold text-sm">Account Login Required</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Please log in to your account first so your claim is saved to your profile dashboard.</p>
                                        </div>
                                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl" onClick={() => router.push('/login')}>
                                            Go to Sign In
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="empName">Full Name *</Label>
                                            <Input
                                                id="empName"
                                                required
                                                value={empName}
                                                onChange={e => setEmpName(e.target.value)}
                                                placeholder="John Doe"
                                                className="rounded-xl h-10 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="empEmail">Email Address *</Label>
                                            <Input
                                                id="empEmail"
                                                type="email"
                                                required
                                                value={empEmail}
                                                onChange={e => setEmpEmail(e.target.value)}
                                                placeholder="john@company.com"
                                                className="rounded-xl h-10 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="empId">Employee / User ID *</Label>
                                            <Input
                                                id="empId"
                                                required
                                                value={empId}
                                                onChange={e => setEmpId(e.target.value)}
                                                placeholder="EMP-8291"
                                                className="rounded-xl h-10 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="address">Delivery Address *</Label>
                                            <textarea
                                                id="address"
                                                required
                                                rows={3}
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                placeholder="Enter full shipping/office delivery address..."
                                                className="w-full text-sm resize-none rounded-xl border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="remarks">Additional Notes (Optional)</Label>
                                            <textarea
                                                id="remarks"
                                                rows={2}
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                placeholder="Write specific instructions or custom sizing if applicable..."
                                                className="w-full text-sm resize-none rounded-xl border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                        </div>

                                        <Separator className="my-2" />

                                        <Button
                                            type="submit"
                                            className="w-full rounded-xl bg-primary hover:scale-[1.01] transition-transform h-11 font-semibold"
                                            disabled={submittingOrder}
                                        >
                                            {submittingOrder ? "Submitting application..." : "Claim Gift Collection 🎉"}
                                        </Button>
                                    </form>
                                )}
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS CONFIRMATION */}
                    {step === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="w-12 h-12 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold tracking-tight">Gift Submitted!</h2>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                    Your selection is successfully submitted! The details have been dispatched to the Admin console.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border bg-muted/30 text-left border-dashed space-y-2">
                                <div className="flex gap-2 items-center text-xs font-semibold text-foreground">
                                    <BadgeInfo className="w-4 h-4 text-primary" /> What's next?
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Wait for delivery confirmation from HR. You can track this claimed order status anytime in your logged-in profile dashboard dashboard!
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <Button className="w-full rounded-xl" onClick={() => router.push('/profile')}>
                                    Go to Dashboard
                                </Button>
                                <Button variant="ghost" onClick={() => { setStep('select'); setSelectedIds(new Set()); }}>
                                    Back to Collection
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {data?.expiryDate && step === 'select' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-16 text-center flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" /> This gift collection is available until {new Date(data.expiryDate).toLocaleDateString()}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
