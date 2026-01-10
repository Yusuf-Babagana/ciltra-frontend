"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle, Download, ArrowLeft, AlertTriangle, Trophy } from "lucide-react"
import Link from "next/link"

export default function ExamResultsPage() {
    const { id } = useParams() // This is the Session ID from the URL
    const router = useRouter()
    const { toast } = useToast()

    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // Fetch result using the session ID (id)
                const data = await studentAPI.getSessionResult(Number(id))
                setResult(data)
            } catch (error: any) {
                console.error("Error fetching result:", error)
                toast({
                    title: "Error",
                    description: "Could not load exam result.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        fetchResult()
    }, [id, toast])

    const handleDownloadCertificate = async () => {
        setDownloading(true)
        try {
            // CRITICAL: Use the session ID (id) directly to generate/download
            const blob = await studentAPI.downloadCertificate(Number(id))

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;

            // Generate a clean filename
            const examName = result?.exam_title?.replace(/\s+/g, '_') || 'Exam'
            link.setAttribute('download', `Certificate_${examName}.pdf`);

            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({ title: "Success", description: "Your certificate is ready!" })
        } catch (error: any) {
            console.error("Download failed:", error)
            toast({
                title: "Download Failed",
                description: "We couldn't generate your certificate. Please contact support.",
                variant: "destructive"
            })
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 animate-pulse">Calculating your score...</p>
        </div>
    )

    if (!result) return (
        <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold">Result Not Found</h2>
            <Button className="mt-4" asChild><Link href="/student/dashboard">Back to Dashboard</Link></Button>
        </div>
    )

    // Robust Passing Logic: Check score against pass mark
    const score = Number(result.score || 0)
    const passMark = Number(result.passing_score || 50)
    const isPassed = score >= passMark

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
                {/* Header Decoration */}
                <div className={`h-2 w-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`} />

                <CardHeader className="pt-8 text-center">
                    <div className="mx-auto mb-4 flex justify-center">
                        {isPassed ? (
                            <div className="bg-green-100 p-4 rounded-full">
                                <Trophy className="w-16 h-16 text-green-600" />
                            </div>
                        ) : (
                            <div className="bg-red-100 p-4 rounded-full">
                                <XCircle className="w-16 h-16 text-red-600" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-slate-900">
                        {isPassed ? "Exam Passed!" : "Not Quite There"}
                    </CardTitle>
                    <p className="text-slate-500 mt-2">
                        {result.exam_title}
                    </p>
                </CardHeader>

                <CardContent className="px-8 pb-8 space-y-6">
                    {/* Score Display */}
                    <div className="flex items-center justify-between bg-slate-100 p-6 rounded-2xl border border-slate-200">
                        <div className="text-left">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Score</p>
                            <p className={`text-4xl font-black ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                {score.toFixed(1)}%
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Required</p>
                            <p className="text-4xl font-black text-slate-400">
                                {passMark}%
                            </p>
                        </div>
                    </div>

                    {isPassed ? (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-start space-x-3 text-sm text-green-800 bg-green-50 p-4 rounded-xl border border-green-100">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p>Excellent work! You have earned your certificate of completion for this course.</p>
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleDownloadCertificate}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-5 w-5" />
                                )}
                                {downloading ? "Preparing PDF..." : "Get Your Certificate"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-start space-x-3 text-sm text-red-800 bg-red-50 p-4 rounded-xl border border-red-100">
                                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p>You didn't reach the passing score this time. Review your notes and try again!</p>
                            </div>
                            <Button variant="outline" className="w-full h-12 font-semibold" asChild>
                                <Link href="/student/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    )}

                    <div className="text-center pt-2">
                        <Link
                            href="/student/dashboard"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors underline-offset-4 hover:underline"
                        >
                            Return to Student Portal
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}