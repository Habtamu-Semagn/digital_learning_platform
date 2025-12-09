"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, FileText, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AssignmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submissionContent, setSubmissionContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const data = await StudentAPI.getAssignment(assignmentId);
            setAssignment(data || null);
        } catch (error) {
            console.error("Failed to fetch assignment:", error);
            toast.error("Failed to load assignment details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!submissionContent.trim()) {
            toast.error("Please enter your submission content");
            return;
        }

        try {
            setSubmitting(true);
            await StudentAPI.submitAssignment(assignmentId, {
                content: submissionContent,
                attachments: [],
            });
            toast.success("Assignment submitted successfully!");
            fetchAssignment(); // Refresh to show submission
            setSubmissionContent("");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!assignment) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assignments
            </Button>

            {/* Assignment Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                            <p className="text-muted-foreground">{assignment.course?.title}</p>
                        </div>
                        <Badge
                            className="text-white"
                            variant={
                                assignment.grade
                                    ? "default"
                                    : assignment.hasSubmitted
                                        ? "secondary"
                                        : "outline"
                            }
                        >
                            {assignment.grade
                                ? `Graded: ${assignment.grade}/${assignment.points}`
                                : assignment.hasSubmitted
                                    ? "Submitted"
                                    : "Pending"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Points: {assignment.points}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Description</h3>
                        <p className="whitespace-pre-wrap">{assignment.description}</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Instructor</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {assignment.instructor?.name?.[0]}
                            </div>
                            <span>{assignment.instructor?.name}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submission Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Submission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {assignment.hasSubmitted ? (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-secondary/20 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Submitted on {new Date(assignment.submission?.submittedAt || assignment.submittedAt).toLocaleString()}</span>
                                </div>
                                <p className="whitespace-pre-wrap">{assignment.submission?.content}</p>
                            </div>

                            {assignment.grade && (
                                <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                                    <div className="flex items-center gap-2 mb-2 font-semibold text-green-700">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Instructor Feedback</span>
                                    </div>
                                    <p className="text-sm">{assignment.feedback}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="submission">Content</Label>
                                <Textarea
                                    id="submission"
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    placeholder="Enter your assignment submission here..."
                                    className="min-h-[200px]"
                                />
                            </div>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Submit Assignment
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
