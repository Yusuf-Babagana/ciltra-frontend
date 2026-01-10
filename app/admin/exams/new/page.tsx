"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminAPI } from "@/lib/api"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

// 1. UPDATE SCHEMA: Add payment_link
const examSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(2, "Category is required"),
  duration_minutes: z.number().min(15, "Duration must be at least 15 minutes"),
  passing_score: z.number().min(1).max(100, "Passing score must be between 1 and 100"),
  price: z.number().min(0, "Price must be a positive number"),
  // Allow valid URL or empty string
  payment_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type ExamForm = z.infer<typeof examSchema>

export default function NewExamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      duration_minutes: 60,
      passing_score: 70,
      price: 0,
      payment_link: "", // Default empty
    },
  })

  const onSubmit = async (data: ExamForm) => {
    setIsLoading(true)
    setError("")

    try {
      const newExam: any = await adminAPI.createExam(data)
      toast({ title: "Success", description: "Exam created. You can now add questions." })

      if (newExam && newExam.id) {
        router.push(`/admin/exams/${newExam.id}`)
      } else {
        router.push("/admin/exams")
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create exam")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Exam</h1>
        <p className="mt-2 text-muted-foreground">Set up a new certification examination</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>Provide the basic information for this exam</CardDescription>
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
              <Label htmlFor="title">Exam Title</Label>
              <Input id="title" placeholder="Professional Web Development Certification" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Comprehensive exam covering..."
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Web Development" {...register("category")} />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input id="duration_minutes" type="number" {...register("duration_minutes", { valueAsNumber: true })} />
                {errors.duration_minutes && <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input id="passing_score" type="number" {...register("passing_score", { valueAsNumber: true })} />
                {errors.passing_score && <p className="text-sm text-destructive">{errors.passing_score.message}</p>}
              </div>
            </div>

            {/* 2. ADD THIS NEW SECTION FOR PAYMENT */}
            <div className="grid gap-6 sm:grid-cols-2 bg-slate-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NGN)</Label>
                <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_link">Paystack Product Link</Label>
                <Input
                  id="payment_link"
                  placeholder="https://paystack.shop/pay/..."
                  {...register("payment_link")}
                />
                {errors.payment_link && <p className="text-sm text-destructive">{errors.payment_link.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Exam & Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}