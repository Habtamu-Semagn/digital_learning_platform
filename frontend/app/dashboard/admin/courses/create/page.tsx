"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { AdminAPI } from "@/lib/api";

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        instructor: "",
        institution: "",
        category: "",
        price: 0,
        status: "draft",
        thumbnail: "",
        lessons: [] as any[],
    });

    useEffect(() => {
        fetchInstructors();
        fetchInstitutions();
    }, []);

    const fetchInstructors = async () => {
        try {
            // Using AdminAPI which sends auth token
            const data = await AdminAPI.getInstructors(1, 100); // Fetch up to 100 instructors
            if (data.users) {
                setInstructors(data.users);
            }
        } catch (error) {
            console.error("Error fetching instructors:", error);
        }
    };

    const fetchInstitutions = async () => {
        try {
            const data = await AdminAPI.getInstitutions(1, 100);
            if (data.institutions) {
                setInstitutions(data.institutions);
            }
        } catch (error) {
            console.error("Error fetching institutions:", error);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Lesson Management
    const addLesson = () => {
        setFormData((prev: any) => ({
            ...prev,
            lessons: [
                ...prev.lessons,
                { title: "", description: "", videoUrl: "" },
            ],
        }));
    };

    const removeLesson = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            lessons: prev.lessons.filter((_: any, i: number) => i !== index),
        }));
    };

    const handleLessonChange = (index: number, field: string, value: string) => {
        const newLessons = [...formData.lessons];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setFormData((prev) => ({ ...prev, lessons: newLessons }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await AdminAPI.createCourse(formData);
            if (data.status === "success") {
                toast.success("Course created successfully");
                router.push("/dashboard/admin/courses");
            } else {
                // Fallback if status check fails but no error thrown (though fetchClient throws on error)
                toast.success("Course created successfully");
                router.push("/dashboard/admin/courses");
            }
        } catch (error) {
            console.error("Error creating course:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
                    <p className="text-muted-foreground">Add a new course to the catalog</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Advanced Web Development"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    placeholder="e.g. Programming"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Course description..."
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instructor">Instructor</Label>
                                <Select
                                    name="instructor"
                                    onValueChange={(value) => handleSelectChange("instructor", value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instructors.map((inst: any) => (
                                            <SelectItem key={inst._id} value={inst._id}>
                                                {inst.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution (Optional)</Label>
                                <Select
                                    name="institution"
                                    onValueChange={(value) => handleSelectChange("institution", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Institution" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutions.map((inst: any) => (
                                            <SelectItem key={inst._id} value={inst._id}>
                                                {inst.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                                <Input
                                    id="thumbnail"
                                    name="thumbnail"
                                    placeholder="https://..."
                                    value={formData.thumbnail}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lessons</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addLesson}>
                            <Plus className="mr-2 h-4 w-4" /> Add Lesson
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {formData.lessons.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                                No lessons added yet. Click "Add Lesson" to start.
                            </p>
                        )}
                        {formData.lessons.map((lesson: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4 space-y-4 relative bg-muted/20">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeLesson(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                    <div className="space-y-2">
                                        <Label>Lesson Title</Label>
                                        <Input
                                            placeholder="Introduction"
                                            value={lesson.title}
                                            onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Video URL</Label>
                                        <Input
                                            placeholder="https://..."
                                            value={lesson.videoUrl}
                                            onChange={(e) => handleLessonChange(index, "videoUrl", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description / Notes</Label>
                                    <Textarea
                                        placeholder="Brief summary of this lesson..."
                                        value={lesson.description}
                                        onChange={(e) => handleLessonChange(index, "description", e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Creating..." : "Create Course"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
