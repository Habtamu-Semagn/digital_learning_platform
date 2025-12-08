import { useState } from "react";
import { InstructorAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface PrivacyTabProps {
    settings: any;
    onUpdate: () => void;
}

export default function PrivacyTab({ settings, onUpdate }: PrivacyTabProps) {
    const [formData, setFormData] = useState({
        profileVisibility: settings?.preferences?.privacy?.profileVisibility || "students",
        showEmail: settings?.preferences?.privacy?.showEmail ?? false,
        allowMessages: settings?.preferences?.privacy?.allowMessages ?? true,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await InstructorAPI.updatePrivacySettings(formData);
            toast.success("Privacy settings updated successfully");
            onUpdate();
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy & Visibility</CardTitle>
                <CardDescription>
                    Control who can see your profile and contact you
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Visibility */}
                    <div className="space-y-3">
                        <Label>Profile Visibility</Label>
                        <RadioGroup
                            value={formData.profileVisibility}
                            onValueChange={(value) =>
                                setFormData({ ...formData, profileVisibility: value })
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="public" id="public" />
                                <Label htmlFor="public" className="font-normal">
                                    Public - Anyone can view your profile
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="students" id="students" />
                                <Label htmlFor="students" className="font-normal">
                                    Students Only - Only students in your courses can view
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private" className="font-normal">
                                    Private - Only you can view your profile
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Show Email */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="showEmail">Show Email to Students</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow students to see your email address
                            </p>
                        </div>
                        <Switch
                            id="showEmail"
                            checked={formData.showEmail}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, showEmail: checked })
                            }
                        />
                    </div>

                    {/* Allow Messages */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="allowMessages">Allow Student Messages</Label>
                            <p className="text-sm text-muted-foreground">
                                Students can send you direct messages
                            </p>
                        </div>
                        <Switch
                            id="allowMessages"
                            checked={formData.allowMessages}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, allowMessages: checked })
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
