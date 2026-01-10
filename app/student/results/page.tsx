"use client"

import { useEffect, useState } from "react"
import { studentAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns" // Ensure you have this or use JS Date

export default function ExamHistoryPage() {
    const [attempts, setAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await studentAPI.getExamHistory()
                setAttempts(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">My Exam History</h1>

            {attempts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">You haven't taken any exams yet.</p>
                    <Button className="mt-4" asChild>
                        <Link href="/student/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {attempts.map((attempt: any) => (
                        <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{attempt.exam_title || "Exam Session"}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(attempt.start_time).toLocaleDateString()}
                                        </span>
                                        {attempt.score !== null && (
                                            <span className="font-mono font-bold text-slate-700">
                                                Score: {attempt.score}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Status Badge */}
                                    {!attempt.end_time ? (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                            <Clock className="w-3 h-3 mr-1" /> In Progress
                                        </Badge>
                                    ) : attempt.is_graded ? (
                                        attempt.passed ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Passed
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                                                <XCircle className="w-3 h-3 mr-1" /> Failed
                                            </Badge>
                                        )
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500">
                                            Pending Grading
                                        </Badge>
                                    )}

                                    {/* View Result Button */}
                                    {attempt.end_time && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/student/results/${attempt.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    )}

                                    {/* Resume Button */}
                                    {!attempt.end_time && (
                                        <Button size="sm" asChild>
                                            <Link href={`/student/session/${attempt.id}`}>
                                                Resume
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}