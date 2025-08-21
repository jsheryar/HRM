"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const activities = [
    { name: "Priya Singh", action: "submitted a leave request.", time: "5 minutes ago", avatar: "PS" },
    { name: "Amit Kumar", action: "was added to the East Zone.", time: "1 hour ago", avatar: "AK" },
    { name: "Sunita Devi", action: "contract renewal is due next month.", time: "3 hours ago", avatar: "SD" },
    { name: "Rohan Kumar", action: "clocked in at Colony 5.", time: "8 hours ago", avatar: "RK" },
    { name: "Anjali Verma", action: "updated her contact information.", time: "1 day ago", avatar: "AV" },
];

export function RecentActivities() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>A log of recent system events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {activities.map((activity, index) => (
                    <div className="flex items-center" key={index}>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                            <AvatarFallback>{activity.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                <span className="font-bold">{activity.name}</span> {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
