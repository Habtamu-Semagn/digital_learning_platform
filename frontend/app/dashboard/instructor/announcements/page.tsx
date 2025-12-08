"use client";

import { useState, useEffect } from "react";
import { InstructorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Pin,
    Megaphone,
    AlertTriangle,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        course: "",
        priority: "normal",
        pinned: false,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAnnouncements();
    }, [announcements, searchQuery, courseFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [announcementsData, coursesData] = await Promise.all([
                InstructorAPI.getAnnouncements(),
                InstructorAPI.getMyCourses(),
            ]);
            setAnnouncements(announcementsData || []);
            setCourses(coursesData || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const filterAnnouncements = () => {
        let filtered = [...announcements];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (announcement) =>
                    announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    announcement.content?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by course
        if (courseFilter !== "all") {
            filtered = filtered.filter(
                (announcement) => announcement.course?._id === courseFilter
            );
        }

        setFilteredAnnouncements(filtered);
    };

    const handleCreate = () => {
        setFormData({
            title: "",
            content: "",
            course: "",
            priority: "normal",
            pinned: false,
        });
        setCreateDialogOpen(true);
    };

    const handleEdit = (announcement: any) => {
        setSelectedAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            course: announcement.course._id,
            priority: announcement.priority,
            pinned: announcement.pinned,
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (announcement: any) => {
        setSelectedAnnouncement(announcement);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content || !formData.course) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setSaving(true);
            if (selectedAnnouncement) {
                await InstructorAPI.updateAnnouncement(selectedAnnouncement._id, formData);
                toast.success("Announcement updated successfully");
            } else {
                await InstructorAPI.createAnnouncement(formData);
                toast.success("Announcement created successfully");
            }
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Failed to save announcement");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedAnnouncement) return;

        try {
            await InstructorAPI.deleteAnnouncement(selectedAnnouncement._id);
            toast.success("Announcement deleted successfully");
            fetchData();
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete announcement");
        }
    };

    const togglePin = async (announcement: any) => {
        try {
            await InstructorAPI.togglePinAnnouncement(announcement._id);
            toast.success(announcement.pinned ? "Unpinned" : "Pinned");
            fetchData();
        } catch (error) {
            console.error("Pin toggle failed:", error);
            toast.error("Failed to update pin status");
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "urgent":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case "important":
                return <Info className="h-4 w-4 text-yellow-500" />;
            default:
                return <Megaphone className="h-4 w-4 text-blue-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500";
            case "important":
                return "bg-yellow-500";
            default:
                return "bg-blue-500";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading announcements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">
                        Post announcements to your courses
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Announcement
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search announcements..."
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

            {/* Announcements List */}
            <div className="grid gap-4">
                {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((announcement) => (
                        <Card key={announcement._id} className={announcement.pinned ? "border-primary" : ""}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {announcement.pinned && (
                                                <Pin className="h-4 w-4 text-primary" />
                                            )}
                                            {getPriorityIcon(announcement.priority)}
                                            <Badge className={getPriorityColor(announcement.priority)}>
                                                {announcement.priority}
                                            </Badge>
                                            <Badge variant="outline">
                                                {announcement.course?.title}
                                            </Badge>
                                        </div>
                                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {announcement.content}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Posted {format(new Date(announcement.publishedAt), "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => togglePin(announcement)}>
                                                <Pin className="mr-2 h-4 w-4" />
                                                {announcement.pinned ? "Unpin" : "Pin"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(announcement)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {announcements.length === 0
                                    ? "No announcements yet. Create your first announcement!"
                                    : "No announcements found matching your filters"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
                setCreateDialogOpen(open);
                setEditDialogOpen(open);
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedAnnouncement ? "Edit Announcement" : "Create Announcement"}
                        </DialogTitle>
                        <DialogDescription>
                            Post an announcement to notify students in your course
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Announcement title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="course">Course *</Label>
                            <Select
                                value={formData.course}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, course: value })
                                }
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
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, priority: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="important">Important</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                placeholder="Announcement content..."
                                rows={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setEditDialogOpen(false);
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedAnnouncement?.title}"?
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
