"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Shield, User as UserIcon, Briefcase, Trash2, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ManageUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

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

    const handleDeleteUser = async (userId: string) => {
        setUserToDelete(userId);
        setConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/auth/users/${userToDelete}`);
            toast.success("User deleted successfully!");
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete user");
        } finally {
            setConfirmOpen(false);
            setUserToDelete(null);
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
                                                        ) : u.role === "HRAdmin" ? (
                                                            <><Briefcase className="w-4 h-4 text-violet-500" /> <span className="text-violet-500 font-medium">HR Admin</span></>
                                                        ) : (
                                                            <><UserIcon className="w-4 h-4 text-muted-foreground" /> <span className="text-muted-foreground">User</span></>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <Select value={u.role} onValueChange={(newRole) => handleRoleChange(u._id, newRole)}>
                                                            <SelectTrigger className="w-[120px] h-8 text-xs bg-background">
                                                                <SelectValue placeholder="Set Role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="User">User</SelectItem>
                                                                <SelectItem value="HRAdmin">HR Admin</SelectItem>
                                                                <SelectItem value="Admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                                            onClick={() => handleDeleteUser(u._id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md p-6 bg-card border rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5 animate-bounce-once" /> Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            Are you sure you want to delete this user? This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={executeDelete} className="rounded-xl shadow-md">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
