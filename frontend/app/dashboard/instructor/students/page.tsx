"use client";

import { useState, useEffect } from "react";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Search,
    UserPlus,
    MoreVertical,
    Trash2,
    Eye,
    GraduationCap,
    Users,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AdminAPI, InstructorAPI } from "@/lib/api";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [newStudent, setNewStudent] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        institution: "",
    });
    const [addingStudent, setAddingStudent] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [courseFilter]);

    useEffect(() => {
        filterStudents();
    }, [students, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch students enrolled in instructor's courses
            // If filtering by course (and not 'all'), pass the course ID
            const activeCourseFilter = courseFilter !== 'all' ? courseFilter : undefined;
            const usersData = await InstructorAPI.getStudents(activeCourseFilter);
            setStudents(usersData || []);

            // Fetch instructor's courses
            const coursesData = await InstructorAPI.getMyCourses();
            setCourses(coursesData || []);

            // Fetch institutions
            const institutionsData = await AdminAPI.getInstitutions(1, 100);
            setInstitutions(institutionsData.institutions || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = [...students];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (student) =>
                    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredStudents(filtered);
    };

    const handleAddStudent = async () => {
        // Validate all fields
        if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.passwordConfirm) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (newStudent.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (newStudent.password !== newStudent.passwordConfirm) {
            toast.error("Passwords do not match");
            return;
        }

        // Password complexity check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
        if (!passwordRegex.test(newStudent.password)) {
            toast.error("Password must include uppercase, lowercase, number, and special character");
            return;
        }

        try {
            setAddingStudent(true);
            await InstructorAPI.createStudent(newStudent);
            toast.success(`Student registered successfully! They can now login with email: ${newStudent.email}`);
            setAddDialogOpen(false);
            setNewStudent({
                name: "",
                email: "",
                password: "",
                passwordConfirm: "",
                institution: "",
            });
            fetchData(); // Refresh student list
        } catch (error: any) {
            console.error("Failed to add student:", error);
            toast.error(error.message || "Failed to register student");
        } finally {
            setAddingStudent(false);
        }
    };

    const handleViewDetails = (student: any) => {
        setSelectedStudent(student);
        setDetailsDialogOpen(true);
    };

    const handleDelete = (student: any) => {
        setSelectedStudent(student);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedStudent) return;

        try {
            // In a real implementation, this would unenroll the student
            toast.success("Student removal functionality coming soon");
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to remove student");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading students...</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (students.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                        <p className="text-muted-foreground">
                            Manage students enrolled in your courses
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <GraduationCap className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No students yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Students who enroll in your courses will appear here. You can also manually add students.
                    </p>
                    <Button onClick={() => setAddDialogOpen(true)} size="lg">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Add Student
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
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <p className="text-muted-foreground">
                        Manage students enrolled in your courses
                    </p>
                </div>
                <Button onClick={() => setAddDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Total Students</p>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Active Courses</p>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Filtered Results</p>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStudents.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
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
            </div>

            {/* Students Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Institution</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell className="font-medium">
                                        {student.name || "N/A"}
                                    </TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>
                                        {student.institution?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                student.isActive ? "default" : "secondary"
                                            }
                                        >
                                            {student.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(student.createdAt).toLocaleDateString()}
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
                                                    onClick={() => handleViewDetails(student)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(student)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        No students found matching your filters
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Add Student Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Register New Student</DialogTitle>
                        <DialogDescription className="text-sm">
                            Create a student account with login credentials.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={newStudent.name}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, name: e.target.value })
                                }
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@example.com"
                                value={newStudent.email}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, email: e.target.value })
                                }
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="institution" className="text-sm">Institution</Label>
                            <Select
                                value={newStudent.institution}
                                onValueChange={(value) =>
                                    setNewStudent({ ...newStudent, institution: value })
                                }
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((inst) => (
                                        <SelectItem key={inst._id} value={inst._id}>
                                            {inst.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min 8 chars"
                                value={newStudent.password}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, password: e.target.value })
                                }
                                className="h-9"
                            />
                            <p className="text-[11px] text-muted-foreground leading-tight">
                                8-15 chars: A-Z, a-z, 0-9, @#$!%*?&
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="passwordConfirm" className="text-sm">
                                Confirm <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="passwordConfirm"
                                type="password"
                                placeholder="Re-enter password"
                                value={newStudent.passwordConfirm}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        passwordConfirm: e.target.value,
                                    })
                                }
                                className="h-9"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAddDialogOpen(false)}
                            disabled={addingStudent}
                            className="h-9"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddStudent} disabled={addingStudent} className="h-9">
                            {addingStudent ? "Registering..." : "Register"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Student Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <p className="font-medium">{selectedStudent.name || "N/A"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{selectedStudent.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Institution</Label>
                                <p className="font-medium">
                                    {selectedStudent.institution?.name || "N/A"}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <p>
                                    <Badge
                                        variant={
                                            selectedStudent.isActive ? "default" : "secondary"
                                        }
                                    >
                                        {selectedStudent.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Joined Date</Label>
                                <p className="font-medium">
                                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <strong>{selectedStudent?.name || selectedStudent?.email}</strong>?
                            This will unenroll them from your courses.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}