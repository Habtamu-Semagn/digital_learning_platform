import { OverviewCards } from "@/components/superadmin/overview-cards";
import { PopularContent } from "@/components/superadmin/popular-content";
import { RecentSignups } from "@/components/superadmin/recent-signups";
import { AnalyticsChart } from "@/components/superadmin/analytics-chart";
import { SuperAdminAPI } from "@/lib/api";

export default async function Superadmin() {
  const [analyticsData, usersData] = await Promise.all([
    SuperAdminAPI.getAnalyticsOverview(),
    SuperAdminAPI.getAllUsers(1, 5) // Fetch top 5 recent users
  ]);

  return (
    <div className="space-y-6">
      <OverviewCards data={analyticsData.overview} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <AnalyticsChart
          data={[]} // TODO: Add real historical data when available in API
          title="Platform Activity"
          description="Overview of user activity over time"
        />
        <RecentSignups users={usersData.users} />
      </div>

      <div className="grid gap-6">
        <PopularContent
          popularVideos={analyticsData.popularVideos}
          popularBooks={analyticsData.popularBooks}
        />
      </div>
    </div>
  );
}
