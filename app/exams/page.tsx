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
    <div className="relative min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {/* Background Image */}
      <div className="absolute inset-0 z-0 top-20"> {/* Offset for header */}
        <img
          src="https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/505180011_1214676324036208_4156852350019206314_n.jpg?_nc_cat=100&_nc_cb=99be929b-f3b7c874&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEbdWqux3AQI3CUmCp32IJSR1yJARlnLNdHXIkBGWcs10t3_56DSa6WvNiY7XpWnImurHmM3XGNDoIS52MdVx1g&_nc_ohc=tz5COX9Bte8Q7kNvwG0ZK5t&_nc_oc=AdnafrQwkK-fvoSuZhwdlFLrglXdQ0yqaGbv93BB4GJ4M633DNQghqIJczYq3iM6m182qzI14p4ogoAEV4-HYupt&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=_US9hIcVh5d1-7ymG4LfZQ&oh=00_Afrk0Dxn9KV6iORGOaDYBBz_5wadL7xnDqs3jJ_0vTGSOQ&oe=696B028A"
          alt="Background"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
      </div>

      <main className="container relative z-10 py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Official Certifications</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Available Examinations</h1>
          <p className="text-lg text-muted-foreground">Browse and register for our internationally recognized professional certification exams.</p>
        </div>

        <div className="mb-10 max-w-md mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-primary rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exams by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-background border-muted"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="max-w-md mx-auto bg-background/50 backdrop-blur">
            <CardContent className="flex flex-col h-64 items-center justify-center text-center p-8">
              <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">No Exams Found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="flex flex-col group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border-muted/50 overflow-hidden bg-background/80 backdrop-blur-sm">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{exam.category_name || exam.category || "General"}</Badge>
                    <div className="flex items-center gap-1 font-bold text-lg text-primary">
                      <span>{Number(exam.price) === 0 ? "Free" : `${exam.price}`}</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 text-xl">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary/70" />
                      <span>{exam.duration_minutes} minutes duration</span>
                    </div>
                    {/* Only show questions/pass score if data exists (List view might exclude them) */}
                    {(exam.total_questions || exam.pass_mark_percentage) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4 text-primary/70" />
                        <span>
                          {exam.total_questions ? `${exam.total_questions} questions` : "Standard Assessment"}
                          {exam.pass_mark_percentage || exam.passing_score ? ` • ${exam.pass_mark_percentage || exam.passing_score}% pass mark` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Button asChild className="w-full h-11 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                    <Link href={`/exams/${exam.id}`}>View Details & Register</Link>
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