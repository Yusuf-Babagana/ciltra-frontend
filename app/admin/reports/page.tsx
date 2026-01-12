"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, PieChart as PieIcon, BarChart as BarIcon } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analytics = await adminAPI.getAnalytics();
                setData(analytics);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics & Reports</h1>
                <p className="text-muted-foreground">Detailed insights into platform performance</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                {/* 1. REGISTRATION TRENDS (Line Chart) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Student Registration Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data?.registrations || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. PASS vs FAIL RATIO (Pie Chart) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-purple-600" />
                            Pass / Fail Ratio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.pass_fail || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.pass_fail?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. EXAM PERFORMANCE (Bar Chart) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarIcon className="h-5 w-5 text-orange-600" />
                        Average Score by Exam
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.performance || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}