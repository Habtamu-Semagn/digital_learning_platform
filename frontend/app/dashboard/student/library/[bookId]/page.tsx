"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Download, Eye, ExternalLink, FileText, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = params.bookId as string;

    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBook();
    }, [bookId]);

    const fetchBook = async () => {
        try {
            setLoading(true);
            const data = await StudentAPI.getBook(bookId);
            setBook(data);
        } catch (error: any) {
            console.error("Failed to fetch book:", error);
            toast.error(error.message || "Failed to load book");
            router.push("/dashboard/student/library");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (book?.fileUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            window.open(`${baseUrl}/${book.fileUrl}`, '_blank');
            toast.success("Download started!");
        }
    };

    const handleView = () => {
        if (book?.fileUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            window.open(`${baseUrl}/${book.fileUrl}`, '_blank');
        }
    };

    const formatFileSize = (bytes: number) => {
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const getFileType = (mimeType: string) => {
        if (mimeType?.includes('pdf')) return 'PDF';
        if (mimeType?.includes('epub')) return 'ePub';
        return 'Document';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!book) {
        return <div>Book not found</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Book Cover/Preview */}
                <Card className="md:col-span-1">
                    <CardContent className="p-6">
                        <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <BookOpen className="h-24 w-24 text-muted-foreground" />
                        </div>
                        <div className="space-y-3">
                            <Button className="w-full" onClick={handleView}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Book
                            </Button>
                            <Button variant="outline" className="w-full" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Book Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="capitalize">
                                        {book.category || 'General'}
                                    </Badge>
                                    <Badge variant="outline">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {getFileType(book.mimeType)}
                                    </Badge>
                                </div>
                                <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
                                {book.author && (
                                    <CardDescription className="text-base">
                                        by {book.author}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description */}
                        {book.description && (
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {book.description}
                                </p>
                            </div>
                        )}

                        <Separator />

                        {/* Book Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Book Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">File Size:</span>{' '}
                                        <span className="font-medium">{formatFileSize(book.fileSize)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Language:</span>{' '}
                                        <span className="font-medium capitalize">{book.language || 'English'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Uploaded:</span>{' '}
                                        <span className="font-medium">
                                            {new Date(book.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Statistics</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                        <span>{book.views || 0} views</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        <span>{book.downloads || 0} downloads</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{book.uploadedBy?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {book.tags && book.tags.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {book.tags.map((tag: string) => (
                                            <Badge key={tag} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* File Details */}
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-2">File Details</h3>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                <div>
                                    <span>Original filename:</span>{' '}
                                    <span className="font-mono text-xs">{book.originalName || book.filename}</span>
                                </div>
                                <div>
                                    <span>MIME type:</span>{' '}
                                    <span className="font-mono text-xs">{book.mimeType}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Read Online</CardTitle>
                        <CardDescription>
                            Open this book in your browser for immediate reading
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={handleView}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Open in Browser
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Download for Offline</CardTitle>
                        <CardDescription>
                            Save this book to your device for offline access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Book
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
