"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminAPI } from "@/lib/api" // Updated to use centralized API
import { Loader2, Plus, Search, Edit, Trash2, Upload, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Question {
  id: number
  question_text: string
  question_type: "mcq" | "essay" | "translation"
  category: string
  difficulty: string
  points: number
  exam_title?: string
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")

  // --- Upload State ---
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const data = await adminAPI.getQuestions()
      setQuestions(data)
    } catch (err) {
      console.error("Failed to fetch questions:", err)
      toast({ title: "Error", description: "Failed to load questions.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      await adminAPI.deleteQuestion(questionId) // Ensure this exists in adminAPI or use direct call if missing
      // If deleteQuestion isn't in adminAPI yet, you can add it or use: apiClient(`/questions/${questionId}/`, { method: "DELETE" })
      // Assuming for now you will add it or it matches the pattern:
      
      // FALLBACK if deleteQuestion is missing in your lib/api.ts:
      // await adminAPI.deleteExam(questionId) // No, that's for exams.
      // Let's assume you added it. If not, I'll provide the fix below.
      
      setQuestions(questions.filter((q) => q.id !== questionId))
      toast({ title: "Deleted", description: "Question removed successfully." })
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete question.", variant: "destructive" })
    }
  }

  // --- CSV Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
        // Use the new method in adminAPI
        const result = await adminAPI.uploadQuestions(formData)
        
        toast({ title: "Success", description: result.status })
        fetchQuestions() // Refresh list
    } catch (error: any) {
        console.error(error)
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" })
    } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // --- Template Downloader ---
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "question_text,question_type,category,difficulty,points,options,correct_answer\n"
        + "What is 2+2?,mcq,Math,easy,1,3|4|5|6,4\n"
        + "Translate 'Hello',translation,French,medium,5,,Bonjour"
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "questions_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || q.question_type === typeFilter
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
    return matchesSearch && matchesType && matchesDifficulty
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="mt-2 text-muted-foreground">Manage exam questions and assignments</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload}
            />

            {/* Template Button */}
            <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" /> Template
            </Button>
            
            {/* Upload Button */}
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Bulk Upload
            </Button>

            {/* Add Manually Button */}
            <Button asChild>
              <Link href="/admin/questions/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Link>
            </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="essay">Essay</SelectItem>
            <SelectItem value="translation">Translation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No questions found</p>
              <div className="mt-4 flex justify-center gap-2">
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload CSV
                  </Button>
                  <Button asChild>
                    <Link href="/admin/questions/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Question
                    </Link>
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{question.question_text}</CardTitle>
                    {question.exam_title && (
                      <CardDescription className="mt-1">Assigned to: {question.exam_title}</CardDescription>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Badge variant="outline">{question.question_type.toUpperCase()}</Badge>
                    <Badge variant="secondary">{question.difficulty}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Category: {question.category}</span>
                  <span>·</span>
                  <span>{question.points} points</span>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="bg-transparent">
                    <Link href={`/admin/questions/${question.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  {/* Note: Ensure deleteQuestion is added to adminAPI, or use generic delete */}
                   <Button variant="destructive" size="sm" onClick={() => handleDelete(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}