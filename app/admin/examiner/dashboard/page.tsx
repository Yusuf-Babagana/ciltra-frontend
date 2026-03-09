"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileEdit, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ExaminerDashboard() {
    const [stats, setStats] = useState({ pending: 0, graded: 0 })
    const [queue, setQueue] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const sData = await adminAPI.getExaminerStats()
                const qData = await adminAPI.getPendingGrading()
                setStats(sData)
                setQueue(qData)
            } catch (error) {
                console.error("Failed to load dashboard data", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Examiner Portal</h1>
                <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                    Professional Moderator Access
                </Badge>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Scripts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Graded This Month</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.graded || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Grading Queue */}
            <Card className="border-none shadow-sm outline outline-1 outline-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">Grading Queue (Section B & C)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[120px]">Session ID</TableHead>
                                <TableHead>Exam Title</TableHead>
                                <TableHead>Language Pair</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queue.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        No scripts currently pending review.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                queue.map((session: any) => (
                                    <TableRow key={session.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-mono text-xs text-slate-500">#CPT-{session.id.toString().padStart(6, '0')}</TableCell>
                                        <TableCell className="font-medium">{session.exam?.title || session.exam_title || "CPT Exam"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono text-[10px]">
                                                {session.exam?.language_pair_data?.pair_code || session.language_pair || "EN-FR"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {session.end_time ? new Date(session.end_time).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button asChild size="sm" variant="default" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm font-semibold">
                                                <Link href={`/admin/grading/${session.id}`}>
                                                    <FileEdit className="h-3.5 w-3.5 mr-2" /> Grade Script
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
