import { useState } from "react";
import { InstructorAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProfileTabProps {
    settings: any;
    onUpdate: () => void;
}

export default function ProfileTab({ settings, onUpdate }: ProfileTabProps) {
    const [formData, setFormData] = useState({
        bio: settings?.instructorProfile?.bio || "",
        title: settings?.instructorProfile?.title || "",
        socialLinks: {
            linkedin: settings?.instructorProfile?.socialLinks?.linkedin || "",
            twitter: settings?.instructorProfile?.socialLinks?.twitter || "",
            website: settings?.instructorProfile?.socialLinks?.website || "",
        },
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.bio.length > 500) {
            toast.error("Bio cannot exceed 500 characters");
            return;
        }

        try {
            setSaving(true);
            await InstructorAPI.updateProfile(formData);
            toast.success("Profile updated successfully");
            onUpdate();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                    Update your profile information and how others see you
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={settings?.name || ""}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Contact support to change your name
                        </p>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={settings?.email || ""}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title/Position</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Senior Lecturer, Associate Professor"
                            maxLength={100}
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell students about yourself..."
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {formData.bio.length}/500 characters
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <Label>Social Links (Optional)</Label>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin" className="text-sm font-normal">
                                LinkedIn
                            </Label>
                            <Input
                                id="linkedin"
                                type="url"
                                value={formData.socialLinks.linkedin}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                                    })
                                }
                                placeholder="https://linkedin.com/in/yourprofile"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="twitter" className="text-sm font-normal">
                                Twitter
                            </Label>
                            <Input
                                id="twitter"
                                type="url"
                                value={formData.socialLinks.twitter}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                                    })
                                }
                                placeholder="https://twitter.com/yourhandle"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-sm font-normal">
                                Website
                            </Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.socialLinks.website}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, website: e.target.value },
                                    })
                                }
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
