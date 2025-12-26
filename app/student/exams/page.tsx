"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { studentAPI } from "@/lib/api"
import { Clock, Banknote, ArrowRight } from "lucide-react"

export default function ExamCatalogPage() {
  const router = useRouter()
  const [exams, setExams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await studentAPI.getExams()
        setExams(data as any[])
      } catch (error) {
        console.error("Failed to load exams")
      } finally {
        setIsLoading(false)
      }
    }
    fetchExams()
  }, [])

  const handleStartExam = async (examId: number) => {
    try {
      // In a real app, check payment status first. 
      // For now, we jump straight to starting (Free mode or Mock Payment)
      const session = await studentAPI.startExam(examId)
      router.push(`/student/exam/${session.id}`)
    } catch (error) {
      alert("Failed to start exam. Please try again.")
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Professional Certifications</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary">{exam.category}</Badge>
                {exam.is_active && <Badge className="bg-green-600">Active</Badge>}
              </div>
              <CardTitle className="mt-2">{exam.title}</CardTitle>
              <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" /> {exam.duration_minutes} Minutes
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Banknote className="w-4 h-4 mr-2" /> 
                {exam.price === 0 ? "Free" : `NGN ${exam.price.toLocaleString()}`}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleStartExam(exam.id)}>
                Start Certification <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}