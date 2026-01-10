"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { examinerAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast" // Ensure you have this hook or use alert
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function GradingSessionPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    // "sessionId" matches the folder name [sessionId]
    const sessionId = params.sessionId as string

    const [session, setSession] = useState<any>(null)
    const [grades, setGrades] = useState<Record<number, number>>({})
    const [comments, setComments] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const loadSession = async () => {
            try {
                // Fetch the full session with questions and answers
                const data = await examinerAPI.getSession(sessionId)
                setSession(data)
            } catch (error) {
                console.error("Error loading session", error)
                // alert("Could not load session. It might not exist.")
            } finally {
                setLoading(false)
            }
        }
        loadSession()
    }, [sessionId])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            // Format data for the backend
            const gradePayload = Object.keys(grades).map(questionId => ({
                question_id: Number(questionId),
                marks: grades[Number(questionId)],
                comment: comments[Number(questionId)] || ""
            }))

            await examinerAPI.submitGrades(sessionId, gradePayload)

            toast({ title: "Grading Complete", description: "Scores have been submitted successfully." })
            router.push('/examiner/dashboard')

        } catch (error) {
            toast({ title: "Error", description: "Failed to submit grades.", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!session) return <div className="p-10 text-center">Session not found</div>

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold">{session.exam?.title}</h1>
                <p className="text-muted-foreground">Candidate: {session.user?.first_name || 'Student'} (ID: {session.user?.id})</p>
            </div>

            <div className="space-y-8">
                {session.questions?.map((q: any, index: number) => {
                    // Find the student's answer for this question
                    // Note: You might need to adjust this depending on how your backend returns the nested data
                    // For now, assuming session.answers contains the answer data linked by question_id
                    const answer = session.answers?.find((a: any) => a.question === q.id)

                    return (
                        <Card key={q.id}>
                            <CardHeader className="bg-slate-50/50 pb-2">
                                <CardTitle className="text-base font-medium">
                                    Question {index + 1}: <span className="font-normal text-slate-700">{q.text}</span>
                                </CardTitle>
                                <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">
                                    Type: {q.question_type} • Max Points: {q.points}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Student Answer Display */}
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <span className="text-xs font-bold text-indigo-600 block mb-1">STUDENT ANSWER:</span>
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                        {answer?.text_answer || answer?.selected_option?.text || "No Answer Provided"}
                                    </p>
                                </div>

                                {/* Correct Answer (Reference) */}
                                {q.correct_answer && (
                                    <div className="p-3 bg-green-50 rounded border border-green-100 text-sm">
                                        <span className="font-bold text-green-700">Model Answer: </span>
                                        {q.correct_answer}
                                    </div>
                                )}

                                {/* Grading Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div className="col-span-1">
                                        <Label>Score (0 - {q.points})</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max={q.points}
                                            value={grades[q.id] || ''}
                                            onChange={(e) => setGrades({ ...grades, [q.id]: Number(e.target.value) })}
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Feedback / Comments</Label>
                                        <Textarea
                                            placeholder="Optional feedback..."
                                            value={comments[q.id] || ''}
                                            onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                                            className="mt-1.5 h-10 min-h-[40px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 mt-8 flex justify-end gap-4 shadow-lg">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Finalize Grades
                </Button>
            </div>
        </div>
    )
}