"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, FileText, ArrowRight, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function GradingPage() {
    const [sessions, setSessions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Detailed Grading State
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [grades, setGrades] = useState<Record<number, number>>({})
    const [comments, setComments] = useState<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        try {
            const data = await adminAPI.getPendingGrading()
            setSessions(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenGrading = async (sessionId: number) => {
        setIsLoadingDetails(true)
        setIsOpen(true)
        try {
            const data = await adminAPI.getGradingSession(sessionId)
            setSelectedSession(data)

            // Initialize existing marks
            const initialGrades: any = {}
            data.answers.forEach((ans: any) => {
                if (ans.awarded_marks > 0) initialGrades[ans.question] = ans.awarded_marks
            })
            setGrades(initialGrades)
        } catch (e) {
            toast.error("Could not load session details")
            setIsOpen(false)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const handleGradeChange = (questionId: number, value: string) => {
        const val = parseFloat(value)
        setGrades(prev => ({ ...prev, [questionId]: isNaN(val) ? 0 : val }))
    }

    const handleCommentChange = (questionId: number, value: string) => {
        setComments(prev => ({ ...prev, [questionId]: value }))
    }

    const submitGrades = async () => {
        if (!selectedSession) return
        setIsSubmitting(true)

        const payload = Object.entries(grades).map(([qId, marks]) => ({
            question_id: parseInt(qId),
            marks: marks,
            comment: comments[parseInt(qId)] || ""
        }))

        try {
            await adminAPI.submitGrades(selectedSession.id, payload)
            toast.success("Grades submitted successfully")
            setIsOpen(false)
            setSelectedSession(null)
            fetchPending()
        } catch (error: any) {
            toast.error(error.message || "Failed to submit")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStudentAnswer = (questionId: number) => {
        if (!selectedSession) return null
        return selectedSession.answers.find((a: any) => a.question === questionId)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pending Grading</h1>
                <p className="text-muted-foreground">Review translations and essay answers.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : sessions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                        <CheckCircle className="h-10 w-10 mb-2 text-green-500" />
                        <p>All caught up! No pending exams.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map(session => (
                        <Card key={session.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="truncate">{session.exam.title}</CardTitle>
                                <CardDescription>Candidate: <span className="font-medium text-foreground">{session.user_email}</span></CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <Badge variant="outline">{new Date(session.end_time).toLocaleDateString()}</Badge>
                                    <Badge variant="secondary">Auto Score: {session.score}%</Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleOpenGrading(session.id)}>
                                    <FileText className="mr-2 h-4 w-4" /> Grade Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Grading Assessment: {selectedSession?.exam?.title}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6 bg-slate-50/50 p-4 rounded-md">
                        {isLoadingDetails ? (
                            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                        ) : selectedSession ? (
                            selectedSession.questions
                                // --- FIX: CASE INSENSITIVE CHECK ---
                                .filter((q: any) => q.question_type.toLowerCase() === 'theory')
                                .map((question: any, index: number) => {
                                    const answer = getStudentAnswer(question.id)
                                    return (
                                        <div key={question.id} className="bg-white border shadow-sm rounded-lg overflow-hidden">
                                            {/* Header Bar */}
                                            <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default" className="bg-slate-800">Q{index + 1}</Badge>
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Translation / Essay</span>
                                                </div>
                                                <Badge variant="outline" className="bg-white">Max Marks: {question.points}</Badge>
                                            </div>

                                            <div className="p-4 grid md:grid-cols-2 gap-6">
                                                {/* Left Column: Source/Question */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground uppercase font-bold">Source Text / Question</Label>
                                                    <div className="p-3 bg-slate-50 border rounded-md text-slate-800 text-sm leading-relaxed min-h-[80px]">
                                                        {question.text}
                                                    </div>
                                                </div>

                                                {/* Right Column: Student Answer */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-blue-600 uppercase font-bold flex items-center gap-1">
                                                        <ArrowRight className="h-3 w-3" /> Student Translation
                                                    </Label>
                                                    <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-md text-slate-900 text-sm leading-relaxed min-h-[80px]">
                                                        {answer?.text_answer || <span className="text-muted-foreground italic flex items-center gap-1"><AlertCircle className="h-3 w-3" /> No answer provided.</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer: Grading Inputs */}
                                            <div className="bg-slate-50/50 p-4 border-t flex flex-col md:flex-row gap-4 items-end">
                                                <div className="w-full md:w-32 space-y-1">
                                                    <Label className="text-xs">Score Awarded</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={question.points}
                                                            className="pr-12 font-bold"
                                                            value={grades[question.id] ?? ''}
                                                            onChange={(e) => handleGradeChange(question.id, e.target.value)}
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">/ {question.points}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full flex-1 space-y-1">
                                                    <Label className="text-xs">Examiner Feedback</Label>
                                                    <Input
                                                        placeholder="e.g. Accurate terminology, good grammar..."
                                                        value={comments[question.id] || ''}
                                                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                        ) : null}

                        {/* Empty State if no theory questions found */}
                        {selectedSession && selectedSession.questions.filter((q: any) => q.question_type.toLowerCase() === 'theory').length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                <p>No theory questions found in this exam.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t bg-white z-10">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={submitGrades} disabled={isSubmitting || isLoadingDetails}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit & Finalize
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}