"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { studentAPI } from "@/lib/api" // UPDATED: Use studentAPI
import { Loader2, Clock, Award, Search, DollarSign } from "lucide-react"
import Link from "next/link"

// UPDATED: Interface matching Backend Serializer (ExamListSerializer)
interface Exam {
  id: number
  title: string
  description: string
  category_name?: string // Backend returns this in list view
  category?: string
  duration_minutes: number
  pass_mark_percentage?: number // Backend field name
  passing_score?: number
  price: number
  total_questions?: number // Might be undefined in list view
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      // UPDATED: Use studentAPI.getExams()
      // Note: token handling is now done automatically inside the API client
      const data = await studentAPI.getExams()
      setExams(data)
    } catch (err) {
      console.error("[v0] Failed to fetch exams:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.category_name || exam.category || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Available Examinations</h1>
          <p className="mt-2 text-muted-foreground">Browse and register for professional certification exams</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exams by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredExams.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No exams found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{exam.title}</CardTitle>
                    {/* UPDATED: Handle category_name from backend */}
                    <Badge variant="secondary">{exam.category_name || exam.category || "General"}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration_minutes} minutes</span>
                    </div>
                    {/* Only show questions/pass score if data exists (List view might exclude them) */}
                    {(exam.total_questions || exam.pass_mark_percentage) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>
                          {exam.total_questions ? `${exam.total_questions} questions · ` : ""}
                          {exam.pass_mark_percentage || exam.passing_score}% to pass
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <DollarSign className="h-4 w-4" />
                      {/* Handle 0 price as Free */}
                      <span>{Number(exam.price) === 0 ? "Free" : `$${exam.price}`}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/exams/${exam.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}