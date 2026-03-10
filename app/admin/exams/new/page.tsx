"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminAPI } from "@/lib/api"
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Globe2,
  SlidersHorizontal,
  Beaker,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

// ── Constants ─────────────────────────────────────────────────────────────────

/** Approved CPT language pairs — extend as the platform grows */
const LANGUAGE_PAIRS = [
  { value: "EN-FR", label: "English → French" },
  { value: "FR-EN", label: "French → English" },
  { value: "EN-AR", label: "English → Arabic" },
  { value: "AR-EN", label: "Arabic → English" },
  { value: "EN-ES", label: "English → Spanish" },
  { value: "ES-EN", label: "Spanish → English" },
  { value: "EN-DE", label: "English → German" },
  { value: "DE-EN", label: "German → English" },
  { value: "EN-PT", label: "English → Portuguese" },
  { value: "PT-EN", label: "Portuguese → English" },
]

/** CPT Section B2 specialization tracks */
const SPECIALIZATIONS = [
  { key: "legal", label: "Legal" },
  { key: "medical", label: "Medical" },
  { key: "academic", label: "Academic" },
] as const

type SpecKey = (typeof SPECIALIZATIONS)[number]["key"]

// ── Zod Schema ────────────────────────────────────────────────────────────────

const examSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(2, "Category is required"),
  duration_minutes: z.number().min(15, "Duration must be at least 15 minutes"),
  passing_score: z.number().min(1).max(100),
  price: z.number().min(0),
  payment_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  // ── CPT-specific ──
  language_pair: z.string().min(1, "Language pair is required"),
  is_blueprint: z.boolean(),
  weight_section_a: z
    .number()
    .min(0)
    .max(100, "Section A weight must be 0–100"),
  weight_section_b: z
    .number()
    .min(0)
    .max(100, "Section B weight must be 0–100"),
  weight_section_c: z
    .number()
    .min(0)
    .max(100, "Section C weight must be 0–100"),
})
  // Ensure A + B + C == 100
  .refine(
    (d) => d.weight_section_a + d.weight_section_b + d.weight_section_c === 100,
    {
      message: "Section weights must sum to exactly 100%",
      path: ["weight_section_a"],
    }
  )

type ExamForm = z.infer<typeof examSchema>

// ── Section-weight helper ─────────────────────────────────────────────────────

