"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { examinerAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, FileText, User } from "lucide-react"

export default function ExaminerGradingList() {
    const router = useRouter()
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const data = await examinerAPI.getPendingReviews()
                setSessions(data)
            } catch (error) {
                console.error("Failed to load scripts", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPending()
    }, [])

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto py-10 px-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Pending Grading Queue</h1>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No scripts waiting for review. Good job!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">
                                    {session.exam?.title || "Untitled Exam"}
                                </CardTitle>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    Pending Review
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <User className="w-4 h-4 mr-2" />
                                            Candidate ID: {session.user}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Submitted: {new Date(session.end_time).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Button onClick={() => router.push(`/examiner/grading/${session.id}`)}>
                                        Grade Script
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}