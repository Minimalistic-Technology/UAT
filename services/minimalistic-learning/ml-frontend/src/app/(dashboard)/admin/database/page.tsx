"use client";
import { DatabaseStudio } from "@/app/(dashboard)/dashboard/components/DatabaseStudio";

export default function DatabaseStudioPage() {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Database Studio</h1>
                <p className="text-sm font-semibold text-foreground/50 uppercase tracking-widest">PostgreSQL Admin Console</p>
            </div>
            <DatabaseStudio />
        </div>
    );
}
