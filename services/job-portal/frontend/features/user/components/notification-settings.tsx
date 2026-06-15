"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export function NotificationSettings() {
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [featureEnabled, setFeatureEnabled] = useState(true);

    useEffect(() => {
        async function fetchPreference() {
            try {
                const response = await apiClient.get("/api/notifications/preference");
                if (response.data?.success) {
                    setIsBlocked(response.data.data.isBlocked);
                }
            } catch (error: any) {
                if (error.response?.status === 403) {
                    setFeatureEnabled(false);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchPreference();
    }, []);

    const handleToggle = async (checked: boolean) => {
        setIsBlocked(checked);
        try {
            const response = await apiClient.post("/api/notifications/preference/toggle", { isBlocked: checked });
            if (response.data?.success) {
                toast.success("Preference Updated", {
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            setIsBlocked(!checked); // Reset if fails
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to update notification preference.",
            });
        }
    };

    if (!featureEnabled) {
        return null; // Don't show anything if feature is globally disabled via feature flag
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive alerts and messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Mute Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            Block all incoming notifications across the platform.
                        </p>
                    </div>
                    <Switch
                        checked={isBlocked}
                        onCheckedChange={handleToggle}
                        disabled={loading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
