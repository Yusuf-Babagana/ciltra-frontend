"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminAPI, studentAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/header"
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
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash, Shuffle, Search, Loader2, Clock, BookOpen, ListChecks } from "lucide-react"
import Link from "next/link"

const examSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().min(5, "Minimum 5 minutes"),
  pass_mark_percentage: z.coerce.number().min(1).max(100),
  price: z.coerce.number().min(0),
  randomize_questions: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type ExamFormValues = z.infer<typeof examSchema>

export default function ExamsPage() {
  const { isAdmin, isAuthenticated } = useAuth()
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

  const fetchExams = async () => {
    try {
      const data = isAdmin ? await adminAPI.getExams() : await studentAPI.getExams()
      setExams(data)
    } catch (error) {
      toast.error("Failed to load exams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [isAdmin])

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
      fetchExams()
      resetForm()
    } catch (error) {
      toast.error("Operation failed")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete all associated questions.")) return
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
    form.reset({ title: "", description: "", duration_minutes: 60, pass_mark_percentage: 50, price: 0, randomize_questions: false, is_active: true })
  }

  const handleEdit = (exam: any) => {
    setEditingExam(exam)
    form.reset({
      title: exam.title,
      description: exam.description || "",
      duration_minutes: exam.duration_minutes,
      pass_mark_percentage: exam.pass_mark_percentage || exam.passing_score,
      price: exam.price,
      randomize_questions: exam.randomize_questions || false,
      is_active: exam.is_active,
    })
    setIsDialogOpen(true)
  }

  const filteredExams = exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 container mx-auto py-10 px-4">
        {!isAdmin ? (
          /* --- CANDIDATE VIEW: Clean Grid --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-slate-200 group overflow-hidden bg-white">
                <div className="h-2 bg-blue-600 w-full" />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">Certification</Badge>
                    <span className="font-bold text-xl text-emerald-600">
                      {exam.price > 0 ? `₦${Number(exam.price).toLocaleString()}` : "FREE"}
                    </span>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-blue-700 transition-colors">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-slate-600 leading-relaxed line-clamp-4 mb-6">
                    {exam.description || "Join the professional certification program."}
                  </p>
                  <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
                    <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> {exam.duration_minutes} Mins</div>
                    <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" /> {exam.total_questions || 0} Qs</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50/80 p-6">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" asChild>
                    <Link href={isAuthenticated ? `/student/exam/${exam.id}` : "/login"}>
                      {exam.price > 0 ? "Enroll Now" : "Start Certification"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* --- ADMIN VIEW: Management Table --- */
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exam Management</h1>
                <p className="text-slate-500 mt-1">Configure exams and question banks.</p>
              </div>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="bg-blue-600">
                <Plus className="mr-2 h-4 w-4" /> New Examination
              </Button>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-700">
                        {exam.title}
                        {exam.randomize_questions && (
                          <Badge variant="outline" className="ml-2 text-[10px] uppercase bg-indigo-50 text-indigo-700">
                            <Shuffle className="h-3 w-3 mr-1" /> Randomized
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{exam.duration_minutes}m</TableCell>
                      <TableCell>₦{Number(exam.price).toLocaleString()}</TableCell>
                      <TableCell>{exam.total_questions || 0}</TableCell>
                      <TableCell>
                        <Badge variant={exam.is_active ? "default" : "secondary"}>
                          {exam.is_active ? "Live" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(exam)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            {/* --- NEW ACTION: NAVIGATION TO QUESTIONS --- */}
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/exams/${exam.id}/questions`}>
                                <ListChecks className="mr-2 h-4 w-4" /> Manage Questions
                              </Link>
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
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {/* --- FORM DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingExam ? "Update Examination" : "Add New Examination"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-bold text-sm">Exam Title</Label>
              <Input id="title" {...form.register("title")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-bold text-sm">Description</Label>
              <Textarea id="description" {...form.register("description")} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold text-sm">Duration (Mins)</Label>
                <Input type="number" {...form.register("duration_minutes")} />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-sm">Pass Mark (%)</Label>
                <Input type="number" {...form.register("pass_mark_percentage")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold text-sm">Price (NGN)</Label>
                <Input type="number" {...form.register("price")} />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <Label className="font-bold text-sm">Active</Label>
                <Switch checked={form.watch("is_active")} onCheckedChange={(c) => form.setValue("is_active", c)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} className="bg-blue-600">Save Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}