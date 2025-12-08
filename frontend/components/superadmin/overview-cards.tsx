import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Book, Building, Activity, Clock } from "lucide-react";
import { AnalyticsOverview } from "@/lib/api";

interface OverviewCardsProps {
    data: AnalyticsOverview["overview"];
}

export function OverviewCards({ data }: OverviewCardsProps) {
    const cards = [
        {
            title: "Total Users",
            value: data.totalUsers,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            borderColor: "border-blue-100 dark:border-blue-900/50",
        },
        {
            title: "Total Videos",
            value: data.totalVideos,
            icon: Video,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20",
            borderColor: "border-red-100 dark:border-red-900/50",
        },
        {
            title: "Total Books",
            value: data.totalBooks,
            icon: Book,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            borderColor: "border-green-100 dark:border-green-900/50",
        },
        {
            title: "Institutions",
            value: data.totalInstitutions,
            icon: Building,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            borderColor: "border-purple-100 dark:border-purple-900/50",
        },
        {
            title: "Total Actions",
            value: data.totalActions,
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            borderColor: "border-orange-100 dark:border-orange-900/50",
        },
        {
            title: "Watch Time (min)",
            value: Math.round(data.totalWatchTime / 60), // Convert seconds to minutes
            icon: Clock,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
            borderColor: "border-indigo-100 dark:border-indigo-900/50",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
                <Card key={card.title} className={`border-l-4 ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
