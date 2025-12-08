"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { InstructorAPI } from "@/lib/api";
import { toast } from "sonner";
import { Upload, Loader2, Video, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ContentUploadModalProps {
    type: "video" | "book";
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ContentUploadModal({
    type,
    open,
    onOpenChange,
    onSuccess,
}: ContentUploadModalProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        author: "",
        category: "",
        language: "en",
        tags: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(10);

            const data = new FormData();
            data.append(type === "video" ? "video" : "file", file);
            data.append("title", formData.title);
            data.append("description", formData.description);
            if (formData.author) {
                data.append("author", formData.author);
            }
            data.append("category", formData.category);
            data.append("language", formData.language);

            if (formData.tags) {
                const tagsArray = formData.tags.split(",").map((tag) => tag.trim());
                tagsArray.forEach((tag) => data.append("tags", tag));
            }

            setUploadProgress(30);

            if (type === "video") {
                await InstructorAPI.uploadVideo(data);
            } else {
                await InstructorAPI.uploadBook(data);
            }

            setUploadProgress(100);
            toast.success(`${type === "video" ? "Video" : "Book"} uploaded successfully`);

            // Reset form
            setFormData({
                title: "",
                description: "",
                author: "",
                category: "",
                language: "en",
                tags: "",
            });
            setFile(null);
            setUploadProgress(0);

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Upload failed");
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {type === "video" ? (
                            <Video className="h-5 w-5" />
                        ) : (
                            <BookOpen className="h-5 w-5" />
                        )}
                        Upload {type === "video" ? "Video" : "Book"}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details and upload your {type === "video" ? "video" : "book"} file
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file">
                            {type === "video" ? "Video" : "Book"} File *
                        </Label>
                        <Input
                            id="file"
                            type="file"
                            accept={type === "video" ? "video/*" : ".pdf,.epub"}
                            onChange={handleFileChange}
                            disabled={uploading}
                            required
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Enter title"
                            disabled={uploading}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Enter description"
                            rows={4}
                            disabled={uploading}
                        />
                    </div>

                    {/* Author - Only for books */}
                    {type === "book" && (
                        <div className="space-y-2">
                            <Label htmlFor="author">Author (optional)</Label>
                            <Input
                                id="author"
                                value={formData.author}
                                onChange={(e) =>
                                    setFormData({ ...formData, author: e.target.value })
                                }
                                placeholder="Enter author name"
                                disabled={uploading}
                            />
                        </div>
                    )}

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                            placeholder="e.g., Mathematics, Science, History"
                            disabled={uploading}
                            required
                        />
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={formData.language}
                            onValueChange={(value) =>
                                setFormData({ ...formData, language: value })
                            }
                            disabled={uploading}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="am">Amharic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData({ ...formData, tags: e.target.value })
                            }
                            placeholder="e.g., tutorial, beginner, advanced"
                            disabled={uploading}
                        />
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <Label>Upload Progress</Label>
                            <Progress value={uploadProgress} />
                            <p className="text-sm text-muted-foreground text-center">
                                {uploadProgress}%
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
