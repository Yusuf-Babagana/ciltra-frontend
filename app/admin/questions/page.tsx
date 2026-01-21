"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, Search, BookOpen, CheckCircle, HelpCircle } from "lucide-react"

export default function QuestionsPage() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    exam_id: "",
    text: "",
    question_type: "mcq", // 'mcq' or 'theory'
    points: 2,
    options: ["", "", "", ""], // For MCQ
    correct_option_index: 0,   // For MCQ
    correct_answer_text: ""    // For Theory (Reference)
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [qData, eData] = await Promise.all([
        adminAPI.getQuestions(),
        adminAPI.getExams()
      ])
      setQuestions(qData)
      setExams(eData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload: any = {
        exam: formData.exam_id, // This sends the ID to the backend
        question_text: formData.text,
        question_type: formData.question_type,
        points: formData.points,
      }

      if (formData.question_type === 'mcq') {
        // Send options as a list of strings
        payload.options = formData.options.filter(o => o.trim() !== "")
        // The backend expects the text of the correct answer
        payload.correct_answer = formData.options[formData.correct_option_index]
      } else {
        // Theory
        payload.correct_answer = formData.correct_answer_text
      }

      await adminAPI.createQuestion(payload)
      toast({ title: "Success", description: "Question added successfully" })
      setIsDialogOpen(false)
      fetchData() // Refresh list

      // Reset critical form fields (keep exam_id for convenience)
      setFormData(prev => ({
        ...prev,
        text: "",
        options: ["", "", "", ""],
        correct_answer_text: ""
      }))

    } catch (e) {
      toast({ title: "Error", description: "Failed to create question", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question?")) return
    try {
      await adminAPI.deleteQuestion(id)
      setQuestions(questions.filter(q => q.id !== id))
      toast({ title: "Deleted", description: "Question removed" })
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete" })
    }
  }

  // Update a specific option text in the array
  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = val
    setFormData({ ...formData, options: newOptions })
  }

  const filtered = questions.filter(q =>
    q.question_text.toLowerCase().includes(search.toLowerCase()) ||
    (q.exam_title || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">Manage MCQs, Theory, and Translations.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="flex items-center py-4 bg-white p-4 rounded-lg border">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 focus-visible:ring-0" />
      </div>

      <div className="grid gap-4">
        {filtered.map((q) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Badge variant="outline">{q.exam_title || "Unassigned"}</Badge>
                <div className="flex gap-2">
                  <Badge className={q.question_type === 'mcq' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                    {q.question_type.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">{q.points} Pts</Badge>
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{q.question_text}</CardTitle>
            </CardHeader>
            <CardContent>
              {q.question_type === 'mcq' ? (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {q.options.map((opt: any) => (
                    <div key={opt.id} className={`flex items-center gap-2 ${opt.is_correct ? "text-green-600 font-bold" : ""}`}>
                      {opt.is_correct ? <CheckCircle className="h-4 w-4" /> : <div className="w-4" />}
                      {opt.text}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Reference Answer: {q.correct_answer || "None provided"}</p>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(q.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- CREATE DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Select Exam</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, exam_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose an exam..." /></SelectTrigger>
                  <SelectContent>
                    {exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Question Type</Label>
                <Select defaultValue="mcq" onValueChange={(v) => setFormData({ ...formData, question_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="theory">Theory / Essay / Translation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Question Text</Label>
              <Textarea
                placeholder="e.g. Translate 'Hello' to French..."
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Points / Marks</Label>
              <Input
                type="number"
                value={formData.points}
                onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
              />
            </div>

            {/* CONDITIONAL: MCQ Options */}
            {formData.question_type === 'mcq' && (
              <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
                <Label className="font-bold">Answers Options (Select the correct one)</Label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct_opt"
                      className="w-4 h-4"
                      checked={formData.correct_option_index === idx}
                      onChange={() => setFormData({ ...formData, correct_option_index: idx })}
                    />
                    <Input
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="bg-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* CONDITIONAL: Theory Answer */}
            {formData.question_type === 'theory' && (
              <div className="grid gap-2 border p-4 rounded-lg bg-purple-50">
                <Label className="text-purple-900 font-bold">Grading Reference (Optional)</Label>
                <Textarea
                  placeholder="Write the correct answer here to help the grader later..."
                  className="bg-white"
                  value={formData.correct_answer_text}
                  onChange={e => setFormData({ ...formData, correct_answer_text: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">This is not shown to the student. It is for the Examiner.</p>
              </div>
            )}

          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Save Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}