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
import { Loader2, AlertCircle, CheckCircle, XCircle, Award } from "lucide-react"
// IMPORT THE API HELPER
import { publicAPI } from "@/lib/api"

const verifySchema = z.object({
  certificate_id: z.string().min(1, "Certificate ID is required"),
})

type VerifyForm = z.infer<typeof verifySchema>

interface CertificateData {
  certificate_code: string
  student_name: string
  exam_title: string
  issued_at: string
  score: number
  is_valid: boolean
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
      // FIX: Use the shared API helper which has the correct URL structure
      // URL: .../api/certificates/verify/CODE/
      const result = await publicAPI.verifyCertificate(data.certificate_id.trim())

      setCertificate(result)

    } catch (err) {
      // If API throws error (404), handle it here
      setError("Certificate not found or invalid. Please check the ID.")
      setCertificate(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Header />

      {/* Background Image */}
      <div className="absolute inset-0 z-0 top-20">
        <img
          src="https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/505180011_1214676324036208_4156852350019206314_n.jpg?_nc_cat=100&_nc_cb=99be929b-f3b7c874&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEbdWqux3AQI3CUmCp32IJSR1yJARlnLNdHXIkBGWcs10t3_56DSa6WvNiY7XpWnImurHmM3XGNDoIS52MdVx1g&_nc_ohc=tz5COX9Bte8Q7kNvwG0ZK5t&_nc_oc=AdnafrQwkK-fvoSuZhwdlFLrglXdQ0yqaGbv93BB4GJ4M633DNQghqIJczYq3iM6m182qzI14p4ogoAEV4-HYupt&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=_US9hIcVh5d1-7ymG4LfZQ&oh=00_Afrk0Dxn9KV6iORGOaDYBBz_5wadL7xnDqs3jJ_0vTGSOQ&oe=696B028A"
          alt="Background"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <main className="container relative z-10 py-20">
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
                    placeholder="CERT-XXXX-XXXX"
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

              {certificate && certificate.is_valid && (
                <div className="mt-6">
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-900 dark:text-green-100">
                      <strong>Valid Certificate</strong>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-medium">Candidate:</span>
                          <span>{certificate.student_name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-medium">Examination:</span>
                          <span>{certificate.exam_title}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-medium">Issue Date:</span>
                          <span>{new Date(certificate.issued_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="font-medium">Score:</span>
                          <span className="font-bold">{certificate.score}%</span>
                        </div>
                        <div className="text-xs text-center mt-4 opacity-75">
                          ID: {certificate.certificate_code}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}