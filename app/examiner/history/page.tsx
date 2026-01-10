"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { examinerAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, CheckCircle, Calendar } from "lucide-react"

export default function GradingHistoryPage() {
    const router = useRouter()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await examinerAPI.getGradedHistory()
                setHistory(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        loadHistory()
    }, [])

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto py-10 px-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Grading History</h1>
            </div>

            <div className="grid gap-4">
                {history.map((session) => (
                    <Card key={session.id} className="opacity-75 hover:opacity-100 transition-opacity">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">
                                {session.exam?.title}
                            </CardTitle>
                            <Badge className={session.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                Score: {session.score}%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span>Candidate ID: {session.user}</span>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(session.end_time).toLocaleDateString()}
                                    </span>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/examiner/grading/${session.id}`)}>
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}