"use client";

import { useState, useEffect } from "react";
import { InstructorAPI } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Bell, Lock, Settings2, Shield } from "lucide-react";
import ProfileTab from "@/components/instructor/settings/ProfileTab";
import NotificationsTab from "@/components/instructor/settings/NotificationsTab";
import PrivacyTab from "@/components/instructor/settings/PrivacyTab";
import CourseDefaultsTab from "@/components/instructor/settings/CourseDefaultsTab";
import SecurityTab from "@/components/instructor/settings/SecurityTab";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await InstructorAPI.getMySettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="privacy">
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy
                    </TabsTrigger>
                    <TabsTrigger value="defaults">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Defaults
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileTab settings={settings} onUpdate={fetchSettings} />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsTab settings={settings} onUpdate={fetchSettings} />
                </TabsContent>

                <TabsContent value="privacy">
                    <PrivacyTab settings={settings} onUpdate={fetchSettings} />
                </TabsContent>

                <TabsContent value="defaults">
                    <CourseDefaultsTab settings={settings} onUpdate={fetchSettings} />
                </TabsContent>

                <TabsContent value="security">
                    <SecurityTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}