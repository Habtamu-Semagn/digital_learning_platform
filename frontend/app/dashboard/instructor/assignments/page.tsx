"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    FileText,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AssignmentsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAssignments();
    }, [assignments, searchQuery, courseFilter, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsData, coursesData] = await Promise.all([
                InstructorAPI.getAssignments(),
                InstructorAPI.getMyCourses(),
            ]);
            setAssignments(assignmentsData || []);
            setCourses(coursesData || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const filterAssignments = () => {
        let filtered = [...assignments];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter((assignment) =>
                assignment.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by course
        if (courseFilter !== "all") {
            filtered = filtered.filter(
                (assignment) => assignment.course?._id === courseFilter
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (assignment) => assignment.status === statusFilter
            );
        }

        setFilteredAssignments(filtered);
    };

    const handleCreate = () => {
        router.push("/dashboard/instructor/assignments/create");
    };

    const handleEdit = (id: string) => {
        router.push(`/dashboard/instructor/assignments/${id}/edit`);
    };

    const handleViewSubmissions = (id: string) => {
        router.push(`/dashboard/instructor/assignments/${id}/submissions`);
    };

    const handleDelete = (assignment: any) => {
        setSelectedAssignment(assignment);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedAssignment) return;

        try {
            await InstructorAPI.deleteAssignment(selectedAssignment._id);
            toast.success("Assignment deleted successfully");
            fetchData();
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete assignment");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "bg-green-500";
            case "draft":
                return "bg-yellow-500";
            case "closed":
                return "bg-gray-500";
            default:
                return "bg-blue-500";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading assignments...</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (assignments.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                        <p className="text-muted-foreground">
                            Create and manage course assignments
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No assignments yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Create your first assignment to start tracking student work and providing feedback.
                    </p>
                    <Button onClick={handleCreate} size="lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Assignment
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
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">
                        Create and manage course assignments
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Total Assignments</p>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Published</p>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {assignments.filter((a) => a.status === "published").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Drafts</p>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {assignments.filter((a) => a.status === "draft").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assignments..."
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Assignments Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Submissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAssignments.length > 0 ? (
                            filteredAssignments.map((assignment) => (
                                <TableRow key={assignment._id}>
                                    <TableCell className="font-medium">
                                        {assignment.title}
                                    </TableCell>
                                    <TableCell>{assignment.course?.title || "N/A"}</TableCell>
                                    <TableCell>
                                        {assignment.dueDate
                                            ? format(new Date(assignment.dueDate), "MMM d, yyyy")
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>{assignment.points}</TableCell>
                                    <TableCell>
                                        {assignment.gradedCount || 0}/{assignment.submissionCount || 0}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(assignment.status)}>
                                            {assignment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleViewSubmissions(assignment._id)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Submissions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(assignment._id)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(assignment)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        No assignments found matching your filters
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedAssignment?.title}"? This
                            action cannot be undone and will remove all submissions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
