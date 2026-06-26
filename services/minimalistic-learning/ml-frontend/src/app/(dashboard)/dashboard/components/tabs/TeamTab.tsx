"use client";

import React, { useState, useEffect } from "react";
import { UserIcon, Plus, XCircle, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export default function TeamTab() {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [teamForm, setTeamForm] = useState({ name: '', role: '', bio: '', imageUrl: '', twitterUrl: '', githubUrl: '', linkedinUrl: '' });
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [isSavingTeam, setIsSavingTeam] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        let isMounted = true;
        api.get('/public/team').then((res) => {
            if (!isMounted) return;
            setTeamMembers(res.data.data || []);
            setIsLoading(false);
        }).catch(() => {
            if (!isMounted) return;
            setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []);

    const handleSaveTeamMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamForm.name || !teamForm.role) return toast.error("Name and Role are required");
        setIsSavingTeam(true);
        const payload = { name: teamForm.name, role: teamForm.role, bio: teamForm.bio, image: teamForm.imageUrl, twitter: teamForm.twitterUrl, github: teamForm.githubUrl, linkedin: teamForm.linkedinUrl };
        try {
            if (editingTeamId) {
                const res = await api.put(`/admin/team/${editingTeamId}`, payload);
                toast.success("Team member updated!");
                setTeamMembers(prev => prev.map(t => t.id === editingTeamId ? res.data.data : t));
            } else {
                const res = await api.post("/admin/team", payload);
                toast.success("Team member added!");
                setTeamMembers(prev => [...prev, res.data.data]);
            }
            setTeamModalOpen(false);
        } catch (err) {
            toast.error("Failed to save team member");
        } finally {
            setIsSavingTeam(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("File excessively large. Limit to 5MB.");
        setIsUploadingImage(true);
        const formData = new FormData(); formData.append("media", file);
        try {
            const res = await api.post("/posts/media/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data?.data?.url) {
                setTeamForm(prev => ({ ...prev, imageUrl: res.data.data.url }));
                toast.success("Image uploaded!");
            }
        } catch {
            toast.error("Cloudinary upload failed");
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" /></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme-accent/10">
                    <div><h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2"><UserIcon size={20} className="text-emerald-500" />Team Management</h3>
                        <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Public Roster Control</p></div>
                    <Button onClick={() => { setEditingTeamId(null); setTeamForm({ name: '', role: '', bio: '', imageUrl: '', twitterUrl: '', githubUrl: '', linkedinUrl: '' }); setTeamModalOpen(true); }} className="px-5 py-2.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"><Plus size={16} /> Add Member</Button>
                </div>
                <div className="grid gap-4">
                    {teamMembers.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-theme-accent/20 rounded-3xl"><p className="text-foreground/50 font-semibold mb-2">No team members available.</p></div>
                    ) : teamMembers.map((t: any) => (
                        <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-theme-element-sec border border-theme-accent/10 rounded-2xl gap-4 group">
                            <div className="flex items-center gap-4">
                                {t.image ? (<img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-theme-accent/20 shrink-0" />) : (<div className="w-12 h-12 rounded-full bg-background border border-theme-accent/20 flex items-center justify-center font-black text-emerald-500 shrink-0">{t.name.substring(0, 2).toUpperCase()}</div>)}
                                <div><h4 className="text-sm font-black text-foreground">{t.name}</h4><p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{t.role}</p></div>
                            </div>
                            <div className="flex gap-2 shrink-0 border-t border-theme-accent/10 pt-3 md:pt-0 md:border-none">
                                <Button onClick={() => { setEditingTeamId(t.id); setTeamForm({ name: t.name || '', role: t.role || '', bio: t.bio || '', imageUrl: t.image || '', twitterUrl: t.twitter || '', githubUrl: t.github || '', linkedinUrl: t.linkedin || '' }); setTeamModalOpen(true); }} className="px-3 py-1.5 bg-background border border-theme-accent/20 text-xs font-bold rounded-lg hover:border-theme-action transition-all text-foreground/70 outline-none">Edit Profile</Button>
                                <Button onClick={() => { if (confirm("Are you sure you want to remove " + t.name + "?")) { const previousMembers = teamMembers; setTeamMembers(prev => prev.filter(item => item.id !== t.id)); api.delete(`/admin/team/${t.id}`).then(() => toast.success("Removed!")).catch(() => { setTeamMembers(previousMembers); toast.error("Failed to remove member"); }); } }} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all outline-none">Remove</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {teamModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-theme-element border border-theme-accent/20 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-theme-accent/10 bg-theme-element-sec/50"><h3 className="text-xl font-black text-foreground">{editingTeamId ? 'Edit Team Member' : 'Add New Member'}</h3><Button onClick={() => setTeamModalOpen(false)} className="text-foreground/50 hover:text-foreground"><XCircle size={24} /></Button></div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="team-form" onSubmit={handleSaveTeamMember} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Full Name *</label><Input required type="text" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} className="w-full bg-background px-4 py-3 rounded-xl text-sm" placeholder="John Doe" /></div>
                                    <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Role / Position *</label><Input required type="text" value={teamForm.role} onChange={e => setTeamForm({ ...teamForm, role: e.target.value })} className="w-full bg-background px-4 py-3 rounded-xl text-sm" placeholder="e.g. Senior Instructor" /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75 flex justify-between items-center"><span>Profile Image URL</span>{isUploadingImage && <div className="text-emerald-500 font-bold text-[10px]"><Loader2 size={12} className="animate-spin inline" /> Uploading...</div>}</label>
                                    <div className="flex gap-2 relative">
                                        <Input type="text" value={teamForm.imageUrl} onChange={e => setTeamForm({ ...teamForm, imageUrl: e.target.value })} className="flex-1 w-full bg-background px-4 py-3 rounded-xl text-sm" placeholder="https://..." />
                                        <div className="relative w-auto bg-theme-element-sec border rounded-xl px-4 py-3 text-xs font-black uppercase flex items-center justify-center cursor-pointer shadow-sm"><span className="pointer-events-none">Upload File</span><Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" /></div>
                                    </div>
                                </div>
                                <div><label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Short Bio</label><textarea rows={3} value={teamForm.bio} onChange={e => setTeamForm({ ...teamForm, bio: e.target.value })} className="w-full bg-background border px-4 py-3 rounded-xl text-sm resize-y" placeholder="Brief background..." /></div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="block text-[10px] font-black uppercase tracking-wider mb-1">GitHub</label><Input type="text" value={teamForm.githubUrl} onChange={e => setTeamForm({ ...teamForm, githubUrl: e.target.value })} className="w-full bg-background border px-3 py-2 rounded-lg text-xs" placeholder="Username/URL" /></div>
                                    <div><label className="block text-[10px] font-black uppercase tracking-wider mb-1">LinkedIn</label><Input type="text" value={teamForm.linkedinUrl} onChange={e => setTeamForm({ ...teamForm, linkedinUrl: e.target.value })} className="w-full bg-background border px-3 py-2 rounded-lg text-xs" placeholder="Username/URL" /></div>
                                    <div><label className="block text-[10px] font-black uppercase tracking-wider mb-1">Twitter</label><Input type="text" value={teamForm.twitterUrl} onChange={e => setTeamForm({ ...teamForm, twitterUrl: e.target.value })} className="w-full bg-background border px-3 py-2 rounded-lg text-xs" placeholder="Username/URL" /></div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-theme-accent/10 bg-theme-element flex justify-end gap-3 shrink-0"><Button onClick={() => setTeamModalOpen(false)} className="px-6 py-3 bg-theme-element-sec text-xs font-black uppercase rounded-xl">Cancel</Button><Button type="submit" form="team-form" disabled={isSavingTeam} className="px-6 py-3 bg-emerald-500 text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2">{isSavingTeam ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Save</Button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
