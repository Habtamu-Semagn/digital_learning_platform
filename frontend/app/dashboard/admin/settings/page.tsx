"use client";

import { useState, useEffect } from "react";
import { SuperAdminAPI, SystemConfig } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Save, Loader2 } from "lucide-react";

export default function SystemSettingsPage() {
    const [config, setConfig] = useState<SystemConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        siteName: "",
        siteDescription: "",
        maintenanceMode: false,
        allowedFileTypes: [] as string[],
        maxFileSize: 0,
    });

    // Fetch current config
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const data = await SuperAdminAPI.getSystemConfig();
                setConfig(data);
                setFormData({
                    siteName: data.siteName,
                    siteDescription: data.siteDescription,
                    maintenanceMode: data.maintenanceMode,
                    allowedFileTypes: data.allowedFileTypes,
                    maxFileSize: data.maxFileSize,
                });
            } catch (error) {
                console.error("Failed to fetch system config:", error);
                toast.error("Failed to load system configuration");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            const updatedConfig = await SuperAdminAPI.updateSystemConfig(formData);
            setConfig(updatedConfig);
            toast.success("System configuration updated successfully");
        } catch (error) {
            console.error("Failed to update config:", error);
            toast.error("Failed to update system configuration");
        } finally {
            setSaving(false);
        }
    };

    // Handle file types input (comma-separated)
    const handleFileTypesChange = (value: string) => {
        const types = value.split(",").map((t) => t.trim()).filter(Boolean);
        setFormData({ ...formData, allowedFileTypes: types });
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
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    System Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage platform configuration and settings
                </p>
            </div>

            {/* Configuration Form */}
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Site Name */}
                            <div className="space-y-2">
                                <Label htmlFor="siteName">Site Name</Label>
                                <Input
                                    id="siteName"
                                    value={formData.siteName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, siteName: e.target.value })
                                    }
                                    placeholder="Enter site name"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    The name of your learning platform
                                </p>
                            </div>

                            {/* Site Description */}
                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    value={formData.siteDescription}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            siteDescription: e.target.value,
                                        })
                                    }
                                    placeholder="Enter site description"
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    A brief description of your platform
                                </p>
                            </div>

                            {/* Maintenance Mode */}
                            <div className="flex items-center justify-between space-y-2">
                                <div className="space-y-0.5">
                                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enable to put the platform in maintenance mode
                                    </p>
                                </div>
                                <Switch
                                    id="maintenanceMode"
                                    checked={formData.maintenanceMode}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, maintenanceMode: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>File Upload Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Allowed File Types */}
                            <div className="space-y-2">
                                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                                <Input
                                    id="allowedFileTypes"
                                    value={formData.allowedFileTypes.join(", ")}
                                    onChange={(e) => handleFileTypesChange(e.target.value)}
                                    placeholder="e.g., pdf, mp4, jpg, png"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Comma-separated list of allowed file extensions
                                </p>
                            </div>

                            {/* Max File Size */}
                            <div className="space-y-2">
                                <Label htmlFor="maxFileSize">
                                    Max File Size (MB)
                                </Label>
                                <Input
                                    id="maxFileSize"
                                    type="number"
                                    value={formData.maxFileSize / (1024 * 1024)}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            maxFileSize: parseFloat(e.target.value) * 1024 * 1024,
                                        })
                                    }
                                    placeholder="Enter max file size in MB"
                                    min="1"
                                    step="0.1"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Maximum allowed file size for uploads
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Last Updated Info */}
                    {config && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="font-medium">Last Updated:</span>{" "}
                                        {new Date(config.updatedAt).toLocaleString()}
                                    </p>
                                    <p>
                                        <span className="font-medium">Updated By:</span>{" "}
                                        {config.updatedBy || "System"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (config) {
                                    setFormData({
                                        siteName: config.siteName,
                                        siteDescription: config.siteDescription,
                                        maintenanceMode: config.maintenanceMode,
                                        allowedFileTypes: config.allowedFileTypes,
                                        maxFileSize: config.maxFileSize,
                                    });
                                    toast.info("Changes discarded");
                                }
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}