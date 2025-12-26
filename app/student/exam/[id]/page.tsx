"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Timer, AlertCircle, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

interface Question {
  id: number
  text: string
  question_type: "MCQ" | "THEORY"
  options: { id: number; text: string }[]
}

interface ExamSession {
  id: number
  exam: {
    title: string
    duration_minutes: number
    questions: Question[]
  }
  start_time: string
  end_time?: string
}

export default function ExamPage() {
  const { id } = useParams() // This is the Session ID
  const router = useRouter()
  const { toast } = useToast()

  const [session, setSession] = useState<ExamSession | null>(null)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Fetch Session Data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await studentAPI.getSession(id as string)
        setSession(data)
        
        // Calculate remaining time
        if (data.start_time) {
          const startTime = new Date(data.start_time).getTime()
          const durationMs = data.exam.duration_minutes * 60 * 1000
          const endTime = startTime + durationMs
          const now = new Date().getTime()
          const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000))
          setTimeLeft(remainingSeconds)
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load exam session", variant: "destructive" })
        router.push("/student/dashboard")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSession()
  }, [id, router, toast])

  // 2. Timer Logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAutoSubmit = () => {
    toast({ title: "Time's up!", description: "Submitting your exam automatically." })
    handleSubmit()
  }

  // 3. Handle Answer Selection
  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }))
  }

  // 4. Submit Exam
  const handleSubmit = async () => {
    if (!session || isSubmitting) return
    setIsSubmitting(true)

    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
      const question = session.exam.questions.find(q => q.id === Number(qId))
      if (question?.question_type === "MCQ") {
        return { question_id: Number(qId), selected_option_id: Number(val) }
      } else {
        return { question_id: Number(qId), text_answer: val }
      }
    })

    try {
      await studentAPI.submitExam(session.id, formattedAnswers)
      toast({ title: "Success", description: "Exam submitted successfully!" })
      router.push(`/results/${session.id}`)
    } catch (error) {
      toast({ title: "Submission Failed", description: "Please try again.", variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  const currentQuestion = session.exam.questions[currentQIndex]
  const progress = Math.round(((currentQIndex + 1) / session.exam.questions.length) * 100)

  // Format Time Display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{session.exam.title}</h1>
          <p className="text-xs text-muted-foreground">Question {currentQIndex + 1} of {session.exam.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${Number(timeLeft) < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          <Timer className="w-4 h-4" />
          {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
        </div>
      </header>

      <main className="flex-1 container max-w-4xl py-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* Question Area */}
        <div className="flex-1">
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
               <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Question {currentQIndex + 1}</span>
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{currentQuestion.question_type}</span>
               </div>
               <CardTitle className="text-xl mt-2 leading-relaxed">
                 {currentQuestion.text}
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              {currentQuestion.question_type === "MCQ" ? (
                <RadioGroup 
                  value={answers[currentQuestion.id]?.toString() || ""} 
                  onValueChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                  className="space-y-4"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className={`flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer ${answers[currentQuestion.id] == option.id ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}>
                      <RadioGroupItem value={option.id.toString()} id={`opt-${option.id}`} />
                      <Label htmlFor={`opt-${option.id}`} className="flex-1 cursor-pointer font-normal text-base">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea 
                  placeholder="Type your answer here..." 
                  className="min-h-[200px] text-base resize-none"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            
            {currentQIndex === session.exam.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Submit Exam
              </Button>
            ) : (
              <Button onClick={() => setCurrentQIndex(prev => Math.min(session.exam.questions.length - 1, prev + 1))}>
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar / Question Palette */}
        <div className="w-full md:w-64 space-y-4">
           <Card>
             <CardHeader className="pb-3"><CardTitle className="text-sm">Question Palette</CardTitle></CardHeader>
             <CardContent>
               <div className="grid grid-cols-5 gap-2">
                 {session.exam.questions.map((q, idx) => (
                   <button
                     key={q.id}
                     onClick={() => setCurrentQIndex(idx)}
                     className={`h-8 w-8 rounded text-xs font-medium transition-colors 
                       ${currentQIndex === idx ? 'ring-2 ring-primary ring-offset-1' : ''}
                       ${answers[q.id] ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                     `}
                   >
                     {idx + 1}
                   </button>
                 ))}
               </div>
             </CardContent>
           </Card>
           
           <Alert className="bg-amber-50 border-amber-200">
             <AlertCircle className="h-4 w-4 text-amber-600" />
             <AlertTitle className="text-amber-800">Note</AlertTitle>
             <AlertDescription className="text-amber-700 text-xs">
               Ensure you have answered all questions before submitting. Unanswered questions will be marked as zero.
             </AlertDescription>
           </Alert>
        </div>

      </main>
    </div>
  )
}