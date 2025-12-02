"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/components/ui/use-toast";
import { User, Bell, Shield, Download, Save, Mail, Lock } from "lucide-react";

export default function SettingsPage() {
  //   const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Mock user data - replace with actual API call
  const [userData, setUserData] = useState({
    name: "John Student",
    email: "john@student.edu",
    institution: "University of Learning",
    avatar: "/avatars/john.jpg",
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      emailNotifications: true,
      assignmentReminders: true,
      courseUpdates: true,
      weeklyProgress: false,
    },
    privacy: {
      showProgress: true,
      showEnrollments: false,
      showAchievements: true,
    },
    learning: {
      autoPlayVideos: false,
      downloadForOffline: true,
      defaultLanguage: "en",
    },
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // API call to update profile
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      //   toast({
      //     title: "Profile updated",
      //     description: "Your profile has been updated successfully.",
      //   });
    } catch (error) {
      //   toast({
      //     title: "Error",
      //     description: "Failed to update profile. Please try again.",
      //     variant: "destructive",
      //   });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // API call to update preferences
      await fetch("/api/users/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      //   toast({
      //     title: "Preferences saved",
      //     description: "Your preferences have been updated successfully.",
      //   });
    } catch (error) {
      //   toast({
      //     title: "Error",
      //     description: "Failed to save preferences. Please try again.",
      //     variant: "destructive",
      //   });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the
                platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={userData.institution}
                  onChange={(e) =>
                    setUserData({ ...userData, institution: e.target.value })
                  }
                  placeholder="Enter your institution"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture URL</Label>
                <Input
                  id="avatar"
                  value={userData.avatar}
                  onChange={(e) =>
                    setUserData({ ...userData, avatar: e.target.value })
                  }
                  placeholder="Enter image URL"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button variant="outline">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about your learning
                activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        emailNotifications: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="assignment-reminders">
                    Assignment Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for upcoming assignments
                  </p>
                </div>
                <Switch
                  id="assignment-reminders"
                  checked={preferences.notifications.assignmentReminders}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        assignmentReminders: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="course-updates">Course Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about new course content
                  </p>
                </div>
                <Switch
                  id="course-updates"
                  checked={preferences.notifications.courseUpdates}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        courseUpdates: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-progress">
                    Weekly Progress Reports
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly learning progress summaries
                  </p>
                </div>
                <Switch
                  id="weekly-progress"
                  checked={preferences.notifications.weeklyProgress}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        weeklyProgress: checked,
                      },
                    })
                  }
                />
              </div>

              <Button onClick={handleSavePreferences} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and visibility on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-progress">Show Learning Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your course progress and achievements
                  </p>
                </div>
                <Switch
                  id="show-progress"
                  checked={preferences.privacy.showProgress}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      privacy: {
                        ...preferences.privacy,
                        showProgress: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-enrollments">
                    Show Course Enrollments
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see which courses you're enrolled in
                  </p>
                </div>
                <Switch
                  id="show-enrollments"
                  checked={preferences.privacy.showEnrollments}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      privacy: {
                        ...preferences.privacy,
                        showEnrollments: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-achievements">Show Achievements</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your earned badges and achievements publicly
                  </p>
                </div>
                <Switch
                  id="show-achievements"
                  checked={preferences.privacy.showAchievements}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      privacy: {
                        ...preferences.privacy,
                        showAchievements: checked,
                      },
                    })
                  }
                />
              </div>

              <Button onClick={handleSavePreferences} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Customize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-play">Auto-play Videos</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically play video lessons when opened
                  </p>
                </div>
                <Switch
                  id="auto-play"
                  checked={preferences.learning.autoPlayVideos}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      learning: {
                        ...preferences.learning,
                        autoPlayVideos: checked,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offline-download">Download for Offline</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically download content for offline access
                  </p>
                </div>
                <Switch
                  id="offline-download"
                  checked={preferences.learning.downloadForOffline}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      learning: {
                        ...preferences.learning,
                        downloadForOffline: checked,
                      },
                    })
                  }
                />
              </div>

              <Button onClick={handleSavePreferences} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Learning Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Download your personal data and learning history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Learning Progress Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Export your course progress, achievements, and learning
                    analytics
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Course Certificates</Label>
                  <p className="text-sm text-muted-foreground">
                    Download your earned certificates and completion records
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Export all your submitted assignments and grades
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
