import { useState } from "react";
import { InstructorAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface NotificationsTabProps {
    settings: any;
    onUpdate: () => void;
}

export default function NotificationsTab({ settings, onUpdate }: NotificationsTabProps) {
    const [formData, setFormData] = useState({
        emailEnabled: settings?.preferences?.notifications?.emailEnabled ?? true,
        newEnrollments: settings?.preferences?.notifications?.newEnrollments ?? true,
        newSubmissions: settings?.preferences?.notifications?.newSubmissions ?? true,
        newQuestions: settings?.preferences?.notifications?.newQuestions ?? true,
        studentMessages: settings?.preferences?.notifications?.studentMessages ?? true,
        digestFrequency: settings?.preferences?.notifications?.digestFrequency || "immediate",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await InstructorAPI.updateNotificationPreferences(formData);
            toast.success("Notification preferences updated successfully");
            onUpdate();
        } catch (error: any) {
            toast.error(error.message || "Failed to update preferences");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                    Choose what notifications you want to receive and how often
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="emailEnabled">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                            </p>
                        </div>
                        <Switch
                            id="emailEnabled"
                            checked={formData.emailEnabled}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, emailEnabled: checked })
                            }
                        />
                    </div>

                    {formData.emailEnabled && (
                        <>
                            {/* Digest Frequency */}
                            <div className="space-y-2">
                                <Label htmlFor="digestFrequency">Notification Frequency</Label>
                                <Select
                                    value={formData.digestFrequency}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, digestFrequency: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="immediate">Immediate</SelectItem>
                                        <SelectItem value="daily">Daily Digest</SelectItem>
                                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    How often you receive notifications
                                </p>
                            </div>

                            <div className="border-t pt-6 space-y-4">
                                <Label>Notification Types</Label>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="newEnrollments" className="font-normal">
                                            New Student Enrollments
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            When students enroll in your courses
                                        </p>
                                    </div>
                                    <Switch
                                        id="newEnrollments"
                                        checked={formData.newEnrollments}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, newEnrollments: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="newSubmissions" className="font-normal">
                                            New Assignment Submissions
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            When students submit assignments
                                        </p>
                                    </div>
                                    <Switch
                                        id="newSubmissions"
                                        checked={formData.newSubmissions}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, newSubmissions: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="newQuestions" className="font-normal">
                                            New Q&A Questions
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            When students ask questions in Q&A
                                        </p>
                                    </div>
                                    <Switch
                                        id="newQuestions"
                                        checked={formData.newQuestions}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, newQuestions: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="studentMessages" className="font-normal">
                                            Student Messages
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            When students send you direct messages
                                        </p>
                                    </div>
                                    <Switch
                                        id="studentMessages"
                                        checked={formData.studentMessages}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, studentMessages: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
