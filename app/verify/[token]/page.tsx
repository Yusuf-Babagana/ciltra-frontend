"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Calendar, Globe, Award, Loader2 } from "lucide-react"

export default function PublicVerificationPage() {
    const { token } = useParams()
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Call the public API
        const verifyToken = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                const response = await fetch(`${apiUrl}/api/certificates/verify/${token}/`)
                if (!response.ok) {
                    throw new Error("Credential not found or invalid.")
                }
                const result = await response.json()
                setData(result)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            verifyToken()
        }
    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
                <p className="text-slate-600 font-medium font-serif italic">Verifying Credential with CILTRA Registry...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-t-8 border-red-500 shadow-xl">
                    <CardHeader className="text-center">
                        <Award className="w-16 h-16 text-slate-300 mx-auto mb-2 opacity-50" />
                        <CardTitle className="text-2xl font-bold text-slate-800">Verification Failed</CardTitle>
                        <p className="text-sm text-slate-500">The provided token could not be verified.</p>
                    </CardHeader>
                    <CardContent className="text-center pb-10">
                        <p className="text-slate-600 mb-6">This record may have expired, been revoked, or the link is incorrect.</p>
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 px-4 py-1">INVALID RECORD</Badge>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Card className="max-w-md w-full border-t-8 border-emerald-500 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-32 h-32 text-emerald-900" />
                </div>

                <CardHeader className="text-center pb-2">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full scale-125 opacity-50 animate-pulse"></div>
                        <ShieldCheck className="w-16 h-16 text-emerald-600 relative z-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 font-serif">Credential Verified</CardTitle>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Official CILTRA CPT Record</p>
                </CardHeader>

                <CardContent className="space-y-6 pt-6 relative">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-slate-500 flex items-center gap-2 text-sm font-medium">
                                <Award className="h-4 w-4 text-emerald-500" /> Candidate
                            </span>
                            <span className="font-bold text-slate-900">{data.candidate_name}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-slate-500 flex items-center gap-2 text-sm font-medium">
                                <Globe className="h-4 w-4 text-emerald-500" /> Language Pair
                            </span>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border shadow-none px-3 font-mono">
                                {data.language_pair}
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-slate-500 flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-emerald-500" /> Issue Date
                            </span>
                            <span className="font-semibold text-slate-700">
                                {new Date(data.issue_date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-5 rounded-xl text-emerald-800 text-xs text-center border border-emerald-100/50 leading-relaxed shadow-inner italic">
                        "This digital record confirms that the individual has successfully met the professional translation standards for the Certified Professional Translator (CPT) accreditation."
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-[9px] text-slate-400 font-mono">VERIFICATION HASH: {token.toString().substring(0, 16)}...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
