"use client";

import { useState, useEffect } from "react";
import { StudentAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Users,
  Play,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MyCoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("enrolled");
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (activeTab === "enrolled") {
        const courses = await StudentAPI.getEnrolledCourses();
        setEnrolledCourses(courses || []);
      } else {
        const courses = await StudentAPI.getAvailableCourses();
        setAvailableCourses(courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await StudentAPI.enrollInCourse(courseId);
      toast.success("Successfully enrolled in course!");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in course");
    }
  };

  const handleUnenroll = async (courseId: string) => {
    try {
      await StudentAPI.unenrollFromCourse(courseId);
      toast.success("Successfully unenrolled from course");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Failed to unenroll from course");
    }
  };

  const filteredEnrolledCourses = enrolledCourses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Manage your enrolled courses and discover new ones
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Courses ({enrolledCourses.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Available Courses ({availableCourses.length})
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Courses Tab */}
        <TabsContent value="enrolled" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEnrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "You haven't enrolled in any courses yet"}
                </p>
                <Button onClick={() => setActiveTab("available")}>
                  Browse Available Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrolledCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={true}
                  onUnenroll={handleUnenroll}
                  router={router}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Courses Tab */}
        <TabsContent value="available" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAvailableCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Play className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "No available courses at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={false}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, isEnrolled, onEnroll, onUnenroll, router }: any) {
  const progress = course.enrollmentProgress || 0;

  const getProgressText = (progress: number) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return `${progress}% Complete`;
    return "Not Started";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-4 pb-2">
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <BookOpen className="h-12 w-12 text-white" />
          )}

          {/* Progress Badge for enrolled courses */}
          {isEnrolled && (
            <Badge
              className={`absolute top-2 right-2 ${progress === 100 ? "bg-green-500" : "bg-blue-500"
                } text-white`}
            >
              {progress === 100 ? "Completed" : `${progress}%`}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mt-3">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{course.instructor?.name || 'Instructor'}</span>
            {course.category && (
              <Badge variant="secondary" className="capitalize">
                {course.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Progress for enrolled courses */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className={progress === 100 ? "text-green-600 font-medium" : ""}>
                {getProgressText(progress)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {isEnrolled ? (
          <>
            <Button
              className="flex-1"
              onClick={() => router?.push(`/dashboard/student/courses/${course._id}`)}
            >
              {progress === 100 ? "Review Course" : "Continue Learning"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnenroll?.(course._id)}
            >
              Unenroll
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={() => onEnroll?.(course._id)}>
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
