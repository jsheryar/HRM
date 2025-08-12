"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { employees } from "@/lib/data";

const locationData = employees.reduce((acc, employee) => {
  const location = employee.location;
  if (!acc[location]) {
    acc[location] = { location, count: 0 };
  }
  acc[location].count++;
  return acc;
}, {} as Record<string, { location: string, count: number }>);

const chartData = Object.values(locationData);

const chartConfig = {
  count: {
    label: "Employees",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function LocationChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Employees by Location</CardTitle>
                <CardDescription>Distribution of workforce across main locations</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <XAxis dataKey="location" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis />
                          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
