"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/admin/stats-card";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { SuperAdminAPI, AnalyticsOverview } from "@/lib/api";
import {
    Users,
    Activity,
    Clock,
    Video,
    BookOpen,
    Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    });

    const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Fetch analytics data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await SuperAdminAPI.getAnalyticsOverview(
                    dateRange.from.toISOString(),
                    dateRange.to.toISOString()
                );
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
                toast.error("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    // Handle export
    const handleExport = async (format: "csv" | "json") => {
        try {
            setExporting(true);
            const blob = await SuperAdminAPI.exportAnalytics(
                format,
                dateRange.from.toISOString(),
                dateRange.to.toISOString()
            );

            // Create download link
            const url = window.URL.createObjectURL(blob as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics-${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Analytics exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export analytics");
        } finally {
            setExporting(false);
        }
    };

    const formatWatchTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">No analytics data available</p>
            </div>
        );
    }

    const { overview, popularVideos, popularBooks } = analyticsData;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Platform usage and engagement metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleExport("csv")}
                        disabled={exporting}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExport("json")}
                        disabled={exporting}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                    </Button>
                </div>
            </div>

            {/* Date Range Picker */}
            <div>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value={overview.totalUsers.toLocaleString()}
                    icon={Users}
                    description="Active users"
                />
                <StatsCard
                    title="Total Actions"
                    value={overview.totalActions.toLocaleString()}
                    icon={Activity}
                    description="User interactions"
                />
                <StatsCard
                    title="Watch Time"
                    value={formatWatchTime(overview.totalWatchTime || 0)}
                    icon={Clock}
                    description="Total viewing time"
                />
                <StatsCard
                    title="Content Views"
                    value={(overview.videoViews + overview.bookViews).toLocaleString()}
                    icon={Activity}
                    description="Videos + Books"
                />
            </div>

            {/* Engagement Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                    title="Video Views"
                    value={overview.videoViews.toLocaleString()}
                    icon={Video}
                    description={`${overview.totalVideos} total videos`}
                />
                <StatsCard
                    title="Book Views"
                    value={overview.bookViews.toLocaleString()}
                    icon={BookOpen}
                    description={`${overview.totalBooks} total books`}
                />
            </div>

            {/* Popular Content Tables */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Popular Videos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Videos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {popularVideos && popularVideos.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="text-right">Views</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {popularVideos.map((video: any, index: number) => (
                                        <TableRow key={video._id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {video.title || "Untitled"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {video.viewCount || 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No video data available
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Popular Books */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Books</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {popularBooks && popularBooks.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="text-right">Views</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {popularBooks.map((book: any, index: number) => (
                                        <TableRow key={book._id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {book.title || "Untitled"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {book.viewCount || 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No book data available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Platform Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Institutions
                            </p>
                            <p className="text-2xl font-bold">
                                {overview.totalInstitutions.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Videos
                            </p>
                            <p className="text-2xl font-bold">
                                {overview.totalVideos.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Books
                            </p>
                            <p className="text-2xl font-bold">
                                {overview.totalBooks.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}