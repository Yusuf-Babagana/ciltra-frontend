"use client"

import { useState, useEffect, use } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiClient } from "@/lib/api-client"
import { authStorage } from "@/lib/auth"
import { Loader2, Download, Share2, Award, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Certificate {
  id: string
  candidate_name: string
  exam_name: string
  exam_category: string
  issue_date: string
  score: number
  certificate_url?: string
}

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCertificate()
  }, [])

  const fetchCertificate = async () => {
    try {
      const token = authStorage.getAccessToken()
      const data = await ApiClient.get<Certificate>(`/api/certificates/${resolvedParams.id}/`, token!)
      setCertificate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certificate")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/verify?id=${resolvedParams.id}`
    navigator.clipboard.writeText(url)
    alert("Verification link copied to clipboard!")
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !certificate) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container py-12">
            <Alert variant="destructive">
              <AlertDescription>{error || "Certificate not found"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Certificate of Achievement</h1>
              <p className="mt-2 text-muted-foreground">Official certification from CertifyPro</p>
            </div>

            {/* Certificate Preview */}
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-0">
                <div className="border-8 border-primary/10 bg-gradient-to-br from-background to-muted/30 p-12">
                  <div className="space-y-8 text-center">
                    <div className="mx-auto w-20 border-b-4 border-primary"></div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Certificate of Achievement
                      </p>
                      <h2 className="mt-4 text-balance text-4xl font-bold">{certificate.candidate_name}</h2>
                    </div>

                    <div>
                      <p className="text-muted-foreground">has successfully completed and passed the examination</p>
                      <h3 className="mt-2 text-2xl font-bold text-primary">{certificate.exam_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{certificate.exam_category}</p>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-2xl font-bold">{certificate.score}%</p>
                      </div>
                      <div className="h-12 w-px bg-border"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="text-2xl font-bold">
                          {new Date(certificate.issue_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mx-auto w-20 border-b-4 border-primary"></div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>Certificate ID: {certificate.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button asChild className="flex-1">
                <Link href={`/certificates/${certificate.id}/download`}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Link>
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1 bg-transparent">
                <Share2 className="mr-2 h-4 w-4" />
                Share Verification Link
              </Button>
            </div>

            <Alert className="mt-6 border-primary/20 bg-primary/5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Verified Certificate</strong>
                <p className="mt-1 text-sm">
                  This certificate can be verified at any time using the certificate ID or verification link.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
