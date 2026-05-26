"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Circle, Link2 } from "lucide-react";
import api from "@/lib/axios";

export default function CreateShareLinkPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [expiryDate, setExpiryDate] = useState("");
    const [password, setPassword] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setIsDropdownOpen(true);
        const matched = users.find(u => u.role !== "Admin" && `${u.name} (${u.email})`.toLowerCase() === val.toLowerCase());
        if (matched) {
            setAssignedTo(matched._id);
        } else {
            setAssignedTo("");
        }
    };

    const filteredUsers = users
        .filter(u => u.role !== "Admin")
        .filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

    useEffect(() => {
        Promise.all([api.get("/products"), api.get("/auth/users")])
            .then(([pRes, uRes]) => {
                setProducts(pRes.data);
                setUsers(uRes.data);
            })
            .catch(() => toast.error("Failed to load data"));
    }, []);

    const toggle = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const handleGenerate = async () => {
        if (selectedIds.size === 0) return toast.error("Select at least one product");
        if (!assignedTo) return toast.error("Please select a user to assign this link to");

        setLoading(true);
        try {
            const payload: any = {
                selectedProducts: Array.from(selectedIds),
                assignedTo
            };
            if (expiryDate) payload.expiryDate = new Date(expiryDate).toISOString();
            if (password) payload.password = password;

            const res = await api.post("/share/create", payload);
            const url = `${window.location.origin}/share/${res.data.token}`;
            await navigator.clipboard.writeText(url);
            toast.success("Gift link generated & assigned successfully!");
            router.push("/admin/links");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to generate link");
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Link2 className="w-7 h-7 text-primary" /> Assign Gift Link
                </h1>
                <p className="text-muted-foreground mt-1">Select products to bundle and assign them to a specific user.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selector */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Choose Products</CardTitle>
                            <CardDescription>{selectedIds.size} of {products.length} selected</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                            {products.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No products found. Add some first!</p>
                            ) : products.map(product => {
                                const selected = selectedIds.has(product._id);
                                return (
                                    <div
                                        key={product._id}
                                        onClick={() => toggle(product._id)}
                                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`}>
                                            {selected ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </div>
                                        {product.thumbnail && <img src={product.thumbnail} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{product.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                                        </div>
                                        <Badge variant="outline">${product.price?.toFixed(2)}</Badge>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Link Settings */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Link Assignment</CardTitle>
                            <CardDescription>Assign this link to a specific user.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 relative" ref={dropdownRef}>
                                <Label>Assign to User *</Label>
                                <Input
                                    type="text"
                                    placeholder="Search user by name or email..."
                                    value={searchQuery}
                                    onChange={e => handleSearchChange(e.target.value)}
                                    onFocus={() => setIsDropdownOpen(true)}
                                />
                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-border">
                                        {filteredUsers.map(u => (
                                            <div
                                                key={u._id}
                                                onClick={() => {
                                                    setAssignedTo(u._id);
                                                    setSearchQuery(`${u.name} (${u.email})`);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="p-3 hover:bg-muted/50 cursor-pointer text-sm flex flex-col items-start gap-0.5 transition-colors"
                                            >
                                                <span className="font-semibold text-foreground text-left w-full">{u.name}</span>
                                                <span className="text-xs text-muted-foreground text-left w-full">{u.email}</span>
                                            </div>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <div className="p-3 text-sm text-center text-muted-foreground">No users found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date (optional)</Label>
                                <Input id="expiry" type="datetime-local" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password Protect (optional)</Label>
                                <Input id="password" type="password" placeholder="Leave blank for public" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <Separator />
                            <Button className="w-full gap-2" onClick={handleGenerate} disabled={loading || selectedIds.size === 0 || !assignedTo}>
                                <Link2 className="w-4 h-4" />
                                {loading ? "Assigning..." : `Assign Link (${selectedIds.size})`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
