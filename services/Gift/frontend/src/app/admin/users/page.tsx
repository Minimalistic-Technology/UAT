"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Shield, User as UserIcon } from "lucide-react";
import api from "@/lib/axios";

export default function ManageUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch (error: any) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            toast.success("Role updated successfully!");
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update role");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="w-7 h-7 text-primary" /> Manage Users
                </h1>
                <p className="text-muted-foreground mt-1">View users and assign Admin authority.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                    <CardDescription>All users verified and active on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-10 bg-muted rounded-lg" />
                            <div className="h-10 bg-muted rounded-lg" />
                        </div>
                    ) : (
                        <div className="rounded-xl border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>System Role</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((u) => (
                                            <TableRow key={u._id}>
                                                <TableCell className="font-medium">{u.name}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={u.isVerified ? "default" : "secondary"}>
                                                        {u.isVerified ? "Verified" : "Unverified"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        {u.role === "Admin" ? (
                                                            <><Shield className="w-4 h-4 text-primary" /> <span className="text-primary font-medium">Admin</span></>
                                                        ) : (
                                                            <><UserIcon className="w-4 h-4 text-muted-foreground" /> <span className="text-muted-foreground">User</span></>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {u.role === "User" ? (
                                                        <Button variant="outline" size="sm" onClick={() => handleRoleChange(u._id, "Admin")}>
                                                            Make Admin
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={() => handleRoleChange(u._id, "User")} className="text-destructive hover:bg-destructive/10">
                                                            Remove Admin
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
