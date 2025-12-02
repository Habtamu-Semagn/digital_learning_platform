"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Play,
  Search,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { useState } from "react";

export default function StudentDashboardPage() {
  const [analyticsData, setAnalyticsData] = useState({
    userEngagement: [
      {
        _id: "Video",
        totalActions: 2,
        totalWatchTime: 0,
        avgProgress: 0,
        lastActivity: "2025-10-31T09:54:14.307Z",
      },
    ],
    recentActivity: [
      {
        _id: "6904874689516e48791db9cf",
        contentId: null,
        contentType: "Video",
        action: "search",
        createdAt: "2025-10-31T09:54:14.307Z",
      },
      {
        _id: "6904871389516e48791db9ca",
        contentId: null,
        contentType: "Video",
        action: "view",
        createdAt: "2025-10-31T09:53:23.219Z",
      },
    ],
    dateRange: {
      start: "2025-10-04T18:28:53.924Z",
      end: "2025-11-03T18:28:53.924Z",
    },
  });
  const videoStats = analyticsData.userEngagement.find(
    (stat) => stat._id === "Video"
  );
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "search":
        return <Search className="h-4 w-4" />;
      case "view":
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  const getActivityVariant = (action: string) => {
    switch (action) {
      case "search":
        return "secondary";
      case "view":
        return "default";
      default:
        return "outline";
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Learning Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(analyticsData.dateRange.start).toLocaleDateString()} -{" "}
            {new Date(analyticsData.dateRange.end).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videoStats?.totalActions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all content types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videoStats?.totalWatchTime || 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              Video content engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videoStats?.avgProgress || 0}%
            </div>
            <Progress value={videoStats?.avgProgress || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videoStats?.lastActivity
                ? new Date(videoStats.lastActivity).toLocaleDateString()
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">Recent engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning activities and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action === "search"
                        ? "Searched for content"
                        : "Viewed content"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={getActivityVariant(activity.action)}>
                    {activity.contentType}
                  </Badge>
                </div>
              ))}

              {analyticsData.recentActivity.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start exploring content to see your activity here
                  </p>
                  <Button className="mt-4">Browse Content</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Insights */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
          <CardDescription>
            Your learning patterns and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type Distribution */}
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Video Content</span>
                <span className="text-sm text-muted-foreground">100%</span>
              </div>
              <Progress value={100} className="w-full" />
            </div>

            {/* Activity Frequency */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Video Focused</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Most of your activity is with video content
              </p>
            </div>
          </>

          <div className="rounded-lg border p-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active Explorer</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You're actively searching for new learning materials
            </p>
          </div>

          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Getting Started</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Begin watching videos to track your progress
            </p>
            <Button size="sm" className="mt-2 w-full">
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Continue your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Browse Library</p>
                <p className="text-sm text-muted-foreground">
                  Explore books and materials
                </p>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <Video className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Watch Videos</p>
                <p className="text-sm text-muted-foreground">
                  Continue learning with videos
                </p>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <Search className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Search Content</p>
                <p className="text-sm text-muted-foreground">
                  Find specific topics
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
