"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminAPI } from "@/lib/api"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash, ArrowLeft, Loader2, Save } from "lucide-react"

export default function QuestionManagementPage() {
    const { id } = useParams()
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        text: "",
        choice_a: "",
        choice_b: "",
        choice_c: "",
        choice_d: "",
        correct_answer: "A",
        points: 1
    })

    const fetchQuestions = async () => {
        try {
            const data = await adminAPI.getQuestions(Number(id))
            setQuestions(data)
        } catch (error) {
            toast.error("Failed to load questions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchQuestions() }, [id])

    const handleSave = async () => {
        try {
            if (editingQuestion) {
                await adminAPI.updateQuestion(editingQuestion.id, formData)
                toast.success("Question updated")
            } else {
                await adminAPI.createQuestion(Number(id), formData)
                toast.success("Question added")
            }
            setIsDialogOpen(false)
            fetchQuestions()
        } catch (e) { toast.error("Error saving question") }
    }

    const startEdit = (q: any) => {
        setEditingQuestion(q)
        setFormData({ ...q })
        setIsDialogOpen(true)
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto py-10 px-4">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
                    <ArrowLeft size={16} /> Back to Exams
                </Button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Manage Questions</h1>
                    <Button onClick={() => { setEditingQuestion(null); setIsDialogOpen(true) }} className="bg-blue-600">
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[50%]">Question Text</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.map((q, index) => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium">
                                        <span className="text-slate-400 mr-2">{index + 1}.</span>
                                        {q.text}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-emerald-100 text-emerald-700">Option {q.correct_answer}</Badge>
                                    </TableCell>
                                    <TableCell>{q.points}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(q)}><Pencil size={14} /></Button>
                                        <Button variant="ghost" size="sm" className="text-red-500"><Trash size={14} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>{editingQuestion ? "Edit" : "Add"} Question</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Question Text</Label>
                            <Textarea value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Option A</Label>
                                <Input value={formData.choice_a} onChange={e => setFormData({ ...formData, choice_a: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Option B</Label>
                                <Input value={formData.choice_b} onChange={e => setFormData({ ...formData, choice_b: e.target.value })} />
                            </div>
                        </div>
                        {/* Repeat for C and D ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Correct Option</Label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={formData.correct_answer}
                                    onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
                                >
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Points</Label>
                                <Input type="number" value={formData.points} onChange={e => setFormData({ ...formData, points: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} className="bg-blue-600 gap-2"><Save size={16} /> Save Question</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}