"use client";

import { useState, useEffect } from "react";
import { StudentAPI } from "@/lib/api";
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
import { Calendar, FileText, Loader2, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AssignmentsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [submissionContent, setSubmissionContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [statusFilter]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await StudentAPI.getMyAssignments({ status: statusFilter });
            setAssignments(data || []);
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
            toast.error("Failed to load assignments");
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
            await StudentAPI.submitAssignment(selectedAssignment._id, {
                content: submissionContent,
                attachments: []
            });
            toast.success("Assignment submitted successfully!");
            setSubmitDialogOpen(false);
            setSubmissionContent("");
            setSelectedAssignment(null);
            fetchAssignments();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingCount = assignments.filter(a => !a.hasSubmitted).length;
    const submittedCount = assignments.filter(a => a.hasSubmitted && !a.grade).length;
    const gradedCount = assignments.filter(a => a.grade !== null && a.grade !== undefined).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Assignments</h1>
                <p className="text-muted-foreground">
                    View and submit your course assignments
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submittedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Graded</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{gradedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Assignments</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="graded">Graded</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Assignments List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredAssignments.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                        <p className="text-muted-foreground text-center">
                            {searchQuery ? "Try adjusting your search" : "No assignments available"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredAssignments.map((assignment) => (
                        <Card key={assignment._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>{assignment.title}</CardTitle>
                                        <CardDescription>
                                            {assignment.course?.title || 'Course'}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            assignment.grade !== null && assignment.grade !== undefined
                                                ? "default"
                                                : assignment.hasSubmitted
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {assignment.grade !== null && assignment.grade !== undefined
                                            ? `Graded: ${assignment.grade}/${assignment.points}`
                                            : assignment.hasSubmitted
                                                ? "Submitted"
                                                : "Pending"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {assignment.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>Points: {assignment.points}</div>
                                </div>
                                {assignment.feedback && (
                                    <div className="rounded-lg bg-muted p-3">
                                        <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                                        <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button
                                    onClick={() => router.push(`/dashboard/student/assignments/${assignment._id}`)}
                                    variant="outline"
                                >
                                    View Details
                                </Button>
                                {!assignment.hasSubmitted && (
                                    <Button
                                        onClick={() => {
                                            setSelectedAssignment(assignment);
                                            setSubmitDialogOpen(true);
                                        }}
                                    >
                                        Submit Assignment
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Submit Dialog */}
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        <DialogDescription>
                            {selectedAssignment?.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="content">Your Submission</Label>
                            <Textarea
                                id="content"
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                                placeholder="Enter your assignment submission here..."
                                rows={10}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSubmitDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Assignment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
