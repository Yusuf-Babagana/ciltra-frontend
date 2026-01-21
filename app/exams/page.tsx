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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash, Shuffle, Search, Loader2 } from "lucide-react"

// --- Validation Schema ---
const examSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().min(5, "Minimum 5 minutes"),
  pass_mark_percentage: z.coerce.number().min(1).max(100),
  price: z.coerce.number().min(0),
  randomize_questions: z.boolean().default(false), // <--- NEW FIELD
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
      title: "",
      description: "",
      duration_minutes: 60,
      pass_mark_percentage: 50,
      price: 0,
      randomize_questions: false,
      is_active: true,
    },
  })

  // --- Fetch Exams ---
  const fetchExams = async () => {
    try {
      const data = await adminAPI.getExams()
      setExams(data)
    } catch (error) {
      toast.error("Failed to load exams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  // --- Form Handlers ---
  const onSubmit = async (data: ExamFormValues) => {
    try {
      if (editingExam) {
        await adminAPI.updateExam(editingExam.id, data)
        toast.success("Exam updated successfully")
      } else {
        await adminAPI.createExam(data)
        toast.success("Exam created successfully")
      }
      setIsDialogOpen(false)
      fetchExams() // Refresh list
      resetForm()
    } catch (error) {
      toast.error("Operation failed")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete all questions and history for this exam.")) return
    try {
      await adminAPI.deleteExam(id)
      toast.success("Exam deleted")
      fetchExams()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const resetForm = () => {
    setEditingExam(null)
    form.reset({
      title: "",
      description: "",
      duration_minutes: 60,
      pass_mark_percentage: 50,
      price: 0,
      randomize_questions: false,
      is_active: true,
    })
  }

  const handleEdit = (exam: any) => {
    setEditingExam(exam)
    form.reset({
      title: exam.title,
      description: exam.description || "",
      duration_minutes: exam.duration_minutes,
      pass_mark_percentage: exam.pass_mark_percentage || exam.passing_score,
      price: exam.price,
      randomize_questions: exam.randomize_questions || false, // Load value
      is_active: exam.is_active,
    })
    setIsDialogOpen(true)
  }

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground">Create and manage your assessments.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="bg-indigo-600">
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Pass Mark</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">
                  {exam.title}
                  {exam.randomize_questions && (
                    <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Shuffle className="h-3 w-3 mr-1" /> Randomized
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{exam.duration_minutes} mins</TableCell>
                <TableCell>{exam.pass_mark_percentage || exam.passing_score}%</TableCell>
                <TableCell>{exam.total_questions || 0}</TableCell>
                <TableCell>
                  <Badge variant={exam.is_active ? "default" : "secondary"}>
                    {exam.is_active ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(exam)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(exam.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete Exam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredExams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No exams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- CREATE / EDIT DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit Exam" : "Create New Exam"}</DialogTitle>
            <DialogDescription>
              Configure the exam details and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duration (Minutes)</Label>
                <Input type="number" {...form.register("duration_minutes")} />
              </div>
              <div className="grid gap-2">
                <Label>Pass Mark (%)</Label>
                <Input type="number" {...form.register("pass_mark_percentage")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price (NGN)</Label>
                <Input type="number" {...form.register("price")} />
              </div>
            </div>

            {/* --- SWITCHES --- */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Active</Label>
                  <div className="text-xs text-muted-foreground">Visible to students</div>
                </div>
                <Switch
                  checked={form.watch("is_active")}
                  onCheckedChange={(c) => form.setValue("is_active", c)}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-blue-50/50">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Shuffle className="h-4 w-4" /> Randomize
                  </Label>
                  <div className="text-xs text-muted-foreground">Shuffle questions for each student</div>
                </div>
                <Switch
                  checked={form.watch("randomize_questions")}
                  onCheckedChange={(c) => form.setValue("randomize_questions", c)}
                />
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)}>{editingExam ? "Update Exam" : "Create Exam"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}