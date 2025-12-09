"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/admin/stats-card";
import { InstructorAPI } from "@/lib/api";

// Cache bust log
console.log("InstructorDashboard file evaluated");
import { CourseCard } from "@/components/instructor/course-card";
import { ContentUploadModal } from "@/components/instructor/content-upload-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Video,
  Users,
  Star,
  Plus,
  Upload,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function InstructorDashboard() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [totalUniqueStudents, setTotalUniqueStudents] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"video" | "book">("video");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, videosData, booksData, statsData] = await Promise.all([
        InstructorAPI.getMyCourses(),
        InstructorAPI.getMyVideos(),
        InstructorAPI.getMyBooks(),
        InstructorAPI.getInstructorStats(),
      ]);

      setCourses(coursesData || []);
      setVideos(videosData || []);
      setBooks(booksData || []);
      // We will access statsData in render or store it. 
      // Current implementation calculates totalStudents from courses which is wrong.
      // Let's store totalUniqueStudents.
      setTotalUniqueStudents(statsData?.totalStudents || 0);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (type: "video" | "book") => {
    setUploadType(type);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchData();
  };

  // Calculate metrics
  const avgRating =
    courses.length > 0
      ? courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) /
      courses.length
      : 0;
  const publishedCourses = courses.filter((c) => c.status === "published").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your teaching overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleUpload("video")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
          <Button onClick={() => handleUpload("book")} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Book
          </Button>
          <Link href="/dashboard/instructor/courses">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Courses"
          value={courses.length}
          icon={BookOpen}
          description={`${publishedCourses} published`}
        />
        <StatsCard
          title="Total Students"
          value={totalUniqueStudents}
          icon={Users}
          description="Across all courses"
        />
        <StatsCard
          title="Content Uploaded"
          value={videos.length + books.length}
          icon={Video}
          description={`${videos.length} videos, ${books.length} books`}
        />
        <StatsCard
          title="Avg. Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          description="Course ratings"
        />
      </div>

      {/* Top Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Top Courses</h2>
          <Link href="/dashboard/instructor/courses">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
              .slice(0, 3)
              .map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onView={(id) => (window.location.href = `/dashboard/instructor/courses/${id}`)}
                />
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first course to get started
              </p>
              <Link href="/dashboard/instructor/courses">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Recent Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.slice(0, 5).map((video) => (
                  <div
                    key={video._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {video.views || 0} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No videos uploaded yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {books.length > 0 ? (
              <div className="space-y-3">
                {books.slice(0, 5).map((book) => (
                  <div
                    key={book._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {book.viewCount || 0} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No books uploaded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      <ContentUploadModal
        type={uploadType}
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
