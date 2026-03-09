"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import { FileText, ListChecks, ShieldCheck, Info } from "lucide-react"

const questionSchema = z.object({
  exam: z.string().min(1, "Assigning to an exam is required"),
  section: z.enum(["Section A", "Section B", "Section C"]),
  question_type: z.enum(["MCQ", "THEORY"]),
  text: z.string().min(10, "Content text is too short"),
  points: z.coerce.number().min(1),
})

export default function QuestionCreator() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { section: "Section A", question_type: "MCQ", points: 1 }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await adminAPI.createQuestion({
        ...data,
        status: 'draft' // Initial CPT lifecycle status
      })
      toast.success("Question added to Content Bank")
      form.reset()
    } catch (e) {
      toast.error("Failed to save content")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Content to Bank</CardTitle>
          <CardDescription>Tag materials for Section A (MCQ), B (Translation), or C (Ethics/CAT).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* 1. SECTION TAGGING */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPT Section Placement</Label>
                <Select onValueChange={(v) => form.setValue("section", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Section A">Section A: Core Knowledge</SelectItem>
                    <SelectItem value="Section B">Section B: Practical Translation</SelectItem>
                    <SelectItem value="Section C">Section C: Advanced Competence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Evaluation Type</Label>
                <Select onValueChange={(v) => form.setValue("question_type", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice (Auto-graded)</SelectItem>
                    <SelectItem value="THEORY">Theory/Text Pack (Manual Grading)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2. CONTENT INPUT */}
            <div className="space-y-2">
              <Label>Content / Prompt Text</Label>
              <Textarea
                placeholder="Enter MCQ question or Translation Source Text here..."
                className="min-h-[200px]"
                {...form.register("text")}
              />
            </div>

            {/* 3. WORKFLOW INDICATOR */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                New items are saved as <strong>Draft</strong>. They must be moved to <strong>Review</strong> and <strong>Approved</strong> by an assigned Examiner before they can appear in a live sitting.
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600">
              {isSubmitting ? "Saving Content..." : "Save to Content Bank"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}