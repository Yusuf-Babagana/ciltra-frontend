"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileEdit, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ExaminerDashboard() {
    const [queue, setQueue] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const data = await adminAPI.getPendingGrading()
                setQueue(data)
            } catch (error) {
                console.error("Failed to fetch grading queue", error)
            } finally {
                setLoading(false)
            }
        }
        fetchQueue()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Examiner Queue</h1>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 font-bold">
                        {queue.length} Pending Scripts
                    </Badge>
                </div>
            </div>

            <Card className="border-none shadow-sm outline outline-1 outline-slate-200 overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="py-4 px-6">Candidate ID</TableHead>
                                <TableHead className="py-4">Language Pair</TableHead>
                                <TableHead className="py-4">Submission Time</TableHead>
                                <TableHead className="text-right px-6 py-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queue.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-20 text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle className="h-8 w-8 text-emerald-500/50" />
                                            <p className="font-medium text-lg text-slate-400">All caught up!</p>
                                            <p className="text-sm">There are no scripts waiting for review.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                queue.map((session: any) => (
                                    <TableRow key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-mono text-xs text-slate-500 py-4 px-6">
                                            #CPT-{session.id.toString().padStart(5, '0')}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 border shadow-none px-3 py-1 font-semibold">
                                                {session.exam?.language_pair_data?.pair_code || session.language_pair || "EN-FR"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                {session.end_time ? new Date(session.end_time).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-4">
                                            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold px-4">
                                                <Link href={`/admin/grading/${session.id}`}>
                                                    <FileEdit className="mr-2 h-4 w-4" /> Grade Script
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
