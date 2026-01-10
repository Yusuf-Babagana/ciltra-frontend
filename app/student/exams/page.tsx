"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Banknote, Loader2 } from "lucide-react"

export default function ExamCatalogPage() {
  const router = useRouter()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await studentAPI.getExams()
        setExams(data)
      } catch (error) {
        console.error("Failed to load exams")
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="container mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-2">Professional Certifications</h1>
      <p className="text-muted-foreground mb-8">Select an exam to begin your certification journey.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                  Certification
                </Badge>
                {/* Price Tag */}
                <Badge className={Number(exam.price) === 0 ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-900"}>
                  {Number(exam.price) === 0 ? "FREE" : `₦${exam.price}`}
                </Badge>
              </div>
              <CardTitle className="text-xl">{exam.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {exam.description || "No description provided for this certification exam."}
              </p>

              <div className="flex items-center gap-4 text-sm font-medium text-zinc-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam.duration_minutes} Minutes
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t bg-slate-50/50">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                // ✅ FIX: Send to the Lobby/Payment Page
                onClick={() => router.push(`/student/exam/${exam.id}`)}
              >
                Start Certification
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}