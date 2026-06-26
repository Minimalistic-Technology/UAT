"use client";

import React, { useState } from "react";
import { UserIcon, Plus, XCircle, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

const defaultFormState = {
  name: "",
  role: "",
  bio: "",
  imageUrl: "",
  twitterUrl: "",
  githubUrl: "",
  linkedinUrl: "",
};

export default function TeamTab() {
  const queryClient = useQueryClient();

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState(defaultFormState);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["admin_team"],
    queryFn: async () => {
      const res = await api.get("/public/team");
      return res.data?.data || [];
    },
  });

  const saveTeamMutation = useMutation({
    mutationFn: async (payload: Partial<TeamMember>) => {
      if (editingTeamId) {
        return await api.put(`/admin/team/${editingTeamId}`, payload);
      }
      return await api.post("/admin/team", payload);
    },
    onSuccess: () => {
      toast.success(
        editingTeamId
          ? "Team member updated successfully."
          : "Team member added successfully.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin_team"] });
      setTeamModalOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err.response?.status === 403
          ? "Access Denied."
          : "Failed to save team member.";
      toast.error(err.response?.data?.message || msg);
    },
  });

  const removeTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/team/${id}`);
    },
    onSuccess: () => {
      toast.success("Team member removed.");
      queryClient.invalidateQueries({ queryKey: ["admin_team"] });
    },
    onError: (err: any) => {
      const msg =
        err.response?.status === 403
          ? "Access Denied."
          : "Failed to remove team member.";
      toast.error(err.response?.data?.message || msg);
    },
  });

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.role) {
      toast.error("Name and Role are required fields.");
      return;
    }

    saveTeamMutation.mutate({
      name: teamForm.name,
      role: teamForm.role,
      bio: teamForm.bio,
      image: teamForm.imageUrl,
      twitter: teamForm.twitterUrl,
      github: teamForm.githubUrl,
      linkedin: teamForm.linkedinUrl,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File excessively large. Limit to 5MB.");
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await api.post("/posts/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.data?.url) {
        setTeamForm((prev) => ({ ...prev, imageUrl: res.data.data.url }));
        toast.success("Image uploaded!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cloudinary upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openModalForNew = () => {
    setEditingTeamId(null);
    setTeamForm(defaultFormState);
    setTeamModalOpen(true);
  };

  const openModalForEdit = (member: TeamMember) => {
    setEditingTeamId(member.id);
    setTeamForm({
      name: member.name || "",
      role: member.role || "",
      bio: member.bio || "",
      imageUrl: member.image || "",
      twitterUrl: member.twitter || "",
      githubUrl: member.github || "",
      linkedinUrl: member.linkedin || "",
    });
    setTeamModalOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
      removeTeamMutation.mutate(member.id);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative h-10 w-10">
          <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in relative space-y-8 duration-500">
      <div className="bg-theme-element border-theme-accent/20 rounded-[2rem] border p-6 shadow-sm sm:p-8">
        <div className="border-theme-accent/10 mb-8 flex items-center justify-between border-b pb-6">
          <div>
            <h3 className="text-foreground mb-1 flex items-center gap-2 text-xl font-black">
              <UserIcon size={20} className="text-emerald-500" />
              Team Management
            </h3>
            <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
              Public Roster Control
            </p>
          </div>
          <Button
            onClick={openModalForNew}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-lg transition-all hover:shadow-emerald-500/20"
          >
            <Plus size={16} /> Add Member
          </Button>
        </div>

        <div className="grid gap-4">
          {teamMembers.length === 0 ? (
            <div className="border-theme-accent/20 rounded-3xl border-2 border-dashed py-16 text-center">
              <p className="text-foreground/50 mb-2 font-semibold">
                No team members available.
              </p>
            </div>
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-theme-element-sec border-theme-accent/10 group flex flex-col justify-between gap-4 rounded-2xl border p-5 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="border-theme-accent/20 h-12 w-12 shrink-0 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="bg-background border-theme-accent/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border font-black text-emerald-500">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-foreground text-sm font-black">
                      {member.name}
                    </h4>
                    <p className="text-foreground/50 text-[10px] font-bold tracking-widest uppercase">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="border-theme-accent/10 flex shrink-0 gap-2 border-t pt-3 md:border-none md:pt-0">
                  <Button
                    onClick={() => openModalForEdit(member)}
                    className="bg-background border-theme-accent/20 hover:border-theme-action text-foreground/70 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all outline-none"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => handleDelete(member)}
                    disabled={removeTeamMutation.isPending}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 transition-all outline-none hover:bg-red-500 hover:text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {teamModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="bg-theme-element border-theme-accent/20 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border shadow-2xl">
            <div className="border-theme-accent/10 bg-theme-element-sec/50 flex items-center justify-between border-b p-6">
              <h3 className="text-foreground text-xl font-black">
                {editingTeamId ? "Edit Team Member" : "Add New Member"}
              </h3>
              <Button
                onClick={() => setTeamModalOpen(false)}
                className="text-foreground/50 hover:text-foreground"
              >
                <XCircle size={24} />
              </Button>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              <form
                id="team-form"
                onSubmit={handleSaveTeamMember}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
                      Full Name *
                    </label>
                    <Input
                      required
                      type="text"
                      value={teamForm.name}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, name: e.target.value })
                      }
                      className="bg-background w-full rounded-xl px-4 py-3 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
                      Role / Position *
                    </label>
                    <Input
                      required
                      type="text"
                      value={teamForm.role}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, role: e.target.value })
                      }
                      className="bg-background w-full rounded-xl px-4 py-3 text-sm"
                      placeholder="e.g. Senior Instructor"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-foreground/75 mb-2 block flex items-center justify-between text-xs font-black tracking-wider uppercase">
                    <span>Profile Image URL</span>
                    {isUploadingImage && (
                      <div className="text-[10px] font-bold text-emerald-500">
                        <Loader2 size={12} className="inline animate-spin" />{" "}
                        Uploading...
                      </div>
                    )}
                  </label>
                  <div className="relative flex gap-2">
                    <Input
                      type="text"
                      value={teamForm.imageUrl}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, imageUrl: e.target.value })
                      }
                      className="bg-background w-full flex-1 rounded-xl px-4 py-3 text-sm"
                      placeholder="https://..."
                    />
                    <div className="bg-theme-element-sec relative flex w-auto cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-xs font-black uppercase shadow-sm">
                      <span className="pointer-events-none">Upload File</span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
                    Short Bio
                  </label>
                  <textarea
                    rows={3}
                    value={teamForm.bio}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, bio: e.target.value })
                    }
                    className="bg-background w-full resize-y rounded-xl border px-4 py-3 text-sm"
                    placeholder="Brief background..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-black tracking-wider uppercase">
                      GitHub
                    </label>
                    <Input
                      type="text"
                      value={teamForm.githubUrl}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, githubUrl: e.target.value })
                      }
                      className="bg-background w-full rounded-lg border px-3 py-2 text-xs"
                      placeholder="Username/URL"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black tracking-wider uppercase">
                      LinkedIn
                    </label>
                    <Input
                      type="text"
                      value={teamForm.linkedinUrl}
                      onChange={(e) =>
                        setTeamForm({
                          ...teamForm,
                          linkedinUrl: e.target.value,
                        })
                      }
                      className="bg-background w-full rounded-lg border px-3 py-2 text-xs"
                      placeholder="Username/URL"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black tracking-wider uppercase">
                      Twitter
                    </label>
                    <Input
                      type="text"
                      value={teamForm.twitterUrl}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, twitterUrl: e.target.value })
                      }
                      className="bg-background w-full rounded-lg border px-3 py-2 text-xs"
                      placeholder="Username/URL"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="border-theme-accent/10 bg-theme-element flex shrink-0 justify-end gap-3 border-t p-6">
              <Button
                onClick={() => setTeamModalOpen(false)}
                className="bg-theme-element-sec rounded-xl px-6 py-3 text-xs font-black uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="team-form"
                disabled={saveTeamMutation.isPending}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-white uppercase"
              >
                {saveTeamMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}{" "}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
