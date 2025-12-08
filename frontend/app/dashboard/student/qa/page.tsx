"use client";

import { useState, useEffect } from "react";
import { StudentAPI, InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, MessageSquare, ThumbsUp, CheckCircle, Search, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function QAPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [askDialogOpen, setAskDialogOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: "", content: "", tags: "", course: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Get enrolled courses
            const coursesData = await StudentAPI.getEnrolledCourses();
            setEnrolledCourses(coursesData || []);

            // Get questions from all enrolled courses
            const courseIds = coursesData.map((c: any) => c._id);
            if (courseIds.length > 0) {
                // Fetch questions for the first course as a start
                // In a real implementation, you'd fetch all or filter by selected course
                const questionsData = await InstructorAPI.getQuestions();
                setQuestions(questionsData || []);
            }
        } catch (error) {
            console.error("Failed to fetch Q&A data:", error);
            toast.error("Failed to load Q&A");
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
            toast.error("Please fill in title and content");
            return;
        }

        if (!newQuestion.course) {
            toast.error("Please select a course");
            return;
        }

        try {
            setSubmitting(true);
            const tags = newQuestion.tags.split(',').map(t => t.trim()).filter(t => t);

            await InstructorAPI.createQuestion({
                title: newQuestion.title,
                content: newQuestion.content,
                course: newQuestion.course,
                tags
            });

            toast.success("Question posted successfully!");
            setAskDialogOpen(false);
            setNewQuestion({ title: "", content: "", tags: "", course: "" });
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to post question");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (questionId: string) => {
        try {
            await InstructorAPI.upvoteQuestion(questionId);
            toast.success("Upvoted!");
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to upvote");
        }
    };

    // Filter questions
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = selectedCourse === "all" || q.course?._id === selectedCourse;
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "resolved" && q.isResolved) ||
            (filterStatus === "unresolved" && !q.isResolved);
        return matchesSearch && matchesCourse && matchesStatus;
    });

    const resolvedCount = questions.filter(q => q.isResolved).length;
    const unresolvedCount = questions.filter(q => !q.isResolved).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Q&A</h1>
                    <p className="text-muted-foreground">
                        Ask questions and help your peers
                    </p>
                </div>
                <Button onClick={() => setAskDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ask Question
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{questions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resolvedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
                        <MessageSquare className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unresolvedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {enrolledCourses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Questions List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredQuestions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            {searchQuery ? "Try adjusting your search" : "Be the first to ask a question!"}
                        </p>
                        <Button onClick={() => setAskDialogOpen(true)}>Ask Question</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredQuestions.map((question) => (
                        <Card key={question._id} className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/dashboard/student/qa/${question._id}`)}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{question.title}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {question.course?.title || 'Course'} • Asked by {question.askedBy?.name || 'Student'}
                                        </CardDescription>
                                    </div>
                                    {question.isResolved && (
                                        <Badge className="bg-green-500">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Resolved
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {question.content}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{question.upvotes || 0} upvotes</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{question.answers?.length || 0} answers</span>
                                    </div>
                                    {question.tags && question.tags.length > 0 && (
                                        <div className="flex gap-1">
                                            {question.tags.slice(0, 3).map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Ask Question Dialog */}
            <Dialog open={askDialogOpen} onOpenChange={setAskDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Ask a Question</DialogTitle>
                        <DialogDescription>
                            Post your question to get help from instructors and peers
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="course">Course *</Label>
                            <Select value={newQuestion.course} onValueChange={(value) =>
                                setNewQuestion({ ...newQuestion, course: value })
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {enrolledCourses.map((course) => (
                                        <SelectItem key={course._id} value={course._id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={newQuestion.title}
                                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                                placeholder="Brief question title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Question Details *</Label>
                            <Textarea
                                id="content"
                                value={newQuestion.content}
                                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                                placeholder="Provide more details about your question..."
                                rows={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (optional)</Label>
                            <Input
                                id="tags"
                                value={newQuestion.tags}
                                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                                placeholder="Separate tags with commas (e.g., calculus, integration)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAskDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleAskQuestion} disabled={submitting}>
                            {submitting ? "Posting..." : "Post Question"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
