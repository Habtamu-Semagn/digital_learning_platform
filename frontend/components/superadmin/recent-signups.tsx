import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/api";

interface RecentSignupsProps {
    users: User[];
}

export function RecentSignups({ users }: RecentSignupsProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {users.map((user) => (
                        <div key={user._id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" />
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="ml-auto font-medium text-xs text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                            No recent signups found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
