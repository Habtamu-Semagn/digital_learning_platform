"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Loader2, PlayCircle, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const data = await StudentAPI.getCourseDetail(courseId);
      setCourse(data);
    } catch (error: any) {
      console.error("Failed to fetch course:", error);
      toast.error(error.message || "Failed to load course details");
      router.push("/dashboard/student/courses");
    } finally {
      setLoading(false);
    }
  };

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleSubmitRating = async () => {
    try {
      setSubmittingRating(true);
      await StudentAPI.rateCourse(courseId, { rating, comment: reviewComment });
      toast.success("Review submitted successfully!");
      fetchCourseDetail(); // Refresh to see updated rating if displayed (future task)
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleMarkComplete = async (lessonId: string) => {
    try {
      await StudentAPI.updateProgress({
        contentType: "lesson",
        contentId: lessonId,
        course: courseId,
        progress: 100
      });
      toast.success("Lesson marked as complete!");
      fetchCourseDetail(); // Refresh to get updated progress
    } catch (error: any) {
      toast.error(error.message || "Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  const completedLessons = course.lessons?.filter((l: any) => l.completed).length || 0;
  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      {/* Course Header */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription>
                  Instructor: {course.instructor?.name || 'Unknown'}
                </CardDescription>
              </div>
              {course.category && (
                <Badge variant="secondary" className="capitalize">
                  {course.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-medium">{course.enrollmentProgress || 0}%</span>
              </div>
              <Progress value={course.enrollmentProgress || 0} className="h-2" />
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Lessons: </span>
              <span className="font-medium">
                {completedLessons} / {totalLessons} completed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">
            <BookOpen className="h-4 w-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Lessons</CardTitle>
              <CardDescription>
                Track your progress through the course content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!course.lessons || course.lessons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No lessons available yet
                </div>
              ) : (
                <div className="space-y-3">
                  {course.lessons.map((lesson: any, index: number) => (
                    <div
                      key={lesson._id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Lesson {index + 1}: {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                        {lesson.progress > 0 && lesson.progress < 100 && (
                          <Progress value={lesson.progress} className="h-1 mt-2" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!lesson.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkComplete(lesson._id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {lesson.completed ? "Review" : "Start"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">About This Course</h3>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instructor</h3>
                <p className="text-sm">{course.instructor?.name}</p>
                {course.instructor?.email && (
                  <p className="text-sm text-muted-foreground">{course.instructor.email}</p>
                )}
              </div>

              <Separator />
              <div>
                <h3 className="font-semibold mb-4">Rate this Course</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 hover:scale-110 transition-transform ${star <= rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Write a review..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <Button onClick={handleSubmitRating} disabled={submittingRating || rating === 0}>
                    {submittingRating ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs >
    </div >
  );
}
