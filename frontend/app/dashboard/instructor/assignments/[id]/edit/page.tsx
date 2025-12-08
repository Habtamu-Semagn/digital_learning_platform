"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditAssignmentPage() {
    const router = useRouter();
    const params = useParams();
    const assignmentId = params.id as string;

    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        course: "",
        dueDate: "",
        points: 100,
        status: "draft",
    });

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentData, coursesData] = await Promise.all([
                InstructorAPI.getAssignment(assignmentId),
                InstructorAPI.getMyCourses(),
            ]);

            setCourses(coursesData || []);

            // Pre-populate form with assignment data
            if (assignmentData) {
                setFormData({
                    title: assignmentData.title || "",
                    description: assignmentData.description || "",
                    course: assignmentData.course?._id || "",
                    dueDate: assignmentData.dueDate
                        ? new Date(assignmentData.dueDate).toISOString().slice(0, 16)
                        : "",
                    points: assignmentData.points || 100,
                    status: assignmentData.status || "draft",
                });
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.course || !formData.dueDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setSaving(true);
            await InstructorAPI.updateAssignment(assignmentId, formData);
            toast.success("Assignment updated successfully");
            router.push("/dashboard/instructor/assignments");
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update assignment");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading assignment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Assignment</h1>
                    <p className="text-muted-foreground">
                        Update assignment details
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Assignment title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course">
                                Course <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.course}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, course: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course._id} value={course._id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">
                                    Due Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="dueDate"
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dueDate: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="points">Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    min="0"
                                    value={formData.points}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            points: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Assignment instructions and details..."
                                rows={8}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Updating..." : "Update Assignment"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
