import { useState } from "react";
import { InstructorAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CourseDefaultsTabProps {
    settings: any;
    onUpdate: () => void;
}

export default function CourseDefaultsTab({ settings, onUpdate }: CourseDefaultsTabProps) {
    const [formData, setFormData] = useState({
        defaultPoints: settings?.preferences?.courseDefaults?.defaultPoints || 100,
        defaultDueDateOffset: settings?.preferences?.courseDefaults?.defaultDueDateOffset || 7,
        autoPublishAnnouncements: settings?.preferences?.courseDefaults?.autoPublishAnnouncements ?? false,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.defaultPoints < 0 || formData.defaultPoints > 1000) {
            toast.error("Default points must be between 0 and 1000");
            return;
        }

        if (formData.defaultDueDateOffset < 1 || formData.defaultDueDateOffset > 365) {
            toast.error("Due date offset must be between 1 and 365 days");
            return;
        }

        try {
            setSaving(true);
            await InstructorAPI.updateCourseDefaults(formData);
            toast.success("Course defaults updated successfully");
            onUpdate();
        } catch (error: any) {
            toast.error(error.message || "Failed to update defaults");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Defaults</CardTitle>
                <CardDescription>
                    Set default values for new assignments and announcements
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Default Points */}
                    <div className="space-y-2">
                        <Label htmlFor="defaultPoints">Default Assignment Points</Label>
                        <Input
                            id="defaultPoints"
                            type="number"
                            min="0"
                            max="1000"
                            value={formData.defaultPoints}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    defaultPoints: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Default point value for new assignments
                        </p>
                    </div>

                    {/* Default Due Date Offset */}
                    <div className="space-y-2">
                        <Label htmlFor="defaultDueDateOffset">Default Due Date Offset (Days)</Label>
                        <Input
                            id="defaultDueDateOffset"
                            type="number"
                            min="1"
                            max="365"
                            value={formData.defaultDueDateOffset}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    defaultDueDateOffset: parseInt(e.target.value) || 7,
                                })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Number of days from creation for new assignment due dates
                        </p>
                    </div>

                    {/* Auto Publish Announcements */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="autoPublishAnnouncements">
                                Auto-Publish Announcements
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically publish new announcements
                            </p>
                        </div>
                        <Switch
                            id="autoPublishAnnouncements"
                            checked={formData.autoPublishAnnouncements}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, autoPublishAnnouncements: checked })
                            }
                        />
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
