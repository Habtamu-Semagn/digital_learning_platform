import { useState } from "react";
import { InstructorAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Key } from "lucide-react";

export default function SecurityTab() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
    });
    const [changing, setChanging] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.newPasswordConfirm) {
            toast.error("Please fill in all fields");
            return;
        }

        if (formData.newPassword !== formData.newPasswordConfirm) {
            toast.error("New passwords do not match");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            toast.error("Password must be 8-15 characters with uppercase, lowercase, number, and special character");
            return;
        }

        try {
            setChanging(true);
            await InstructorAPI.changePassword(formData);
            toast.success("Password changed successfully");
            setDialogOpen(false);
            setFormData({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
        } catch (error: any) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setChanging(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                    Manage your account security settings
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Change Password Button */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Password</Label>
                        <p className="text-sm text-muted-foreground">
                            Update your password to keep your account secure
                        </p>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                    </Button>
                </div>

                {/* Change Password Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Enter your current password and choose a new one
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) =>
                                        setFormData({ ...formData, currentPassword: e.target.value })
                                    }
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) =>
                                        setFormData({ ...formData, newPassword: e.target.value })
                                    }
                                    placeholder="Enter new password"
                                />
                                <p className="text-xs text-muted-foreground">
                                    8-15 characters, include uppercase, lowercase, number, and special character (@.#$!%*?&)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
                                <Input
                                    id="newPasswordConfirm"
                                    type="password"
                                    value={formData.newPasswordConfirm}
                                    onChange={(e) =>
                                        setFormData({ ...formData, newPasswordConfirm: e.target.value })
                                    }
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={changing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={changing}>
                                    {changing ? "Changing..." : "Change Password"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
