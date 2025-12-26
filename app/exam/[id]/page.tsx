"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ExamRoomPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const examId = params.id as string

    // State
    const [isLoading, setIsLoading] = useState(true)
    const [session, setSession] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({}) // { questionId: "answer" }
    const [timeLeft, setTimeLeft] = useState(0) // in seconds
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 1. Start Exam on Mount
    useEffect(() => {
        const start = async () => {
            try {
                const data = await studentAPI.startExam(examId)
                setSession(data)
                setQuestions(data.questions)
                setTimeLeft(data.time_remaining_seconds)
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" })
                router.push("/dashboard") // Redirect back if error
            } finally {
                setIsLoading(false)
            }
        }
        start()
    }, [examId])

    // 2. Timer Logic
    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit() // Auto-submit when time is up
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    // Helper: Format Time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    // Helper: Handle Answer Selection
    const handleAnswer = (val: string) => {
        const currentQ = questions[currentQIndex]
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }))
    }

    // 3. Submit Logic
    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Convert state object to array for backend
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
                question_id: parseInt(qId),
                answer: val
            }))

            await studentAPI.submitExam(session.id, formattedAnswers)
            
            toast({ title: "Completed", description: "Exam submitted successfully!" })
            router.push("/dashboard/results") // Redirect to results
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to submit exam", variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>

    const currentQ = questions[currentQIndex]
    const progress = ((currentQIndex + 1) / questions.length) * 100

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header: Timer & Progress */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                    <div className="space-y-1">
                        <h2 className="font-bold text-lg">Question {currentQIndex + 1} of {questions.length}</h2>
                        <Progress value={progress} className="w-32 h-2" />
                    </div>
                    <div className={`flex items-center gap-2 text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-slate-700'}`}>
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Card */}
                <Card className="min-h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl leading-relaxed">
                            {currentQ.question_text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {currentQ.question_type === 'mcq' ? (
                            <RadioGroup 
                                value={answers[currentQ.id] || ""} 
                                onValueChange={handleAnswer}
                                className="space-y-3"
                            >
                                {currentQ.options_data?.map((opt: any) => (
                                    <div key={opt.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value={opt.text} id={`opt-${opt.id}`} />
                                        <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer">{opt.text}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <Textarea 
                                placeholder="Type your answer here..." 
                                className="min-h-[200px] text-lg"
                                value={answers[currentQ.id] || ""}
                                onChange={(e) => handleAnswer(e.target.value)}
                            />
                        )}
                    </CardContent>
                    
                    {/* Navigation Footer */}
                    <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                        >
                            Previous
                        </Button>

                        {currentQIndex === questions.length - 1 ? (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Exam
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            >
                                Next Question
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Quick Navigation Grid (Optional) */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQIndex(idx)}
                            className={`h-8 w-8 rounded text-xs font-bold border transition-colors
                                ${idx === currentQIndex ? 'bg-primary text-white border-primary' : 
                                  answers[questions[idx].id] ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-slate-500'}
                            `}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}