"use client";

import React from "react";
import { BlogForm } from "@/features/blog";

export default function EditBlogClient({ id }: { id: string }) {
    return <BlogForm id={id} />;
}
