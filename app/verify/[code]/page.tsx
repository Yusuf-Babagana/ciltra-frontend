"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { publicAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AutoVerifyPage() {
    const params = useParams()
    const router = useRouter()
    // 1. Capture the ID from the URL
    const code = params?.code as string

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [data, setData] = useState<any>(null)

    // 2. Automatically trigger verification on load
    useEffect(() => {
        if (code) {
            // Handle URL encoding (e.g., %20 spaces)
            const cleanCode = decodeURIComponent(code).trim()

            publicAPI.verifyCertificate(cleanCode)
                .then(res => {
                    setData(res)
                    setStatus('success')
                })
                .catch(() => setStatus('error'))
        }
    }, [code])

    // 3. Render Success View
    if (status === 'success' && data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md shadow-lg border-green-200">
                    <CardHeader className="text-center bg-green-50/50 pb-2 border-b border-green-100">
                        <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-green-800 text-xl">Certificate Verified</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900">{data.student_name}</h3>
                            <p className="text-muted-foreground">{data.exam_title}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Score Achieved:</span>
                                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{data.score}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Issued On:</span>
                                <span className="font-medium text-slate-700">{new Date(data.issued_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2 mt-2">
                                <span className="text-muted-foreground text-xs">Certificate ID:</span>
                                <span className="font-mono text-xs bg-white border px-1 rounded">{data.certificate_code}</span>
                            </div>
                        </div>

                        <Button className="w-full" onClick={() => router.push('/verify')}>
                            Verify Another Certificate
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 4. Render Error View
    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md border-red-200 shadow-lg">
                    <CardHeader className="text-center bg-red-50/50 pb-2 border-b border-red-100">
                        <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-red-700 text-xl">Invalid Certificate</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6 pt-6">
                        <div className="space-y-2">
                            <p className="text-slate-700 font-medium">
                                We could not verify the certificate with ID:
                            </p>
                            <div className="font-mono text-sm bg-red-50 text-red-800 p-2 rounded border border-red-100 break-all">
                                {code}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                This ID does not exist in our records or may have been revoked.
                            </p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => router.push('/verify')}>
                            Try Manual Search
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 5. Render Loading View (Default)
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse">Verifying Certificate Authenticity...</p>
        </div>
    )
}