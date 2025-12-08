"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QuestionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const questionId = params.id as string;

    const [question, setQuestion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answerContent, setAnswerContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestion();
    }, [questionId]);

    const fetchQuestion = async () => {
        try {
            setLoading(true);
            const data = await InstructorAPI.getQuestion(questionId);
            setQuestion(data);
        } catch (error) {
            console.error("Failed to fetch question:", error);
            toast.error("Failed to load question");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnswer = async () => {
        if (!answerContent.trim()) {
            toast.error("Please enter an answer");
            return;
        }

        try {
            setSubmitting(true);
            await InstructorAPI.addAnswer(questionId, answerContent);
            toast.success("Answer added successfully");
            setAnswerContent("");
            fetchQuestion();
        } catch (error) {
            console.error("Add answer failed:", error);
            toast.error("Failed to add answer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptAnswer = async (answerId: string) => {
        try {
            await InstructorAPI.acceptAnswer(questionId, answerId);
            toast.success("Answer accepted");
            fetchQuestion();
        } catch (error) {
            console.error("Accept answer failed:", error);
            toast.error("Failed to accept answer");
        }
    };

    const handleToggleResolve = async () => {
        try {
            await InstructorAPI.toggleResolveQuestion(questionId);
            toast.success(question.isResolved ? "Marked as unresolved" : "Marked as resolved");
            fetchQuestion();
        } catch (error) {
            console.error("Toggle resolve failed:", error);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Question not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/instructor/qa")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {question.isResolved && (
                                <Badge className="bg-green-500">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolved
                                </Badge>
                            )}
                            <Badge variant="outline">{question.course?.title}</Badge>
                            {question.tags?.map((tag: string) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl font-bold">{question.title}</h1>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {question.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {question.answerCount || 0} answers
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {question.upvoteCount || 0} upvotes
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {question.views || 0} views
                            </span>
                            <span>
                                Asked by {question.askedBy?.name} on{" "}
                                {format(new Date(question.createdAt), "MMM d, yyyy")}
                            </span>
                        </div>
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleResolve}
                            >
                                {question.isResolved ? "Mark as Unresolved" : "Mark as Resolved"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Answers */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? "s" : ""}
                </h2>

                {question.answers?.map((answer: any) => (
                    <Card
                        key={answer._id}
                        className={answer.isAccepted ? "border-green-500" : ""}
                    >
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {answer.isAccepted && (
                                    <Badge className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Accepted Answer
                                    </Badge>
                                )}
                                {answer.isInstructorAnswer && (
                                    <Badge className="bg-blue-500">Instructor</Badge>
                                )}
                                <p className="whitespace-pre-wrap">{answer.content}</p>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="h-3 w-3" />
                                            {answer.upvotes?.length || 0} upvotes
                                        </span>
                                        <span>
                                            Answered by {answer.answeredBy?.name} on{" "}
                                            {format(new Date(answer.createdAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    {!answer.isAccepted && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAcceptAnswer(answer._id)}
                                        >
                                            Accept Answer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Answer */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Your Answer</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        placeholder="Write your answer here..."
                        rows={6}
                    />
                    <Button onClick={handleAddAnswer} disabled={submitting}>
                        {submitting ? "Posting..." : "Post Answer"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
