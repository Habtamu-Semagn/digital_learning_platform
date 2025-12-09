"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ThumbsUp, MessageSquare, CheckCircle, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function QuestionDetailPage() {
    const params = useParams();
    const router = useRouter();
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
        } catch (error: any) {
            console.error("Failed to fetch question:", error);
            toast.error(error.message || "Failed to load question");
            router.push("/dashboard/student/qa");
        } finally {
            setLoading(false);
        }
    };

    const handleUpvoteQuestion = async () => {
        try {
            await InstructorAPI.upvoteQuestion(questionId);
            toast.success("Upvoted!");
            fetchQuestion();
        } catch (error: any) {
            toast.error(error.message || "Failed to upvote");
        }
    };

    const handleUpvoteAnswer = async (answerId: string) => {
        try {
            await InstructorAPI.upvoteAnswer(questionId, answerId);
            toast.success("Upvoted answer!");
            fetchQuestion();
        } catch (error: any) {
            toast.error(error.message || "Failed to upvote");
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answerContent.trim()) {
            toast.error("Please enter your answer");
            return;
        }

        try {
            setSubmitting(true);
            await InstructorAPI.addAnswer(questionId, answerContent);
            toast.success("Answer submitted successfully!");
            setAnswerContent("");
            fetchQuestion();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit answer");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!question) {
        return <div>Question not found</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Q&A
            </Button>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{question.course?.title || 'Course'}</Badge>
                                {question.isResolved && (
                                    <Badge className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Resolved
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-2xl">{question.title}</CardTitle>
                            <CardDescription className="mt-2">
                                Asked by {question.askedBy?.name || 'Student'} • {new Date(question.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm whitespace-pre-wrap">{question.content}</p>

                    {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-2">
                            {question.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                        <Button variant="outline" size="sm" onClick={handleUpvoteQuestion}>
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Upvote ({question.upvotes?.length || 0})
                        </Button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>{question.answers?.length || 0} answers</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Answers Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {question.answers?.length || 0} {question.answers?.length === 1 ? 'Answer' : 'Answers'}
                </h2>

                {question.answers && question.answers.length > 0 ? (
                    <div className="space-y-4">
                        {question.answers.map((answer: any) => (
                            <Card key={answer._id}>
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">{answer.answeredBy?.name || 'Student'}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    • {new Date(answer.createdAt).toLocaleDateString()}
                                                </span>
                                                {answer.isAccepted && (
                                                    <Badge className="bg-green-500">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Accepted Answer
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{answer.content}</p>
                                            <div className="mt-3">
                                                <Button variant="ghost" size="sm" onClick={() => handleUpvoteAnswer(answer._id)}>
                                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                                    Upvote ({answer.upvotes?.length || 0})
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No answers yet. Be the first to help!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add Answer Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Answer</CardTitle>
                    <CardDescription>
                        Help your peers by providing a thoughtful answer
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Textarea
                            id="answer"
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            placeholder="Write your answer here..."
                            rows={6}
                        />
                    </div>
                    <Button onClick={handleSubmitAnswer} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Answer"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
