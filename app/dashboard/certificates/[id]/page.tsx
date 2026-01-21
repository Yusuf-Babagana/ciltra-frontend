"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, CheckCircle, ArrowLeft, XCircle } from "lucide-react"
import { toast } from "sonner"

interface ResultData {
    exam_title: string
    score: number
    passing_score: number
    is_passed: boolean
    is_graded: boolean
    certificate_id: string | null
}

export default function CertificateDetailPage() {
    const { id } = useParams() // This is the Session ID
    const router = useRouter()
    const [data, setData] = useState<ResultData | null>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await studentAPI.getSessionResult(Number(id))
                setData(result)
            } catch (error) {
                toast.error("Could not load certificate details.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const blob = await studentAPI.downloadCertificate(String(id))
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `Ciltra_Certificate_${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success("Certificate downloaded successfully!")
        } catch (err) {
            toast.error("Failed to generate PDF. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="container max-w-lg py-12">
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        )
    }

    if (!data) return <div className="text-center py-12">Certificate not found.</div>

    // If failed, show restricted view
    if (!data.is_passed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <XCircle className="h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold text-slate-800">Certificate Unavailable</h1>
                <p className="text-slate-500 max-w-md text-center">
                    Unfortunately, you scored <strong>{data.score}%</strong>. The passing mark required is <strong>{data.passing_score}%</strong>.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50/50 p-4">
            <div className="w-full max-w-2xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>

                <Card className="border-2 border-indigo-100 shadow-xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white">
                        <CheckCircle className="mx-auto h-12 w-12 mb-4 text-indigo-100" />
                        <h1 className="text-3xl font-bold tracking-tight">Certificate of Achievement</h1>
                        <p className="text-indigo-100 mt-2">Official Digital Record</p>
                    </div>

                    <CardContent className="space-y-8 p-8 text-center">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground uppercase tracking-widest">This certifies that you have passed</p>
                            <h2 className="text-2xl font-bold text-slate-900">{data.exam_title}</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-y py-6 bg-slate-50/50">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Score</p>
                                <p className="text-xl font-bold text-indigo-600">{data.score}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Status</p>
                                <Badge className="bg-green-600 hover:bg-green-700 mt-1">PASSED</Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">ID</p>
                                <p className="text-sm font-mono mt-1 text-slate-700">
                                    {data.certificate_id ? `#${data.certificate_id.slice(0, 8)}` : "Generating..."}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500">
                            A high-resolution PDF version of this certificate, including a verification QR code,
                            is available for download below.
                        </p>
                    </CardContent>

                    <CardFooter className="bg-slate-50 p-6 flex justify-center">
                        <Button
                            onClick={handleDownload}
                            size="lg"
                            disabled={downloading}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                        >
                            {downloading ? (
                                "Generating PDF..."
                            ) : (
                                <>
                                    <Download className="mr-2 h-5 w-5" /> Download Official PDF
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}