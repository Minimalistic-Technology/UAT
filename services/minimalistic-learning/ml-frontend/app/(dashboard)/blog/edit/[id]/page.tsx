import React from "react";
import EditBlogClient from "./EditBlogClient";

export async function generateStaticParams() {
  return [{ id: 'fallback-id' }];
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <EditBlogClient id={resolvedParams.id} />;
}
