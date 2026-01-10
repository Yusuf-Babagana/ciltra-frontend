"use client"

// ... existing imports ...
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Save, Plus, Trash2, Search, Link as LinkIcon } from "lucide-react" // Added LinkIcon

export default function EditExamPage() {
    // ... keep existing state ...
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const examId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [exam, setExam] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [bankQuestions, setBankQuestions] = useState<any[]>([])

    const [formData, setFormData] = useState<any>({})
    const [isSaving, setIsSaving] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [selectedBankIds, setSelectedBankIds] = useState<number[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchData()
    }, [examId])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const allExams = await adminAPI.getExams()
            const foundExam = allExams.find((e: any) => e.id.toString() === examId)

            if (!foundExam) {
                toast({ title: "Error", description: "Exam not found", variant: "destructive" })
                router.push("/admin/exams")
                return
            }

            setExam(foundExam)
            // 1. LOAD PAYMENT LINK HERE
            setFormData({
                title: foundExam.title,
                description: foundExam.description,
                category: foundExam.category,
                price: foundExam.price,
                payment_link: foundExam.payment_link || "", // <--- Add this
                duration_minutes: foundExam.duration_minutes,
                passing_score: foundExam.passing_score
            })

            const allQuestions = await adminAPI.getQuestions()
            const assigned = allQuestions.filter((q: any) => q.exam === parseInt(examId))
            setQuestions(assigned)
            const bank = allQuestions.filter((q: any) => q.exam === null)
            setBankQuestions(bank)

        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await adminAPI.updateExam(examId, formData)
            toast({ title: "Success", description: "Exam updated successfully" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    // ... keep handleAddQuestions, handleRemoveQuestion, toggleQuestionSelection ...
    const handleAddQuestions = async () => {
        if (selectedBankIds.length === 0) return
        try {
            await adminAPI.assignQuestionsToExam(examId, selectedBankIds)
            toast({ title: "Added", description: `${selectedBankIds.length} questions added to exam.` })
            setIsPickerOpen(false)
            setSelectedBankIds([])
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to add questions", variant: "destructive" })
        }
    }

    const handleRemoveQuestion = async (qId: number) => {
        if (!confirm("Remove this question from the exam? It will return to the question bank.")) return
        try {
            await adminAPI.removeQuestionsFromExam(examId, [qId])
            fetchData()
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove question", variant: "destructive" })
        }
    }

    const toggleQuestionSelection = (id: number) => {
        setSelectedBankIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const filteredBankQuestions = bankQuestions.filter(q =>
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Exam</h1>
                    <p className="text-muted-foreground text-sm">{formData.title}</p>
                </div>
            </div>

            <Tabs defaultValue="questions" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="settings">Exam Settings</TabsTrigger>
                    <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                </TabsList>

                {/* --- TAB 1: SETTINGS --- */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>

                                {/* 2. ADD PAYMENT LINK INPUT HERE */}
                                <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4" /> Payment Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Price (NGN)</Label>
                                            <Input type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Paystack Product Link</Label>
                                            <Input
                                                placeholder="https://paystack.shop/..."
                                                value={formData.payment_link || ''}
                                                onChange={e => setFormData({ ...formData, payment_link: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Duration (Min)</Label>
                                        <Input type="number" value={formData.duration_minutes || 60} onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Passing Score (%)</Label>
                                        <Input type="number" value={formData.passing_score || 50} onChange={e => setFormData({ ...formData, passing_score: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <Button type="submit" disabled={isSaving} className="w-full">
                                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB 2: QUESTIONS (UNCHANGED) --- */}
                <TabsContent value="questions" className="space-y-4">
                    {/* ... (Keep your existing Questions Tab content exactly as it was) ... */}
                    <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                        <div>
                            <h3 className="font-semibold">Assigned Questions</h3>
                            <p className="text-sm text-muted-foreground">Total Points: {questions.reduce((sum, q) => sum + (q.points || 0), 0)}</p>
                        </div>
                        <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Add From Bank</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Select Questions from Bank</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Filter questions..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {filteredBankQuestions.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No matching unassigned questions found.</p>
                                        ) : (
                                            filteredBankQuestions.map(q => (
                                                <div key={q.id} className="flex items-start gap-3 p-3 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => toggleQuestionSelection(q.id)}>
                                                    <Checkbox checked={selectedBankIds.includes(q.id)} />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">{q.question_type}</Badge>
                                                            <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                                                            <span className="text-xs text-muted-foreground">{q.points} pts</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <div className="flex justify-between w-full items-center">
                                        <span className="text-sm text-muted-foreground">{selectedBankIds.length} selected</span>
                                        <Button onClick={handleAddQuestions} disabled={selectedBankIds.length === 0}>
                                            Add Selected
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {questions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Search className="h-8 w-8 mb-2 opacity-50" />
                                <p>No questions assigned to this exam yet.</p>
                                <Button variant="link" onClick={() => setIsPickerOpen(true)}>Open Question Picker</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {questions.map((q, index) => (
                                <Card key={q.id} className="group">
                                    <CardContent className="p-4 flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 shrink-0">
                                                {index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-medium">{q.question_text}</p>
                                                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                                    <Badge variant="secondary" className="text-[10px]">{q.question_type}</Badge>
                                                    <span>{q.points} points</span>
                                                    <span>• {q.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveQuestion(q.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}