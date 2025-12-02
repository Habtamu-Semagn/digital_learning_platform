"use client";

import { useState } from "react";
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
  Calendar,
  Search,
  Filter,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data - replace with actual API calls
const enrolledCourses = [
  {
    _id: "course_1",
    title: "Advanced Mathematics",
    instructor: "Dr. Sarah Smith",
    description:
      "Master advanced mathematical concepts including calculus, linear algebra, and differential equations.",
    progress: 65,
    thumbnail: "/thumbnails/math.jpg",
    category: "Mathematics",
    duration: "8 weeks",
    students: 124,
    nextAssignment: "Quiz 3 - Due Jan 20",
    lastAccessed: "2024-01-15T10:30:00Z",
    modules: [
      { title: "Calculus Fundamentals", completed: true },
      { title: "Linear Algebra", completed: true },
      { title: "Differential Equations", completed: false },
      { title: "Advanced Topics", completed: false },
    ],
  },
  {
    _id: "course_2",
    title: "Introduction to Computer Science",
    instructor: "Prof. John Davis",
    description:
      "Learn programming fundamentals with Python and basic computer science concepts.",
    progress: 30,
    thumbnail: "/thumbnails/cs.jpg",
    category: "Computer Science",
    duration: "12 weeks",
    students: 89,
    nextAssignment: "Project 1 - Due Jan 25",
    lastAccessed: "2024-01-14T14:20:00Z",
    modules: [
      { title: "Python Basics", completed: true },
      { title: "Data Structures", completed: false },
      { title: "Algorithms", completed: false },
      { title: "Final Project", completed: false },
    ],
  },
  {
    _id: "course_3",
    title: "Modern Physics",
    instructor: "Dr. Emily Chen",
    description:
      "Explore quantum mechanics, relativity, and modern physics theories.",
    progress: 100,
    thumbnail: "/thumbnails/physics.jpg",
    category: "Physics",
    duration: "10 weeks",
    students: 67,
    nextAssignment: "None - Completed",
    lastAccessed: "2024-01-10T09:15:00Z",
    modules: [
      { title: "Quantum Mechanics", completed: true },
      { title: "Special Relativity", completed: true },
      { title: "Particle Physics", completed: true },
      { title: "Cosmology", completed: true },
    ],
  },
];

const availableCourses = [
  {
    _id: "course_4",
    title: "Data Science Fundamentals",
    instructor: "Dr. Mike Johnson",
    description:
      "Learn data analysis, visualization, and machine learning basics.",
    thumbnail: "/thumbnails/datascience.jpg",
    category: "Data Science",
    duration: "10 weeks",
    students: 203,
    rating: 4.8,
    enrollmentCount: 150,
    isEnrolled: false,
  },
  {
    _id: "course_5",
    title: "Digital Marketing",
    instructor: "Prof. Lisa Wang",
    description:
      "Master digital marketing strategies, SEO, and social media marketing.",
    thumbnail: "/thumbnails/marketing.jpg",
    category: "Business",
    duration: "6 weeks",
    students: 178,
    rating: 4.6,
    enrollmentCount: 120,
    isEnrolled: false,
  },
];

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState("enrolled");
  const [searchQuery, setSearchQuery] = useState("");

  const handleEnroll = async (courseId: string) => {
    // API call to enroll in course
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        alert("Successfully enrolled in course!");
        // Refresh course list or update state
      }
    } catch (error) {
      alert("Failed to enroll in course. Please try again.");
    }
  };

  const filteredEnrolledCourses = enrolledCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
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
          {filteredEnrolledCourses.length === 0 ? (
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
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Courses Tab */}
        <TabsContent value="available" className="space-y-6">
          {filteredAvailableCourses.length === 0 ? (
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
function CourseCard({ course, isEnrolled, onEnroll }: any) {
  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

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
              className={`absolute top-2 right-2 ${
                course.progress === 100 ? "bg-green-500" : "bg-blue-500"
              } text-white`}
            >
              {course.progress === 100 ? "Completed" : `${course.progress}%`}
            </Badge>
          )}

          {/* Rating Badge for available courses */}
          {!isEnrolled && course.rating && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 text-white flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {course.rating}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{course.instructor}</span>
            <Badge variant="secondary" className="capitalize">
              {course.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{course.students} students</span>
          </div>
        </div>

        {/* Progress for enrolled courses */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span
                className={
                  course.progress === 100 ? "text-green-600 font-medium" : ""
                }
              >
                {getProgressText(course.progress)}
              </span>
            </div>
            <Progress
              value={course.progress}
              className={`h-2 ${getProgressColor(course.progress)}`}
            />

            {/* Next Assignment */}
            {course.nextAssignment && course.progress !== 100 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="line-clamp-1">{course.nextAssignment}</span>
              </div>
            )}

            {/* Module Progress */}
            <div className="space-y-1">
              {course.modules.slice(0, 3).map((module: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {module.completed ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                  )}
                  <span className={module.completed ? "text-green-600" : ""}>
                    {module.title}
                  </span>
                </div>
              ))}
              {course.modules.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{course.modules.length - 3} more modules
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isEnrolled ? (
          <Button className="w-full" asChild>
            <a href={`/student/courses/${course._id}`}>
              {course.progress === 100 ? "Review Course" : "Continue Learning"}
            </a>
          </Button>
        ) : (
          <Button className="w-full" onClick={() => onEnroll?.(course._id)}>
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
