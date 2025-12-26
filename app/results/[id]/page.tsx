"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api" // <--- FIX: Correct Import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Award, Home, ArrowRight, Download } from "lucide-react"
import Link from "next/link"

interface ExamSession {
  id: number
  exam: {
    title: string
    pass_mark_percentage: number
  }
  score: number
  passed: boolean
  end_time: string
  is_graded: boolean
}

export default function ExamResultsPage() {
  const { id } = useParams()
  const [session, setSession] = useState<ExamSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await studentAPI.getSession(id as string)
        setSession(data)
      } catch (error) {
        console.error("Failed to load results", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card>
          <CardHeader><CardTitle>Result Not Found</CardTitle></CardHeader>
          <CardContent><p>We couldn't find the results for this exam session.</p></CardContent>
          <CardFooter>
            <Button asChild><Link href="/student/dashboard">Go Dashboard</Link></Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <Card className="max-w-lg w-full shadow-lg border-t-4 border-t-indigo-600">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{session.exam.title}</CardTitle>
          <CardDescription>Exam Results</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Score Badge */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full ${session.passed ? "bg-green-100" : "bg-red-100"}`}>
              {session.passed ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            
            <div className="text-center">
              <h2 className={`text-3xl font-bold ${session.passed ? "text-green-700" : "text-red-700"}`}>
                {session.passed ? "Congratulations!" : "Keep Practicing"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {session.passed 
                  ? "You have successfully passed this certification exam." 
                  : "Unfortunately, you did not meet the passing criteria."}
              </p>
            </div>
          </div>

          {/* Score Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Your Score</span>
              <span>{session.score}%</span>
            </div>
            <Progress 
              value={session.score} 
              className={`h-3 ${session.passed ? "bg-green-100" : "bg-red-100"}`} 
              // Note: You might need to customize the indicator color in your global CSS or via utility classes if standard shadcn component doesn't expose color prop directly
            />
            <p className="text-xs text-right text-muted-foreground">Pass Mark: {session.exam.pass_mark_percentage}%</p>
          </div>

          {/* Pending Grading Alert */}
          {!session.is_graded && (
            <Alert className="bg-amber-50 border-amber-200">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <AlertTitle className="text-amber-800">Grading In Progress</AlertTitle>
              <AlertDescription className="text-amber-700">
                Some questions (theory) are still pending manual review. Your score may increase once grading is complete.
              </AlertDescription>
            </Alert>
          )}

        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          {session.passed && (
             <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
               <Link href="/student/dashboard">
                 <Award className="mr-2 h-4 w-4" /> View Certificate
               </Link>
             </Button>
          )}
          
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/student/dashboard">
                <Home className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/student/exams">
                Try Another <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}