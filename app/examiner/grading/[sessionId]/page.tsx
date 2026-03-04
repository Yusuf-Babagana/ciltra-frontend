"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { examinerAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// CPT Rubric dimensions with their max marks
const RUBRIC_DIMENSIONS = [
    { key: "accuracy", label: "Accuracy", max: 40 },
    { key: "style", label: "Style", max: 25 },
    { key: "terminology", label: "Terminology", max: 15 },
    { key: "presentation", label: "Presentation", max: 10 },
    { key: "ethics", label: "Ethics", max: 10 },
] as const

type DimensionKey = (typeof RUBRIC_DIMENSIONS)[number]["key"]

interface QuestionGrade {
    accuracy: number
    style: number
    terminology: number
    presentation: number
    ethics: number
    comment: string
}

export default function CPTGradingPage() {
    const { sessionId } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [session, setSession] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Rubric state keyed by question id
    const [grades, setGrades] = useState<Record<string, QuestionGrade>>({})

    useEffect(() => {
        const loadSession = async () => {
            try {
                const data = await examinerAPI.getSession(Number(sessionId))
                setSession(data)

                // Initialize rubric scores for THEORY questions only
                const initialGrades: Record<string, QuestionGrade> = {}
                data.questions
                    .filter((q: any) => q.question_type === "THEORY")
                    .forEach((q: any) => {
                        initialGrades[q.id] = {
                            accuracy: 0,
                            style: 0,
                            terminology: 0,
                            presentation: 0,
                            ethics: 0,
                            comment: "",
                        }
                    })
                setGrades(initialGrades)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load session details.",
                })
            } finally {
                setIsLoading(false)
            }
        }
        loadSession()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId])

    const handleScoreChange = (
        qId: number,
        dimension: DimensionKey,
        value: string,
    ) => {
        const numValue = Math.max(0, parseFloat(value) || 0)
        setGrades((prev) => ({
            ...prev,
            [qId]: { ...prev[qId], [dimension]: numValue },
        }))
    }

    const totalFor = (qId: number) => {
        const g = grades[qId]
        if (!g) return 0
        return g.accuracy + g.style + g.terminology + g.presentation + g.ethics
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const payload = Object.entries(grades).map(([qId, values]) => ({
                question_id: Number(qId),
                ...values,
            }))

            await examinerAPI.submitGrades(Number(sessionId), payload)
            toast({
                title: "Success",
                description: "CPT grades submitted successfully.",
            })
            router.push("/examiner/grading")
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading)
        return (
            <div className="flex justify-center items-center p-20">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            </div>
        )

    if (!session)
        return (
            <div className="p-10 text-center text-muted-foreground">
                Session not found.
            </div>
        )

    const theoryQuestions = session.questions?.filter(
        (q: any) => q.question_type === "THEORY",
    )

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                <div>
                    <Badge variant="outline" className="mb-2 uppercase tracking-wide">
                        CPT Double-Blind Marking
                    </Badge>
                    <h1 className="text-3xl font-bold">
                        Grading Session #{sessionId}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {session.exam?.title}
                        {session.user?.email ? ` — ${session.user.email}` : ""}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 self-start sm:self-auto">
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>
                        Anonymous ID:{" "}
                        <span className="font-mono font-semibold">
                            {String(session.id).padStart(6, "0")}
                        </span>
                    </span>
                </div>
            </div>

            <Separator />

            {/* ── Rubric legend ── */}
            <div className="flex flex-wrap gap-2 text-xs">
                {RUBRIC_DIMENSIONS.map((d) => (
                    <span
                        key={d.key}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border"
                    >
                        {d.label} <span className="font-semibold text-indigo-600">/{d.max}</span>
                    </span>
                ))}
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                    Total /100
                </span>
            </div>

            {/* ── Theory question cards ── */}
            {theoryQuestions?.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                    No theory questions found in this session.
                </p>
            )}

            {theoryQuestions?.map((q: any, index: number) => {
                const answer = session.answers?.find((a: any) => a.question === q.id)
                const runningTotal = totalFor(q.id)

                return (
                    <Card
                        key={q.id}
                        className="border-l-4 border-l-indigo-500 shadow-sm"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start gap-4">
                                <CardTitle className="text-base font-semibold leading-snug">
                                    Task {index + 1}: {q.text}
                                </CardTitle>
                                <Badge
                                    className={
                                        runningTotal >= 70
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : runningTotal >= 50
                                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                    }
                                    variant="outline"
                                >
                                    {runningTotal} / 100
                                </Badge>
                            </div>
                            <CardDescription>
                                Question max: {q.points} pts · CPT rubric total: 100 pts
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {/* Student answer */}
                            <div className="bg-slate-50 border rounded-md p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                                    Student Answer
                                </p>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap italic">
                                    {answer?.text_answer || "No answer provided."}
                                </p>
                            </div>

                            {/* Model answer (if available) */}
                            {q.correct_answer && (
                                <div className="bg-green-50 border border-green-100 rounded-md p-3">
                                    <span className="text-xs font-bold text-green-700 uppercase">
                                        Model Answer:{" "}
                                    </span>
                                    <span className="text-sm text-slate-800">
                                        {q.correct_answer}
                                    </span>
                                </div>
                            )}

                            {/* CPT Rubric inputs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {RUBRIC_DIMENSIONS.map((dim) => (
                                    <div key={dim.key} className="space-y-1.5">
                                        <Label className="text-xs font-medium">
                                            {dim.label}{" "}
                                            <span className="text-muted-foreground">
                                                (0–{dim.max})
                                            </span>
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={dim.max}
                                            placeholder="0"
                                            value={grades[q.id]?.[dim.key] || ""}
                                            onChange={(e) =>
                                                handleScoreChange(q.id, dim.key, e.target.value)
                                            }
                                            className="text-center"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Grader feedback */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Grader Feedback</Label>
                                <Textarea
                                    placeholder="Provide detailed justification for the marks awarded..."
                                    value={grades[q.id]?.comment || ""}
                                    onChange={(e) =>
                                        setGrades((prev) => ({
                                            ...prev,
                                            [q.id]: { ...prev[q.id], comment: e.target.value },
                                        }))
                                    }
                                    className="min-h-[90px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            {/* ── Sticky submit bar ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t shadow-lg p-4 flex justify-center gap-4 z-50">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Submit CPT Final Grade
                </Button>
            </div>
        </div>
    )
}