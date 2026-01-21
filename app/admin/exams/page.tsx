"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
// --- ADDED Download ICON ---
import { Plus, Pencil, Trash, Shuffle, Search, Loader2, MoreHorizontal, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const examSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  duration_minutes: z.coerce.number().min(5),
  passing_score: z.coerce.number().min(1).max(100),
  price: z.coerce.number().min(0),
  randomize_questions: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type ExamFormValues = z.infer<typeof examSchema>

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<any | null>(null)

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "", description: "", category: "General",
      duration_minutes: 60, passing_score: 50, price: 0,
      randomize_questions: false, is_active: true,
    },
  })

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    try {
      const data = await adminAPI.getExams()
      setExams(data)
    } catch (e) { toast.error("Failed to load exams") }
    finally { setLoading(false) }
  }

  const onSubmit = async (data: ExamFormValues) => {
    try {
      if (editingExam) {
        await adminAPI.updateExam(editingExam.id, data)
        toast.success("Exam updated")
      } else {
        await adminAPI.createExam(data)
        toast.success("Exam created")
      }
      setIsDialogOpen(false)
      fetchExams()
    } catch (e) { toast.error("Operation failed") }
  }

  const handleEdit = (exam: any) => {
    setEditingExam(exam)
    form.reset({
      title: exam.title,
      description: exam.description || "",
      category: exam.category || "General",
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score || 50,
      price: exam.price,
      randomize_questions: exam.randomize_questions || false,
      is_active: exam.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam?")) return;
    try { await adminAPI.deleteExam(id); fetchExams(); }
    catch (e) { toast.error("Failed to delete") }
  }

  // --- NEW: Handle Excel Export ---
  const handleExport = async (examId: number, title: string) => {
    try {
      toast.info("Generating report...")
      // This calls the function we added to adminAPI in step 4
      const blob = await adminAPI.exportExamResults(examId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Results_${title.replace(/\s+/g, '_')}.xlsx`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Download started")
    } catch (e) {
      toast.error("Failed to export results")
    }
  }

  const resetForm = () => {
    setEditingExam(null)
    form.reset({
      title: "", description: "", category: "General",
      duration_minutes: 60, passing_score: 50, price: 0,
      randomize_questions: false, is_active: true,
    })
  }

  const filtered = exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage assessments.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Settings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">
                  {exam.title}
                  <div className="text-xs text-muted-foreground">{exam.category}</div>
                </TableCell>
                <TableCell>
                  {Number(exam.price) === 0 ? <Badge variant="outline" className="text-green-600 bg-green-50">Free</Badge> : `₦${exam.price}`}
                </TableCell>
                <TableCell>
                  {exam.randomize_questions && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Shuffle className="h-3 w-3" /> Random
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={exam.is_active ? "default" : "secondary"}>{exam.is_active ? "Active" : "Draft"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(exam)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {/* --- ADDED EXPORT OPTION --- */}
                      <DropdownMenuItem onClick={() => handleExport(exam.id, exam.title)}>
                        <Download className="mr-2 h-4 w-4" /> Export Results
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(exam.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingExam ? "Edit Exam" : "New Exam"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Title</Label><Input {...form.register("title")} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea {...form.register("description")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input {...form.register("category")} /></div>
              <div><Label>Price (NGN)</Label><Input type="number" {...form.register("price")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duration (Mins)</Label><Input type="number" {...form.register("duration_minutes")} /></div>
              <div><Label>Pass Mark (%)</Label><Input type="number" {...form.register("passing_score")} /></div>
            </div>
            <div className="flex items-center justify-between border p-3 rounded bg-slate-50">
              <Label className="flex items-center gap-2"><Shuffle className="h-4 w-4" /> Randomize Questions</Label>
              <Switch checked={form.watch("randomize_questions")} onCheckedChange={c => form.setValue("randomize_questions", c)} />
            </div>
            <div className="flex items-center justify-between border p-3 rounded">
              <Label>Active (Visible to Students)</Label>
              <Switch checked={form.watch("is_active")} onCheckedChange={c => form.setValue("is_active", c)} />
            </div>
          </div>
          <DialogFooter><Button onClick={form.handleSubmit(onSubmit)}>Save Exam</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}