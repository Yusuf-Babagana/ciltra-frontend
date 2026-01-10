"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
// REMOVED: import { ApiClient } from "@/lib/api-client"
import { Loader2, AlertCircle, CheckCircle, XCircle, Award } from "lucide-react"

const verifySchema = z.object({
  certificate_id: z.string().min(1, "Certificate ID is required"),
})

type VerifyForm = z.infer<typeof verifySchema>

interface CertificateData {
  id: string
  candidate_name: string
  exam_name: string
  issue_date: string
  score: number
  valid: boolean
}

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [certificate, setCertificate] = useState<CertificateData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  })

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true)
    setError("")
    setCertificate(null)

    try {
      // UPDATED: Use direct fetch for public verification
      // This allows verification without being logged in
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

      // Note: Backend might expect a query param or a specific URL structure. 
      // Adjusting to a likely standard Django DRF pattern:
      const response = await fetch(`${baseUrl}/certificates/${data.certificate_id}/verify/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        }
      })

      if (!response.ok) {
        throw new Error("Certificate not found or invalid")
      }

      const result = await response.json()

      // Map backend response to interface if needed, or use directly
      setCertificate({
        id: result.certificate_code || result.id,
        candidate_name: result.user_name || result.candidate_name,
        exam_name: result.exam_title || result.exam_name,
        issue_date: result.issued_at || result.issue_date,
        score: result.score,
        valid: true // If we got a successful 200 response, it's valid
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : "Certificate not found")
      setCertificate(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Verify Certificate</h1>
            <p className="mt-4 text-muted-foreground">
              Enter a certificate ID to verify its authenticity and view details
            </p>
          </div>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Certificate Verification</CardTitle>
              <CardDescription>Enter the unique certificate ID found on the certificate document</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="certificate_id">Certificate ID</Label>
                  <Input
                    id="certificate_id"
                    placeholder="CERT-2025-XXXXX"
                    {...register("certificate_id")}
                    disabled={isLoading}
                  />
                  {errors.certificate_id && <p className="text-sm text-destructive">{errors.certificate_id.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Certificate
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {certificate && (
                <div className="mt-6">
                  {certificate.valid ? (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-900 dark:text-green-100">
                        <strong>Valid Certificate</strong>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Candidate:</span>
                            <span>{certificate.candidate_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Examination:</span>
                            <span>{certificate.exam_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Issue Date:</span>
                            <span>{new Date(certificate.issue_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Score:</span>
                            <span>{certificate.score}%</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Invalid Certificate</strong>
                        <p className="mt-2 text-sm">
                          This certificate could not be verified. Please check the ID and try again.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}