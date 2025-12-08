import { StatsCard } from "@/components/admin/stats-card";
import { SuperAdminAPI } from "@/lib/api";
import {
  Users,
  Building,
  BookOpen,
  Video,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  // Fetch analytics overview data
  const analyticsData = await SuperAdminAPI.getAnalyticsOverview();

  const { overview, popularVideos, popularBooks } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={overview.totalUsers.toLocaleString()}
          icon={Users}
          description="Registered users"
        />
        <StatsCard
          title="Total Institutions"
          value={overview.totalInstitutions.toLocaleString()}
          icon={Building}
          description="Active organizations"
        />
        <StatsCard
          title="Total Videos"
          value={overview.totalVideos.toLocaleString()}
          icon={Video}
          description="Video content"
        />
        <StatsCard
          title="Total Books"
          value={overview.totalBooks.toLocaleString()}
          icon={BookOpen}
          description="Book resources"
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Actions"
          value={overview.totalActions.toLocaleString()}
          icon={Activity}
          description="User interactions"
        />
        <StatsCard
          title="Video Views"
          value={overview.videoViews.toLocaleString()}
          icon={Video}
          description="Total video views"
        />
        <StatsCard
          title="Book Views"
          value={overview.bookViews.toLocaleString()}
          icon={BookOpen}
          description="Total book views"
        />
      </div>

      {/* Popular Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Popular Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularVideos && popularVideos.length > 0 ? (
              <div className="space-y-4">
                {popularVideos.slice(0, 5).map((video: any, index: number) => (
                  <div
                    key={video._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {video.title || "Untitled Video"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {video.viewCount || 0} views
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No video data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularBooks && popularBooks.length > 0 ? (
              <div className="space-y-4">
                {popularBooks.slice(0, 5).map((book: any, index: number) => (
                  <div
                    key={book._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {book.title || "Untitled Book"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.viewCount || 0} views
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No book data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm">All systems operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
