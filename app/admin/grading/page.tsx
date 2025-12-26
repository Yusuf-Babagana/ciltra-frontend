"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function GradingPage() {
    const [sessions, setSessions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [grades, setGrades] = useState<Record<number, number>>({})
    const [comments, setComments] = useState<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

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

    const handleGradeChange = (questionId: number, value: string) => {
        setGrades(prev => ({ ...prev, [questionId]: parseFloat(value) || 0 }))
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
            toast({ title: "Success", description: "Grades submitted successfully" })
            setSelectedSession(null)
            fetchPending() // Refresh list
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Pending Grading</h1>
                <p className="text-muted-foreground">Review and grade open-ended answers</p>
            </div>

            {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
            ) : sessions.length === 0 ? (
                <Card>
                    <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
                        No pending exams to grade.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {sessions.map(session => (
                        <Card key={session.id}>
                            <CardHeader>
                                <CardTitle>{session.exam.title}</CardTitle>
                                <CardDescription>Candidate: {session.user_email || "User"}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Badge variant="outline">Date: {new Date(session.end_time).toLocaleDateString()}</Badge>
                                    <Badge variant="secondary">Score so far: {session.score}</Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => {
                                            setSelectedSession(session)
                                            setGrades({})
                                            setComments({})
                                        }}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Grade Exam
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Grading: {session.exam.title}</DialogTitle>
                                        </DialogHeader>
                                        
                                        <div className="space-y-6 py-4">
                                            {session.answers
                                                .filter((a: any) => a.question.question_type === 'theory')
                                                .map((answer: any) => (
                                                <div key={answer.id} className="border p-4 rounded-lg bg-slate-50">
                                                    <p className="font-semibold mb-2">{answer.question.text}</p>
                                                    <div className="bg-white p-3 border rounded mb-4 text-sm">
                                                        <span className="text-muted-foreground block text-xs mb-1">Student Answer:</span>
                                                        {answer.text_answer}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Marks (Max: {answer.question.points})</Label>
                                                            <Input 
                                                                type="number" 
                                                                max={answer.question.points}
                                                                onChange={(e) => handleGradeChange(answer.question.id, e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Examiner Comment</Label>
                                                            <Textarea 
                                                                placeholder="Feedback..." 
                                                                onChange={(e) => handleCommentChange(answer.question.id, e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <DialogFooter>
                                            <Button onClick={submitGrades} disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Finalize Grading
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}