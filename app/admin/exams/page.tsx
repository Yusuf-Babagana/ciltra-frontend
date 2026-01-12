"use client"

import { useEffect, useState } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, Clock, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function ExamsListPage() {
  const [exams, setExams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const data = await adminAPI.getExams()
      setExams(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      await adminAPI.deleteExam(id)
      setExams(exams.filter(e => e.id !== id))
      toast({ title: "Deleted", description: "Exam deleted successfully" })
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete exam", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage certification examinations</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/new">
            <Plus className="mr-2 h-4 w-4" /> New Exam
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            No exams created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{exam.category}</Badge>
                  <span className="font-bold text-lg">{exam.currency} {exam.price}</span>
                </div>
                <CardTitle className="mt-2">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {exam.duration_minutes} mins
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/admin/exams/${exam.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(exam.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}