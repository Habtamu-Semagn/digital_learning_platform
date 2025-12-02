"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Download,
} from "lucide-react";
import Link from "next/link";

// Mock course data - replace with API call
const courseData = {
  _id: "course_1",
  title: "Advanced Mathematics",
  description:
    "Master advanced mathematical concepts including calculus, linear algebra, and differential equations. This course will take you from intermediate to advanced level mathematics.",
  instructor: {
    name: "Dr. Sarah Smith",
    avatar: "/avatars/smith.jpg",
    bio: "Professor of Mathematics with 15 years of teaching experience.",
  },
  category: "Mathematics",
  duration: "8 weeks",
  students: 124,
  progress: 65,
  modules: [
    {
      _id: "module_1",
      title: "Calculus Fundamentals",
      description: "Learn the basics of differential and integral calculus",
      lessons: [
        {
          _id: "lesson_1",
          title: "Introduction to Calculus",
          type: "video",
          duration: "15:30",
          completed: true,
        },
        {
          _id: "lesson_2",
          title: "Limits and Continuity",
          type: "video",
          duration: "20:15",
          completed: true,
        },
        {
          _id: "lesson_3",
          title: "Derivatives",
          type: "video",
          duration: "25:45",
          completed: true,
        },
        {
          _id: "lesson_4",
          title: "Integration",
          type: "reading",
          duration: "30 min",
          completed: true,
        },
      ],
    },
    {
      _id: "module_2",
      title: "Linear Algebra",
      description: "Understand vectors, matrices, and linear transformations",
      lessons: [
        {
          _id: "lesson_5",
          title: "Vectors and Spaces",
          type: "video",
          duration: "18:20",
          completed: true,
        },
        {
          _id: "lesson_6",
          title: "Matrix Operations",
          type: "video",
          duration: "22:10",
          completed: true,
        },
        {
          _id: "lesson_7",
          title: "Linear Transformations",
          type: "video",
          duration: "19:35",
          completed: false,
        },
      ],
    },
    {
      _id: "module_3",
      title: "Differential Equations",
      description: "Solve various types of differential equations",
      lessons: [
        {
          _id: "lesson_8",
          title: "First Order Equations",
          type: "video",
          duration: "21:40",
          completed: false,
        },
        {
          _id: "lesson_9",
          title: "Second Order Equations",
          type: "video",
          duration: "24:15",
          completed: false,
        },
      ],
    },
    {
      _id: "module_4",
      title: "Advanced Topics",
      description: "Explore advanced mathematical concepts",
      lessons: [
        {
          _id: "lesson_10",
          title: "Complex Analysis",
          type: "video",
          duration: "26:30",
          completed: false,
        },
        {
          _id: "lesson_11",
          title: "Numerical Methods",
          type: "reading",
          duration: "45 min",
          completed: false,
        },
      ],
    },
  ],
  assignments: [
    {
      _id: "assign_1",
      title: "Quiz 1: Calculus Basics",
      dueDate: "2024-01-10",
      submitted: true,
      grade: "A",
    },
    {
      _id: "assign_2",
      title: "Quiz 2: Linear Algebra",
      dueDate: "2024-01-20",
      submitted: false,
      grade: null,
    },
  ],
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId;
  const course = courseData;

  const completedLessons = course.modules.flatMap((module) =>
    module.lessons.filter((lesson) => lesson.completed)
  ).length;

  const totalLessons = course.modules.flatMap(
    (module) => module.lessons
  ).length;

  const handleMarkComplete = async (lessonId: string) => {
    try {
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      // Refresh data or update state
    } catch (error) {
      console.error("Failed to mark lesson complete");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/student/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>
                Your learning journey through this course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Overall Progress</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-3" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold">
                    {completedLessons}/{totalLessons}
                  </div>
                  <div className="text-muted-foreground">Lessons Completed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold">
                    {course.assignments.filter((a) => a.submitted).length}/
                    {course.assignments.length}
                  </div>
                  <div className="text-muted-foreground">
                    Assignments Submitted
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {completedLessons} of {totalLessons} lessons completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module._id} className="border rounded-lg">
                  <div className="p-4 bg-muted/50 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.description}
                    </p>
                  </div>

                  <div className="p-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson._id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {lesson.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!lesson.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkComplete(lesson._id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <a
                              href={`/student/courses/${courseId}/lessons/${lesson._id}`}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {course.instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-semibold">{course.instructor.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.instructor.bio}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge>{course.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students</span>
                <span className="text-sm font-medium">{course.students}</span>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Course Syllabus
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Lecture Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
