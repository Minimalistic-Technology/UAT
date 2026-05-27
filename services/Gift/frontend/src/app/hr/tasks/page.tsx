"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList } from "lucide-react";

export default function HRTasksPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FileText className="w-8 h-8 text-violet-600" /> HR Tasks
                </h1>
                <p className="text-muted-foreground mt-1">Review department tasks and assignments.</p>
            </div>

            <Card className="rounded-2xl border border-dashed border-violet-500/20">
                <CardHeader>
                    <CardTitle className="text-violet-600 text-lg flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" /> Pending Features
                    </CardTitle>
                    <CardDescription>HR Specific operations will be defined by the client.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    Once the HR Admin features are shared, this section will host employee onboarding gifts, corporate rewards assignment metrics, and customized HR lists.
                </CardContent>
            </Card>
        </div>
    );
}
