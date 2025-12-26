"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminAPI } from "@/lib/api" // <--- FIX: Correct Import
import { Loader2, AlertCircle, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

const questionSchema = z.object({
  question_text: z.string().min(10, "Question must be at least 10 characters"),
  question_type: z.enum(["MCQ", "THEORY"]), // Updated to match backend (usually uppercase)
  category: z.string().min(1, "Category is required"), // Assuming category is an ID or string
  marks: z.number().min(1, "Marks must be at least 1"),
  options: z.array(z.string()).optional(),
  correct_option_index: z.string().optional(), // For MCQ: Index of the correct option
})

type QuestionForm = z.infer<typeof questionSchema>

export default function NewQuestionPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_type: "MCQ",
      marks: 1,
      options: ["", "", "", ""],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const questionType = watch("question_type")

  const onSubmit = async (data: QuestionForm) => {
    setIsLoading(true)
    setError("")

    try {
      // 1. Create the Question
      const questionPayload = {
        text: data.question_text,
        question_type: data.question_type, // "MCQ" or "THEORY"
        marks: data.marks,
        // If you have a category ID system, you might need to fetch categories first.
        // For now, if the backend expects an ID, ensure you pass an ID. 
        // If it expects a raw ID, use: category: parseInt(data.category)
      }

      const createdQuestion = await adminAPI.createQuestion(questionPayload)

      // 2. Add Options (if MCQ)
      if (data.question_type === "MCQ" && data.options) {
        const validOptions = data.options.filter(opt => opt.trim() !== "")
        
        const optionsPayload = validOptions.map((optText, index) => ({
            text: optText,
            is_correct: index.toString() === data.correct_option_index
        }))

        if (optionsPayload.length > 0) {
            await adminAPI.addOptionsToQuestion(createdQuestion.id, optionsPayload)
        }
      }

      router.push("/admin/questions")
    } catch (err: any) {
      setError(err.message || "Failed to create question")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Question Bank
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Question</h1>
        <p className="mt-2 text-muted-foreground">Create a new question for your exam question bank</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Provide the question information and options</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Textarea
                id="question_text"
                placeholder="Enter your question here..."
                rows={3}
                {...register("question_text")}
              />
              {errors.question_text && <p className="text-sm text-destructive">{errors.question_text.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="question_type">Question Type</Label>
                <Select
                  value={watch("question_type")}
                  onValueChange={(value) => setValue("question_type", value as "MCQ" | "THEORY")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="THEORY">Theory / Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input id="marks" type="number" {...register("marks", { valueAsNumber: true })} />
                {errors.marks && <p className="text-sm text-destructive">{errors.marks.message}</p>}
              </div>
            </div>

            {questionType === "MCQ" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append("")}
                    className="bg-transparent"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      {/* Radio button to select correct answer */}
                      <input 
                        type="radio" 
                        name="correct_option"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        checked={watch("correct_option_index") === index.toString()}
                        onChange={() => setValue("correct_option_index", index.toString())}
                      />
                      <Input placeholder={`Option ${index + 1}`} {...register(`options.${index}` as const)} />
                      {fields.length > 2 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Question
              </Button>
              <Button type="button" variant="outline" asChild className="bg-transparent">
                <Link href="/admin/questions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}