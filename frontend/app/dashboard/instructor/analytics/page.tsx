"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/admin/stats-card";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { InstructorAPI } from "@/lib/api";
import {
    Video,
    BookOpen,
    Users,
    Clock,
    TrendingUp,
    Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function InstructorAnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    });

    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [books, setBooks] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesData, videosData, booksData] = await Promise.all([
                InstructorAPI.getMyCourses(),
                InstructorAPI.getMyVideos(),
                InstructorAPI.getMyBooks(),
            ]);

            setCourses(coursesData || []);
            setVideos(videosData || []);
            setBooks(booksData || []);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            toast.error("Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const totalStudents = courses.reduce(
        (sum, course) => sum + (course.enrolledStudents || 0),
        0
    );
    const totalVideoViews = videos.reduce(
        (sum, video) => sum + (video.views || 0),
        0
    );
    const totalBookViews = books.reduce(
        (sum, book) => sum + (book.viewCount || 0),
        0
    );
    const totalWatchTime = videos.reduce(
        (sum, video) => sum + (video.totalWatchTime || 0),
        0
    );

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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                    Track your content performance and student engagement
                </p>
            </div>

            {/* Date Range Picker */}
            <div>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    description="Enrolled across courses"
                />
                <StatsCard
                    title="Video Views"
                    value={totalVideoViews}
                    icon={Video}
                    description={`${videos.length} videos`}
                />
                <StatsCard
                    title="Book Views"
                    value={totalBookViews}
                    icon={BookOpen}
                    description={`${books.length} books`}
                />
                <StatsCard
                    title="Watch Time"
                    value={formatWatchTime(totalWatchTime)}
                    icon={Clock}
                    description="Total video watch time"
                />
            </div>

            {/* Course Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Course Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {courses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-right">Students</TableHead>
                                    <TableHead className="text-right">Rating</TableHead>
                                    <TableHead className="text-right">Lessons</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses
                                    .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
                                    .map((course) => (
                                        <TableRow key={course._id}>
                                            <TableCell className="font-medium">
                                                {course.title}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {course.enrolledStudents || 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {course.averageRating?.toFixed(1) || "0.0"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {course.lessons?.length || 0}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${course.status === "published"
                                                            ? "bg-green-100 text-green-800"
                                                            : course.status === "draft"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {course.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No course data available
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Content Performance */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Videos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            Top Videos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {videos.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="text-right">Views</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {videos
                                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                                        .slice(0, 5)
                                        .map((video) => (
                                            <TableRow key={video._id}>
                                                <TableCell className="font-medium">
                                                    {video.title}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {video.views || 0}
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

                {/* Top Books */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Top Books
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {books.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="text-right">Views</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {books
                                        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                                        .slice(0, 5)
                                        .map((book) => (
                                            <TableRow key={book._id}>
                                                <TableCell className="font-medium">
                                                    {book.title}
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

            {/* Content Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Courses
                            </p>
                            <p className="text-2xl font-bold">{courses.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {courses.filter((c) => c.status === "published").length} published
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Videos
                            </p>
                            <p className="text-2xl font-bold">{videos.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalVideoViews} total views
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Books
                            </p>
                            <p className="text-2xl font-bold">{books.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalBookViews} total views
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}