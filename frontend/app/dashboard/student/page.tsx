"use client";

import { useState, useEffect } from "react";
import { StudentAPI } from "@/lib/api";
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
  BookOpen,
  Clock,
  Calendar,
  FileText,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesData, assignmentsData] = await Promise.all([
        StudentAPI.getEnrolledCourses(),
        StudentAPI.getMyAssignments({ status: 'all' })
      ]);
      setEnrolledCourses(coursesData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const activeCourses = enrolledCourses.length;
  const pendingAssignments = assignments.filter(a => !a.hasSubmitted).length;
  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.enrollmentProgress || 0), 0) / enrolledCourses.length)
    : 0;

  // Upcoming assignments (next 5, sorted by due date)
  const upcomingAssignments = assignments
    .filter(a => !a.hasSubmitted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Learning Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Continue your learning journey</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting submission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Enrolled Courses */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Your currently enrolled courses</CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard/student/courses')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No courses enrolled</p>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  Start learning by enrolling in a course
                </p>
                <Button onClick={() => router.push('/dashboard/student/courses')}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/student/courses/${course._id}`)}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {course.instructor?.name || 'Instructor'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={course.enrollmentProgress || 0} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {course.enrollmentProgress || 0}%
                        </span>
                      </div>
                    </div>
                    {course.enrollmentProgress === 100 && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Assignments due soon</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/student/assignments')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">No pending assignments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/student/assignments/${assignment._id}`)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {assignment.course?.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {assignment.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Continue your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => router.push('/dashboard/student/courses')}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Browse Courses</p>
                <p className="text-sm text-muted-foreground">
                  Explore and enroll in new courses
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => router.push('/dashboard/student/assignments')}
            >
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">View Assignments</p>
                <p className="text-sm text-muted-foreground">
                  Submit pending assignments
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => router.push('/dashboard/student/library')}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Library</p>
                <p className="text-sm text-muted-foreground">
                  Access books and resources
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
