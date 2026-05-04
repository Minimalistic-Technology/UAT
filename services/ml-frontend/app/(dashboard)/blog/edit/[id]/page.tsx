"use client";

import React from "react";
import { BlogForm } from "@/features/blog";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const params = useParams();
  const id = params.id as string;

  return <BlogForm id={id} />;
}
