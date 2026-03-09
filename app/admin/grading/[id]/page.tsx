"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calculator, Save, CheckCircle, Info } from "lucide-react"
import { toast } from "sonner"

export default function GraderInterface() {
    const { id } = useParams()
    const [session, setSession] = useState<any>(null)
    const [grades, setGrades] = useState<Record<number, number>>({})
    const [comments, setComments] = useState<Record<number, string>>({})

    useEffect(() => {
        fetchSessionData()
    }, [id])

    const fetchSessionData = async () => {
        try {
            const data = await adminAPI.getGradingSession(Number(id))
            setSession(data)
            // Initialize state with existing grades
            const initialGrades: any = {}
            data.answers.forEach((ans: any) => {
                initialGrades[ans.question] = Number(ans.awarded_marks)
            })
            setGrades(initialGrades)
        } catch (err) {
            console.error("Failed to fetch session data", err)
            toast.error("Failed to load grading details")
        }
    }

    // --- CPT WEIGHTED PREVIEW LOGIC ---
    const calculatePreviewScore = () => {
        if (!session) return 0
        // Simplified frontend preview of the backend logic
        const secA = session.score_section_a || 0 // Auto-graded MCQs
        const secB_raw = calculateSectionRaw("Section B")
        const secC_raw = calculateSectionRaw("Section C")

        return (secA * 0.15) + (secB_raw * 0.65) + (secC_raw * 0.20)
    }

    const calculateSectionRaw = (sectionName: string) => {
        const sectionQuestions = session.questions.filter((q: any) => q.section === sectionName)
        const totalPossible = sectionQuestions.reduce((sum: number, q: any) => sum + q.points, 0)
        const totalEarned = sectionQuestions.reduce((sum: number, q: any) => sum + (grades[q.id] || 0), 0)
        return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0
    }

    const handleSubmit = async () => {
        try {
            const payload = Object.keys(grades).map(qId => ({
                question_id: Number(qId),
                marks: grades[Number(qId)],
                comment: comments[Number(qId)] || ""
            }))
            await adminAPI.submitGrades(Number(id), { grades: payload })
            toast.success("Final CPT Grade Published")
        } catch (e) {
            toast.error("Grading failed to sync")
        }
    }

    if (!session) return <div className="p-8 text-center italic text-muted-foreground">Loading exam scripts...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Translation Scripts (Section B) */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold">Practical Translation Assessment</h2>
                {session.questions.filter((q: any) => q.section === "Section B").map((q: any) => (
                    <Card key={q.id} className="border-l-4 border-l-indigo-500">
                        <CardHeader className="bg-slate-50">
                            <CardTitle className="text-sm">Source Text (Section B)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="p-3 bg-slate-100 rounded italic text-sm text-slate-700">{q.text}</div>
                            <Label>Candidate's Translation</Label>
                            <div className="p-4 border rounded bg-white font-serif min-h-[150px] whitespace-pre-wrap">
                                {session.answers.find((a: any) => a.question === q.id)?.text_answer || "No response provided."}
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Awarded Marks (Max: {q.points})</Label>
                                    <Input
                                        type="number"
                                        value={grades[q.id] || 0}
                                        onChange={(e) => setGrades({ ...grades, [q.id]: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Feedback / Rubric Notes</Label>
                                    <Textarea
                                        placeholder="Note accuracy or terminology errors..."
                                        value={comments[q.id] || ""}
                                        onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* RIGHT: CPT Weighted Sidebar */}
            <div className="space-y-6">
                <Card className="sticky top-6">
                    <CardHeader className="bg-indigo-900 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="h-5 w-5" /> Weighted Score Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="text-center">
                            <span className="text-4xl font-black text-indigo-600">{calculatePreviewScore().toFixed(1)}%</span>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Projected Final Grade</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Section A (15%)</span>
                                <Badge variant="outline">{session.score_section_a || 0}%</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Section B (65%)</span>
                                <Badge variant="secondary">{calculateSectionRaw("Section B").toFixed(1)}%</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Section C (20%)</span>
                                <Badge variant="outline">{calculateSectionRaw("Section C").toFixed(1)}%</Badge>
                            </div>
                        </div>

                        <Button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                            <CheckCircle className="mr-2 h-5 w-5" /> Publish Final Result
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
