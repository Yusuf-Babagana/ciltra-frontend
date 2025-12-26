"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiClient } from "@/lib/api-client"
import { authStorage } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Clock, Award, DollarSign, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ExamDetail {
  id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score: number
  price: number
  total_questions: number
  topics: string[]
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [exam, setExam] = useState<ExamDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchExam()
  }, [])

  const fetchExam = async () => {
    try {
      const token = authStorage.getAccessToken()
      const data = await ApiClient.get<ExamDetail>(`/api/exams/${resolvedParams.id}/`, token || undefined)
      setExam(data)
    } catch (err) {
      setError("Failed to load exam details")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/exams/${resolvedParams.id}`)
      return
    }

    setIsPurchasing(true)
    setError("")

    try {
      const token = authStorage.getAccessToken()
      const response = await ApiClient.post<{ payment_url: string }>(
        "/api/payments/initiate/",
        { exam_id: resolvedParams.id },
        token!,
      )

      // In a real implementation, redirect to payment gateway
      window.location.href = response.payment_url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment")
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!exam) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{exam.title}</CardTitle>
                    <CardDescription className="mt-2">{exam.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {exam.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold">Exam Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">{exam.duration_minutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Questions</p>
                        <p className="text-sm text-muted-foreground">{exam.total_questions} questions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Passing Score</p>
                        <p className="text-sm text-muted-foreground">{exam.passing_score}%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Price</p>
                        <p className="text-sm text-muted-foreground">${exam.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {exam.topics && exam.topics.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold">Topics Covered</h3>
                    <ul className="space-y-2">
                      {exam.topics.map((topic, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Register for Exam</CardTitle>
                <CardDescription>Complete payment to access this exam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Exam Fee</span>
                    <span className="text-2xl font-bold">${exam.price}</span>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handlePurchase} disabled={isPurchasing}>
                  {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAuthenticated ? "Proceed to Payment" : "Login to Purchase"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