function SectionWeightInput({
  id,
  label,
  description,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  description: string
  value: number
  onChange: (v: number) => void
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span
          className={`text-xs font-semibold tabular-nums ${value > 0 ? "text-indigo-600" : "text-muted-foreground"
            }`}
        >
          {value}%
        </span>
      </div>
      <Input
        id={id}
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="text-center"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewExamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  /** B2 specialization toggles (independent of Zod) */
  const [activeSpecs, setActiveSpecs] = useState<Record<SpecKey, boolean>>({
    legal: false,
    medical: false,
    academic: false,
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      duration_minutes: 180,
      passing_score: 70,
      price: 0,
      payment_link: "",
      language_pair: "",
      is_blueprint: false,
      weight_section_a: 15,
      weight_section_b: 65,
      weight_section_c: 20,
    },
  })

  const [wA, wB, wC] = watch(["weight_section_a", "weight_section_b", "weight_section_c"])
  const weightSum = (wA || 0) + (wB || 0) + (wC || 0)

  const toggleSpec = (key: SpecKey) =>
    setActiveSpecs((prev) => ({ ...prev, [key]: !prev[key] }))

  const onSubmit = async (data: ExamForm) => {
    setIsLoading(true)
    setError("")
    try {
      const payload = {
        ...data,
        pass_score: data.passing_score, // Map to Django field name
        ca_weight: data.weight_section_a,
        exam_weight: data.weight_section_b,
        practical_weight: data.weight_section_c,
        specializations: Object.entries(activeSpecs)
          .filter(([, v]) => v)
          .map(([k]) => k),
      }
      const newExam: any = await adminAPI.createExam(payload)
      toast({ title: "Success", description: "Exam created. You can now add questions." })
      router.push(newExam?.id ? `/admin/exams/${newExam.id}` : "/admin/exams")
    } catch (err: any) {
      setError(err.message || "Failed to create exam")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">

      {/* ── Back + Title ── */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New CPT Exam</h1>
        <p className="mt-1 text-muted-foreground">
          Set up a new CPT exam instance or reusable blueprint
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Card 1: Exam Details ── */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>Basic information for this exam instance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input id="title" placeholder="CPT General — April 2025" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Comprehensive CPT covering sections A, B and C..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="General / Specialised" {...register("category")} />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  {...register("duration_minutes", { valueAsNumber: true })}
                />
                {errors.duration_minutes && (
                  <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  {...register("passing_score", { valueAsNumber: true })}
                />
                {errors.passing_score && (
                  <p className="text-sm text-destructive">{errors.passing_score.message}</p>
                )}
              </div>
            </div>

            {/* Blueprint toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50">
              <div>
                <Label htmlFor="is_blueprint" className="text-sm font-medium">
                  Reusable Blueprint
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Blueprint exams can be cloned to create live instances without editing the master.
                </p>
              </div>
              <Controller
                name="is_blueprint"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_blueprint"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

          </CardContent>
        </Card>

        {/* ── Card 2: Language Pair & Direction ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-indigo-500" />
              Language Pair &amp; Direction
            </CardTitle>
            <CardDescription>
              Select the approved source → target language combination for this exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="language_pair"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Language Pair</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language pair…" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_PAIRS.map((lp) => (
                        <SelectItem key={lp.value} value={lp.value}>
                          {lp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.language_pair && (
                    <p className="text-sm text-destructive">{errors.language_pair.message}</p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Card 3: Section Weight Engine ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
              Section Weights
            </CardTitle>
            <CardDescription>
              Configure the percentage contribution of each CPT section (must sum to 100%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="weight_section_a"
                control={control}
                render={({ field }) => (
                  <SectionWeightInput
                    id="weight_section_a"
                    label="Section A"
                    description="Terminology & Linguistic Knowledge"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.weight_section_a?.message}
                  />
                )}
              />
              <Controller
                name="weight_section_b"
                control={control}
                render={({ field }) => (
                  <SectionWeightInput
                    id="weight_section_b"
                    label="Section B"
                    description="Translation Tasks (general + specialised)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="weight_section_c"
                control={control}
                render={({ field }) => (
                  <SectionWeightInput
                    id="weight_section_c"
                    label="Section C"
                    description="Professional Conduct &amp; Ethics"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Running total indicator */}
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium border ${weightSum === 100
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
                }`}
            >
              <span>Total weight</span>
              <Badge
                variant="outline"
                className={
                  weightSum === 100
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }
              >
                {weightSum}% {weightSum === 100 ? "✓" : `(${weightSum > 100 ? "over" : "under"} by ${Math.abs(100 - weightSum)}%)`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── Card 4: Section B2 Specialization Tracks ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-indigo-500" />
              Section B2 Specialization Tracks
            </CardTitle>
            <CardDescription>
              Enable domain-specific translation tasks within Section B
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SPECIALIZATIONS.map((spec) => (
              <div
                key={spec.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">{spec.label} Translation</p>
                  <p className="text-xs text-muted-foreground">
                    Include {spec.label.toLowerCase()} domain texts in Section B2
                  </p>
                </div>
                <Switch
                  id={`spec-${spec.key}`}
                  checked={activeSpecs[spec.key]}
                  onCheckedChange={() => toggleSpec(spec.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Card 5: Payment ── */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure the exam fee and payment link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NGN)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_link">Paystack Product Link</Label>
                <Input
                  id="payment_link"
                  placeholder="https://paystack.shop/pay/..."
                  {...register("payment_link")}
                />
                {errors.payment_link && (
                  <p className="text-sm text-destructive">{errors.payment_link.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Exam &amp; Continue
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

      </form>
    </div>
  )
}