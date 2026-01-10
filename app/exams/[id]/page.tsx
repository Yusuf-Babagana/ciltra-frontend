"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { studentAPI } from "@/lib/api" // UPDATED: Import studentAPI
import { authStorage } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Clock, Award, DollarSign, AlertCircle, CheckCircle, ArrowLeft, PlayCircle } from "lucide-react"
import Link from "next/link"

// UPDATED: Interface to match Backend
interface ExamDetail {
  id: number
  title: string
  description: string
  category_name?: string
  category?: string
  duration_minutes: number
  pass_mark_percentage: number // Backend field
  passing_score?: number // Fallback
  price: number
  total_questions?: number
  // topics: string[] // Backend might not send this yet, handled gracefully below
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [exam, setExam] = useState<ExamDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchExam()
  }, [])

  const fetchExam = async () => {
    try {
      // Fetch list and find exam (since we don't have a public detail endpoint without auth usually)
      // But we can try to fetch details if authenticated, or list if not.
      // For robustness, we will fetch the list and find the item.
      const exams = await studentAPI.getExams()
      const found = exams.find((e: any) => e.id == resolvedParams.id)

      if (found) {
        setExam(found)
      } else {
        setError("Exam not found")
      }
    } catch (err) {
      setError("Failed to load exam details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/exams/${resolvedParams.id}`)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // If price is 0, we just start the exam. 
      // If price > 0, we would ideally initiate payment.
      // For this version, we will assume "Start Exam" creates the session directly.

      if (Number(exam?.price) > 0) {
        // Placeholder for Payment Logic
        // await studentAPI.initiatePayment(...)
        alert("Payment integration coming soon. For now, exams are free to start.")
      }

      // Start the exam session
      const session = await studentAPI.startExam(resolvedParams.id)
      router.push(`/exam-session/${session.id}`)

    } catch (err: any) {
      setError(err.message || "Failed to start exam")
    } finally {
      setIsProcessing(false)
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

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Exam not found"}</AlertDescription>
          </Alert>
          <Button variant="ghost" asChild className="mt-4">
            <Link href="/exams"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams</Link>
          </Button>
        </div>
      </div>
    )
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
                    {exam.category_name || exam.category}
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
                    {exam.total_questions && (
                      <div className="flex items-start gap-3">
                        <Award className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Questions</p>
                          <p className="text-sm text-muted-foreground">{exam.total_questions} questions</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Passing Score</p>
                        <p className="text-sm text-muted-foreground">{exam.pass_mark_percentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Price</p>
                        <p className="text-sm text-muted-foreground">{Number(exam.price) === 0 ? "Free" : `$${exam.price}`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Start Exam</CardTitle>
                <CardDescription>
                  {Number(exam.price) > 0 ? "Complete payment to access this exam" : "You can start this exam immediately"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Exam Fee</span>
                    <span className="text-2xl font-bold">{Number(exam.price) === 0 ? "Free" : `$${exam.price}`}</span>
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
                <Button className="w-full" onClick={handleAction} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAuthenticated
                    ? (Number(exam.price) > 0 ? "Proceed to Payment" : "Start Exam Now")
                    : "Login to Start"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}