"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsChartProps {
    title: string;
    data: any[];
    type: "line" | "bar";
    dataKey: string;
    xAxisKey: string;
    description?: string;
}

export function AnalyticsChart({
    title,
    data,
    type,
    dataKey,
    xAxisKey,
    description,
}: AnalyticsChartProps) {
    const ChartComponent = type === "line" ? LineChart : BarChart;
    const DataComponent = type === "line" ? Line : Bar;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <ChartComponent data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <DataComponent
                            type="monotone"
                            dataKey={dataKey}
                            fill="hsl(var(--primary))"
                            stroke="hsl(var(--primary))"
                        />
                    </ChartComponent>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
