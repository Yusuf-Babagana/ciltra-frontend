"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminAPI, studentAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/header" // Integrated Header
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
import { Plus, MoreHorizontal, Pencil, Trash, Shuffle, Search, Loader2, Clock, BookOpen } from "lucide-react"
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
    if (!confirm("Are you sure?")) return
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
        {/* --- CONDITIONAL VIEW START --- */}
        {!isAdmin ? (
          // PUBLIC / CANDIDATE VIEW
          <div className="space-y-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Professional Certifications</h1>
              <p className="mt-4 text-lg text-slate-600">
                Advance your career with industry-recognized certifications in logistics, transport, and supply chain management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-slate-200 group overflow-hidden">
                  <div className="h-2 bg-blue-600 w-full" />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Certification</Badge>
                      <span className="font-bold text-xl text-emerald-600">
                        {exam.price > 0 ? `₦${Number(exam.price).toLocaleString()}` : "FREE"}
                      </span>
                    </div>
                    <CardTitle className="text-2xl group-hover:text-blue-700 transition-colors">{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-slate-600 leading-relaxed line-clamp-4 mb-6">
                      {exam.description || "Join the elite group of logistics professionals with this comprehensive certification program."}
                    </p>
                    <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
                      <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> {exam.duration_minutes} Mins</div>
                      <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" /> {exam.total_questions || 0} Qs</div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-slate-50/80 p-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-md" asChild>
                      <Link href={isAuthenticated ? `/student/exam/${exam.id}` : "/login"}>
                        {exam.price > 0 ? "Enroll Now" : "Start Certification"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // ADMIN MANAGEMENT VIEW
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exam Management</h1>
                <p className="text-slate-500 mt-1">Configure and monitor all platform examinations.</p>
              </div>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> New Examination
              </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search exams by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Pass Mark</TableHead>
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
                          <Badge variant="outline" className="ml-2 text-[10px] uppercase bg-indigo-50 text-indigo-700 border-indigo-200">
                            <Shuffle className="h-3 w-3 mr-1" /> Randomized
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{exam.duration_minutes}m</TableCell>
                      <TableCell>{exam.pass_mark_percentage || exam.passing_score}%</TableCell>
                      <TableCell>{exam.total_questions || 0}</TableCell>
                      <TableCell>
                        <Badge variant={exam.is_active ? "default" : "secondary"} className={exam.is_active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
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
                            <DropdownMenuItem onClick={() => handleEdit(exam)}><Pencil className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(exam.id)} className="text-red-600 font-medium"><Trash className="mr-2 h-4 w-4" /> Delete Exam</DropdownMenuItem>
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

      {/* --- ADMIN DIALOG REMAINS ACCESSIBLE --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingExam ? "Update Examination" : "Add New Examination"}</DialogTitle>
            <DialogDescription>Modify core settings and pricing for this course.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-bold">Exam Title</Label>
              <Input id="title" {...form.register("title")} placeholder="e.g. Certified Logistics Manager" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-bold">Description</Label>
              <Textarea id="description" {...form.register("description")} rows={4} placeholder="What will candidates learn?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Duration (Minutes)</Label>
                <Input type="number" {...form.register("duration_minutes")} />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Pass Mark (%)</Label>
                <Input type="number" {...form.register("pass_mark_percentage")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Price (NGN)</Label>
                <Input type="number" {...form.register("price")} />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <Label className="font-bold">Visibility</Label>
                <div className="flex items-center gap-3 border rounded-md p-2">
                  <Switch checked={form.watch("is_active")} onCheckedChange={(c) => form.setValue("is_active", c)} />
                  <span className="text-sm font-medium">{form.watch("is_active") ? "Active on Portal" : "Hidden / Draft"}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Discard</Button>
            <Button onClick={form.handleSubmit(onSubmit)} className="bg-blue-600 px-8">Save Examination</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}