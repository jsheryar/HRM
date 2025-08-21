
"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useAuth } from "@/context/auth-context";

const chartConfig = {
  count: {
    label: "Employees",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function LocationChart() {
    const { employees } = useAuth();
    const stationData = employees.reduce((acc, employee) => {
      const station = employee.station;
      if (!acc[station]) {
        acc[station] = { station, count: 0 };
      }
      acc[station].count++;
      return acc;
    }, {} as Record<string, { station: string, count: number }>);

    const chartData = Object.values(stationData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employees by Station</CardTitle>
                <CardDescription>Distribution of workforce across main stations</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <XAxis dataKey="station" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis />
                          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

    