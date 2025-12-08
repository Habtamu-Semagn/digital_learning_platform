import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Users, Star, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
    course: any;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onView?: (id: string) => void;
}

export function CourseCard({ course, onEdit, onDelete, onView }: CourseCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "bg-green-500";
            case "draft":
                return "bg-yellow-500";
            case "archived":
                return "bg-gray-500";
            default:
                return "bg-blue-500";
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
                        {course.title?.charAt(0) || "C"}
                    </div>
                )}
                <Badge
                    className={`absolute top-2 right-2 ${getStatusColor(course.status)}`}
                >
                    {course.status || "draft"}
                </Badge>
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onView && (
                                <DropdownMenuItem onClick={() => onView(course._id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                            )}
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(course._id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(course._id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {course.description}
                </p>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledStudents || 0} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.averageRating?.toFixed(1) || "0.0"}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span>{course.lessons?.length || 0} lessons</span>
                    <span>
                        Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}
