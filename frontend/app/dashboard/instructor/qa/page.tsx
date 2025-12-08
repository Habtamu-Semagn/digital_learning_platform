"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    MoreVertical,
    Trash2,
    CheckCircle,
    MessageSquare,
    ThumbsUp,
    Eye,
    HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QAPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterQuestions();
    }, [questions, searchQuery, courseFilter, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [questionsData, coursesData] = await Promise.all([
                InstructorAPI.getQuestions(),
                InstructorAPI.getMyCourses(),
            ]);
            setQuestions(questionsData || []);
            setCourses(coursesData || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    const filterQuestions = () => {
        let filtered = [...questions];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (question) =>
                    question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    question.content?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by course
        if (courseFilter !== "all") {
            filtered = filtered.filter(
                (question) => question.course?._id === courseFilter
            );
        }

        // Filter by status
        if (statusFilter === "resolved") {
            filtered = filtered.filter((question) => question.isResolved);
        } else if (statusFilter === "unresolved") {
            filtered = filtered.filter((question) => !question.isResolved);
        }

        setFilteredQuestions(filtered);
    };

    const handleViewQuestion = (id: string) => {
        router.push(`/dashboard/instructor/qa/${id}`);
    };

    const handleToggleResolve = async (question: any, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await InstructorAPI.toggleResolveQuestion(question._id);
            toast.success(question.isResolved ? "Marked as unresolved" : "Marked as resolved");
            fetchData();
        } catch (error) {
            console.error("Toggle resolve failed:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (question: any, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await InstructorAPI.deleteQuestion(question._id);
            toast.success("Question deleted successfully");
            fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete question");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Q&A</h1>
                    <p className="text-muted-foreground">
                        Course questions and discussions
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Total Questions</p>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{questions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Resolved</p>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {questions.filter((q) => q.isResolved).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Unresolved</p>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {questions.filter((q) => !q.isResolved).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Total Answers</p>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {questions.reduce((sum, q) => sum + (q.answerCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Questions List */}
            <div className="grid gap-4">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question) => (
                        <Card
                            key={question._id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleViewQuestion(question._id)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {question.isResolved && (
                                                <Badge className="bg-green-500">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Resolved
                                                </Badge>
                                            )}
                                            {question.hasAcceptedAnswer && (
                                                <Badge variant="outline" className="border-green-500 text-green-500">
                                                    Accepted Answer
                                                </Badge>
                                            )}
                                            <Badge variant="outline">
                                                {question.course?.title}
                                            </Badge>
                                        </div>
                                        <h3 className="text-lg font-semibold">{question.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {question.content}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {question.answerCount || 0} answers
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" />
                                                {question.upvoteCount || 0} upvotes
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {question.views || 0} views
                                            </span>
                                            <span>
                                                Asked {format(new Date(question.createdAt), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewQuestion(question._id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => handleToggleResolve(question, e)}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {question.isResolved ? "Mark as Unresolved" : "Mark as Resolved"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleDelete(question, e)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {questions.length === 0
                                    ? "No questions yet. Students can ask questions in your courses."
                                    : "No questions found matching your filters"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
