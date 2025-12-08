"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { CourseCard } from "@/components/instructor/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function MyCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, searchQuery, statusFilter]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await InstructorAPI.getMyCourses();
            setCourses(data || []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = [...courses];

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((course) => course.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter((course) =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredCourses(filtered);
    };

    const handleCreate = () => {
        router.push("/dashboard/instructor/courses/create");
    };

    const handleEdit = (id: string) => {
        router.push(`/dashboard/instructor/courses/${id}/edit`);
    };

    const handleView = (id: string) => {
        router.push(`/dashboard/instructor/courses/${id}/edit`);
    };

    const handleDelete = (id: string) => {
        const course = courses.find((c) => c._id === id);
        setSelectedCourse(course);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedCourse) return;

        try {
            await InstructorAPI.deleteCourse(selectedCourse._id);
            toast.success("Course deleted successfully");
            fetchCourses();
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete course");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading courses...</p>
                </div>
            </div>
        );
    }

    // Empty state when no courses exist
    if (courses.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                        <p className="text-muted-foreground">
                            Manage your courses and content
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No courses yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Get started by creating your first course. Add lessons, descriptions, and videos to help your students learn.
                    </p>
                    <Button onClick={handleCreate} size="lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Your First Course
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">
                        Manage your courses and content
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No courses found matching your filters
                    </p>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course "{selectedCourse?.title}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}