"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// FIX IMPORT: Use studentAPI instead of ApiClient
import { studentAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { 
  Loader2, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ArrowRight,
  Trophy
} from "lucide-react"

// Define interfaces locally or import from types.ts
interface ExamAttempt {
  id: number
  exam: { title: string }
  status: "pending" | "in_progress" | "completed"
  score?: number
  passed?: boolean
  start_time?: string
  end_time?: string
}

interface Certificate {
  id: string
  certificate_id: string
  exam_title: string
  issued_at: string
  score: number
}

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // FIX: Use studentAPI methods. 
      // Note: We don't need to pass the token manually; apiClient handles it.
      
      const attemptsData = await studentAPI.getExamAttempts()
      setExamAttempts(attemptsData as ExamAttempt[])

      const certsData = await studentAPI.getCertificates()
      setCertificates(certsData as Certificate[])
      
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate Stats
  const completed = examAttempts.filter((a) => a.status === "completed").length
  const inProgress = examAttempts.filter((a) => a.status === "in_progress" || !a.end_time).length
  const passed = examAttempts.filter((a) => a.passed).length

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50/50">
        <Header />

        <main className="container py-10 space-y-8">
          
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {user?.first_name}
              </h1>
              <p className="text-muted-foreground">
                Track your certification progress and achievements.
              </p>
            </div>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              <Link href="/student/exams">
                Browse New Exams <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Quick Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Total Attempts" 
                  value={examAttempts.length} 
                  icon={FileText} 
                  description="All started sessions"
                />
                <StatsCard 
                  title="Certifications" 
                  value={certificates.length} 
                  icon={Trophy} 
                  description="Earned credentials"
                  className="bg-indigo-50 border-indigo-100"
                />
                <StatsCard 
                  title="In Progress" 
                  value={inProgress} 
                  icon={Clock} 
                  description="Incomplete exams"
                />
                <StatsCard 
                  title="Pass Rate" 
                  value={examAttempts.length > 0 ? `${Math.round((passed / examAttempts.length) * 100)}%` : "0%"} 
                  icon={CheckCircle} 
                  description="Success ratio"
                />
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Recent Activity (Main Column) */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
                  {examAttempts.length === 0 ? (
                    <EmptyState 
                      title="No exams taken yet" 
                      description="Start your journey by selecting a certification exam."
                      actionLink="/student/exams"
                      actionText="Browse Exams"
                    />
                  ) : (
                    <div className="space-y-4">
                      {examAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              attempt.status === 'completed' 
                                ? attempt.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {attempt.status === 'completed' 
                                ? (attempt.passed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />)
                                : <Clock className="h-5 w-5" />
                              }
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{attempt.exam?.title || "Unknown Exam"}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{attempt.start_time ? new Date(attempt.start_time).toLocaleDateString() : 'Pending'}</span>
                                <span>•</span>
                                <span className="capitalize">{attempt.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {attempt.status === "completed" && (
                              <Badge variant={attempt.passed ? "default" : "secondary"} className={attempt.passed ? "bg-green-600" : ""}>
                                Score: {attempt.score}%
                              </Badge>
                            )}
                            
                            {attempt.status === "in_progress" && (
                              <Button asChild size="sm" variant="default" className="bg-indigo-600">
                                <Link href={`/student/exam/${attempt.id}`}>Resume</Link>
                              </Button>
                            )}
                            
                            {attempt.status === "completed" && (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/results/${attempt.id}`}>Results</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certificates (Sidebar Column) */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">My Certificates</h2>
                  {certificates.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Award className="h-10 w-10 opacity-20 mb-2" />
                        <p className="text-sm">Complete exams to earn certificates.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {certificates.map((cert) => (
                        <Card key={cert.id} className="overflow-hidden border-l-4 border-l-indigo-500 transition-all hover:border-indigo-600">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium line-clamp-1" title={cert.exam_title}>
                              {cert.exam_title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Issued: {new Date(cert.issued_at).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <Button asChild size="sm" variant="secondary" className="w-full">
                              <Link href={`/certificates/${cert.certificate_id}`}>View Certificate</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}

function StatsCard({ title, value, icon: Icon, description, className }: any) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description, actionLink, actionText }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-4">
        <FileText className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">{description}</p>
      <Button asChild variant="outline">
        <Link href={actionLink}>{actionText}</Link>
      </Button>
    </div>
  )
}