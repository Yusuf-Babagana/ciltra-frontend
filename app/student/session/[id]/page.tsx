"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea" // Ensure you have this, or use standard <textarea>

export default function ExamSessionPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [session, setSession] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [currentQIndex, setCurrentQIndex] = useState(0)

    // Store answers: { questionId: value }
    // Value is optionId (number) for MCQ, or text (string) for Theory
    const [answers, setAnswers] = useState<Record<number, any>>({})

    const [timeLeft, setTimeLeft] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // 1. Fetch Session Data
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await studentAPI.getSession(Number(id))

                setSession(data)
                setQuestions(data.questions || [])

                // Calculate remaining time
                let remaining = 0
                if (data.time_remaining_seconds !== undefined) {
                    remaining = data.time_remaining_seconds
                } else if (data.start_time) {
                    const start = new Date(data.start_time).getTime()
                    const durationMs = data.duration_minutes * 60 * 1000
                    const end = start + durationMs
                    const now = new Date().getTime()
                    remaining = Math.floor((end - now) / 1000)
                }

                setTimeLeft(remaining > 0 ? remaining : 0)

            } catch (error) {
                console.error("Failed to load session", error)
                toast({ title: "Error", description: "Could not load exam session.", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [id, toast])

    // 2. Timer Logic
    useEffect(() => {
        if (timeLeft <= 0 && !loading && session) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit(true) // Auto-submit
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, loading, session])

    // Helper: Format Time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // 3. Handle Answer Input
    const handleAnswerChange = (questionId: number, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value
        }))
    }

    // 4. Submit Exam (Smart Handling for MCQ vs Theory)
    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !confirm("Are you sure you want to submit? You cannot undo this.")) return

        setSubmitting(true)
        try {
            // Transform answers to match Backend expectation
            const formattedAnswers = questions.map((q) => {
                const ansValue = answers[q.id];
                if (!ansValue) return null; // Skip unanswered

                // Determine payload based on question type
                if (q.question_type === 'mcq') {
                    return {
                        question_id: q.id,
                        selected_option_id: parseInt(ansValue) // Ensure ID is number
                    };
                } else {
                    return {
                        question_id: q.id,
                        text_answer: ansValue // Send text string
                    };
                }
            }).filter(Boolean); // Remove nulls

            await studentAPI.submitExam(Number(id), { answers: formattedAnswers })

            toast({ title: "Success", description: "Exam submitted successfully!" })
            router.push(`/student/results/${id}`)

        } catch (error: any) {
            console.error("Submit error:", error)
            toast({ title: "Error", description: error.message || "Failed to submit exam.", variant: "destructive" })
            setSubmitting(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!session || questions.length === 0) return <div className="p-10 text-center">No questions found for this exam.</div>

    const currentQ = questions[currentQIndex]
    const isTheory = currentQ.question_type === 'theory' || currentQ.question_type === 'essay';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header: Timer & Progress */}
            <div className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h2 className="font-bold text-lg">{session.exam_title}</h2>
                    <p className="text-xs text-muted-foreground">Question {currentQIndex + 1} of {questions.length}</p>
                </div>

                <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-md ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-slate-100'}`}>
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Question Area */}
            <main className="flex-1 container mx-auto max-w-3xl py-8 px-4">
                <Card className={`shadow-md border-t-4 ${isTheory ? 'border-t-orange-500' : 'border-t-indigo-600'}`}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            {/* DYNAMIC POINTS BADGE */}
                            <Badge variant="outline" className={`text-base px-3 py-1 ${isTheory ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
                                Points: {currentQ.points || (isTheory ? 10 : 2)}
                            </Badge>

                            <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                                {isTheory ? "Translation / Theory" : "Multiple Choice"}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl leading-relaxed mt-4">
                            {currentQ.question_text} {/* Renders "Translate this..." or "What is..." */}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {isTheory ? (
                            /* --- THEORY INPUT --- */
                            <div className="space-y-4">
                                <div className="flex gap-2 text-sm text-muted-foreground bg-slate-50 p-3 rounded">
                                    <AlertCircle className="w-4 h-4 mt-0.5" />
                                    <p>Type your translation or answer below. This will be manually reviewed by an examiner.</p>
                                </div>
                                <textarea
                                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Type your answer here..."
                                    value={answers[currentQ.id] || ""}
                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                />
                                <p className="text-xs text-right text-muted-foreground">
                                    {answers[currentQ.id]?.length || 0} characters
                                </p>
                            </div>
                        ) : (
                            /* --- MCQ INPUT --- */
                            currentQ.options && currentQ.options.length > 0 ? (
                                <RadioGroup
                                    value={answers[currentQ.id]?.toString() || ""}
                                    onValueChange={(val) => handleAnswerChange(currentQ.id, parseInt(val))}
                                    className="space-y-3"
                                >
                                    {currentQ.options.map((opt: any) => (
                                        <div key={opt.id} className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${answers[currentQ.id] === opt.id ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                            <RadioGroupItem value={opt.id.toString()} id={`opt-${opt.id}`} />
                                            <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-normal">
                                                {opt.text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded border border-dashed">
                                    No options available for this question.
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQIndex === 0}
                    >
                        Previous
                    </Button>

                    {currentQIndex === questions.length - 1 ? (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSubmit(false)} disabled={submitting}>
                            {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Submit Exam
                        </Button>
                    ) : (
                        <Button onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}>
                            Next Question
                        </Button>
                    )}
                </div>
            </main>
        </div>
    )
}