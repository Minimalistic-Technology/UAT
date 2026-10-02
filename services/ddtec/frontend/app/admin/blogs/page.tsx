"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Edit, Trash2, Plus, X } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";

interface Blog {
    _id: string;
    title: string;
    content: string;
    author: string;
    image: string;
    slug: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export default function BlogsPage() {
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [blogsList, setBlogsList] = useState<Blog[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
    const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [newBlog, setNewBlog] = useState({
        title: '',
        content: '',
        author: '',
        image: '',
        slug: '',
        tags: [] as string[]
    });

    const fetchBlogs = async () => {
        setLoadingData(true);
        try {
            const { data } = await api.get('/blogs');
            setBlogsList(data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/blogs', newBlog);
            setBlogsList(prev => [data, ...prev]);
            setIsAddBlogModalOpen(false);
            setNewBlog({ title: '', content: '', author: '', image: '', slug: '', tags: [] });
            showToast("Blog created successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to create blog", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog) return;
        setIsSubmitting(true);
        try {
            const { data } = await api.put(`/blogs/${editingBlog._id}`, editingBlog);
            setBlogsList(prev => prev.map(b => b._id === editingBlog._id ? data : b));
            setIsEditBlogModalOpen(false);
            setEditingBlog(null);
            showToast("Blog updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update blog", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBlog = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this blog?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/blogs/${id}`);
            setBlogsList(prev => prev.filter(b => b._id !== id));
            showToast("Blog deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete blog", "error");
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                    <button onClick={() => setIsAddBlogModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                        <Plus className="size-4" /> Add Blog
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-teal-600 size-10" />
                        </div>
                    ) : blogsList.length === 0 ? (
                        <div className="text-center py-16">
                            <Edit className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 text-lg">No blogs yet</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Create your first blog post to get started</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Author</th>
                                    <th className="p-4">Slug</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {blogsList.map(blog => (
                                    <tr key={blog._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white line-clamp-1 max-w-xs">{blog.title}</div>
                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {blog.tags.slice(0, 2).map((tag, idx) => (
                                                        <span key={idx} className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{blog.author}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{blog.slug}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => { setEditingBlog(blog); setIsEditBlogModalOpen(true); }}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit Blog"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBlog(blog._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Delete Blog"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Blog Modal */}
            <AnimatePresence>
                {isAddBlogModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsAddBlogModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Blog</h3>
                                <button onClick={() => setIsAddBlogModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateBlog} className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={newBlog.title}
                                            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="Enter blog title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL-friendly)</label>
                                        <input
                                            required
                                            type="text"
                                            value={newBlog.slug}
                                            onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                            placeholder="my-blog-post"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                            <input
                                                required
                                                type="text"
                                                value={newBlog.author}
                                                onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                            <input
                                                type="url"
                                                value={newBlog.image}
                                                onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={newBlog.tags.join(', ')}
                                            onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="technology, tools, tips"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                        <textarea
                                            required
                                            value={newBlog.content}
                                            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[200px] resize-y"
                                            placeholder="Write your blog content here..."
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddBlogModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Blog'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Blog Modal */}
            <AnimatePresence>
                {isEditBlogModalOpen && editingBlog && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsEditBlogModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Blog</h3>
                                <button onClick={() => setIsEditBlogModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateBlog} className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingBlog.title}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL-friendly)</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingBlog.slug}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                            <input
                                                required
                                                type="text"
                                                value={editingBlog.author}
                                                onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                            <input
                                                type="url"
                                                value={editingBlog.image}
                                                onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={editingBlog.tags.join(', ')}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                        <textarea
                                            required
                                            value={editingBlog.content}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[200px] resize-y"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditBlogModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
