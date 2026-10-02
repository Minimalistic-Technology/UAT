"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import api from "@/lib/api";

interface Message {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    createdAt: string;
}

export default function MessagesPage() {
    const [messagesList, setMessagesList] = useState<Message[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoadingData(true);
            try {
                const res = await api.get('/contact');
                setMessagesList(res.data);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchMessages();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                <span className="text-sm text-slate-500">{messagesList.length} Total Messages</span>
            </div>
            <div className="overflow-x-auto">
                {loadingData ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-teal-600 size-10" />
                    </div>
                ) : messagesList.length === 0 ? (
                    <div className="text-center py-16">
                        <Mail className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No messages yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Messages from the contact form will appear here</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">From</th>
                                <th className="p-4">Message</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {messagesList.map(msg => (
                                <tr key={msg._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{msg.firstName} {msg.lastName}</div>
                                        <div className="text-sm text-slate-400">{msg.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 max-w-md">{msg.message}</p>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <a
                                            href={`mailto:${msg.email}?subject=Re: Your message&body=Hi ${msg.firstName},%0D%0A%0D%0A`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                        >
                                            <Mail className="size-4" />
                                            Reply
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
