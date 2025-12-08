"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SubmissionsPage() {
    const router = useRouter();
    const params = useParams();
    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ grade: 0, feedback: "" });
    const [grading, setGrading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentData, submissionsData] = await Promise.all([
                InstructorAPI.getAssignment(assignmentId),
                InstructorAPI.getSubmissions(assignmentId),
            ]);
            setAssignment(assignmentData);
            setSubmissions(submissionsData || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = (submission: any) => {
        setSelectedSubmission(submission);
        setGradeData({
            grade: submission.grade || 0,
            feedback: submission.feedback || "",
        });
        setGradeDialogOpen(true);
    };

    const submitGrade = async () => {
        if (!selectedSubmission) return;

        try {
            setGrading(true);
            await InstructorAPI.gradeSubmission(
                assignmentId,
                selectedSubmission._id,
                gradeData
            );
            toast.success("Submission graded successfully");
            setGradeDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Grading failed:", error);
            toast.error("Failed to grade submission");
        } finally {
            setGrading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/instructor/assignments")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
                    <p className="text-muted-foreground">{assignment?.title}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <p className="text-sm font-medium">Total Submissions</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submissions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <p className="text-sm font-medium">Graded</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {submissions.filter((s) => s.status === "graded").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <p className="text-sm font-medium">Pending</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {submissions.filter((s) => s.status !== "graded").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length > 0 ? (
                            submissions.map((submission) => (
                                <TableRow key={submission._id}>
                                    <TableCell className="font-medium">
                                        {submission.student?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(submission.submittedAt), "MMM d, yyyy h:mm a")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                submission.status === "graded"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {submission.status === "graded" ? (
                                                <><CheckCircle className="h-3 w-3 mr-1" /> Graded</>
                                            ) : (
                                                <><Clock className="h-3 w-3 mr-1" /> Pending</>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {submission.grade !== undefined
                                            ? `${submission.grade}/${assignment?.points}`
                                            : "Not graded"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => handleGrade(submission)}
                                        >
                                            {submission.status === "graded" ? "Re-grade" : "Grade"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        No submissions yet
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Grading Dialog */}
            <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                        <DialogDescription>
                            Provide a grade and feedback for {selectedSubmission?.student?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Submission Content</Label>
                            <p className="text-sm bg-muted p-3 rounded-md">
                                {selectedSubmission?.content || "No content provided"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">
                                Grade (out of {assignment?.points})
                            </Label>
                            <Input
                                id="grade"
                                type="number"
                                min="0"
                                max={assignment?.points}
                                value={gradeData.grade}
                                onChange={(e) =>
                                    setGradeData({
                                        ...gradeData,
                                        grade: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <Textarea
                                id="feedback"
                                value={gradeData.feedback}
                                onChange={(e) =>
                                    setGradeData({ ...gradeData, feedback: e.target.value })
                                }
                                placeholder="Provide feedback..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setGradeDialogOpen(false)}
                            disabled={grading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitGrade} disabled={grading}>
                            {grading ? "Saving..." : "Submit Grade"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
