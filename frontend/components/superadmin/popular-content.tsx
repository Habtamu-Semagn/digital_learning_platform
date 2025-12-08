import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Book, Eye } from "lucide-react";

interface PopularContentProps {
    popularVideos: any[];
    popularBooks: any[];
}

export function PopularContent({ popularVideos, popularBooks }: PopularContentProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Popular Content</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="videos" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="videos" className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Top Videos
                        </TabsTrigger>
                        <TabsTrigger value="books" className="flex items-center gap-2">
                            <Book className="h-4 w-4" />
                            Top Books
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="videos" className="space-y-4">
                        <div className="space-y-4">
                            {popularVideos.length > 0 ? (
                                popularVideos.map((video, index) => (
                                    <div
                                        key={video._id || index}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 font-bold text-muted-foreground bg-muted rounded-full">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{video.title || "Untitled Video"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Uploaded by: {video.uploadedBy?.name || "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Eye className="h-4 w-4" />
                                            {video.count || 0} views
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No video data available
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="books" className="space-y-4">
                        <div className="space-y-4">
                            {popularBooks.length > 0 ? (
                                popularBooks.map((book, index) => (
                                    <div
                                        key={book._id || index}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 font-bold text-muted-foreground bg-muted rounded-full">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{book.title || "Untitled Book"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Uploaded by: {book.uploadedBy?.name || "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Eye className="h-4 w-4" />
                                            {book.count || 0} views
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No book data available
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
