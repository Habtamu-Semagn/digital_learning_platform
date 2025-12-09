"use client";

import { useEffect, useState } from "react";
import { StudentAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Megaphone, Calendar, Pin, User } from "lucide-react";
import { toast } from "sonner";

export default function StudentAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await StudentAPI.getAnnouncements();
            setAnnouncements(data || []);
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">
                        Updates and news from your instructors
                    </p>
                </div>
            </div>

            {announcements.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Megaphone className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-semibold">No announcements yet</p>
                        <p className="text-sm">Check back later for updates from your courses.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {announcements.map((announcement) => (
                        <Card key={announcement._id} className={announcement.pinned ? "border-primary/50 bg-primary/5" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="flex items-center gap-2">
                                                {announcement.pinned && <Pin className="h-4 w-4 text-primary fill-current" />}
                                                {announcement.title}
                                            </CardTitle>
                                            {announcement.priority === "urgent" && (
                                                <Badge variant="destructive" className="h-5 text-[10px] px-1.5 uppercase">Urgent</Badge>
                                            )}
                                            {announcement.priority === "important" && (
                                                <Badge className="h-5 text-[10px] px-1.5 uppercase bg-orange-500 hover:bg-orange-600">Important</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {announcement.course?.title}
                                            </Badge>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span>{announcement.instructor?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {announcement.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
