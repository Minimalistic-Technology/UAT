"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

/**
 * Silently fires POST /posts/slug/:slug/view when the blog page mounts.
 * Instagram-style: server deduplicates by userId or IP hash — 1 view per unique visitor.
 */
export default function ViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        if (!slug) return;
        // Fire-and-forget — do NOT await, do NOT show errors to user
        api.post(`/posts/slug/${slug}/view`).catch(() => { });
    }, [slug]);

    return null; // Renders nothing
}
