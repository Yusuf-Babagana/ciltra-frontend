"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { adminAPI } from "@/lib/api"
import { Loader2, AlertCircle, ArrowLeft, Plus, X, Tag } from "lucide-react"
import Link from "next/link"

// ── Types & Constants ────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { value: "ETHICS_MCQ", label: "Ethics MCQ", section: "Section C" },
  { value: "CASE_SCENARIO", label: "Case Scenario", section: "Section C" },
  { value: "GENERAL_TEXT_PACK", label: "General Text Pack", section: "Section B" },
  { value: "SPECIALIZED_TEXT_PACK", label: "Specialized Text Pack", section: "Section B" },
] as const

const LANGUAGE_PAIRS = [
  { value: "EN-FR", label: "EN → FR" },
  { value: "FR-EN", label: "FR → EN" },
]

const DIRECTIONS = [
  { value: "AtoB", label: "Forward (A to B)" },
  { value: "BtoA", label: "Reverse (B to A)" },
  { value: "both", label: "Bidirectional" },
]

const SPECIALIZATIONS = [
  { value: "General", label: "General (No spec)" },
  { value: "Legal", label: "Legal" },
  { value: "Medical", label: "Medical" },
  { value: "Academic", label: "Academic" },
]

const DIFFICULTIES = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Master", label: "Master" },
]

// ── Zod Schema ────────────────────────────────────────────────────────────────

const contentSchema = z.object({
  text: z.string().min(10, "Content text must be at least 10 characters"),
  type: z.enum(["ETHICS_MCQ", "CASE_SCENARIO", "GENERAL_TEXT_PACK", "SPECIALIZED_TEXT_PACK"]),

  // Mandatory CPT Tagging
  language_pair: z.string().min(1, "Language Pair is mandatory"),
  direction: z.enum(["AtoB", "BtoA", "both"]),
  specialization: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Master"]),

  // Legacy / Other
  marks: z.number().min(1, "Marks must be at least 1"),
  preserve_format: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  correct_option_index: z.string().optional(),
})

type ContentForm = z.infer<typeof contentSchema>

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewContentPage() {
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
  } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: "GENERAL_TEXT_PACK",
      language_pair: "",
      direction: "AtoB",
      specialization: "General",
      difficulty: "Intermediate",
      marks: 10,
      preserve_format: false,
      options: ["", "", "", ""],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const selectedType = watch("type")
  const isMCQ = selectedType === "ETHICS_MCQ"

  const onSubmit = async (data: ContentForm) => {
    setIsLoading(true)
    setError("")

    try {
      // Create the Content Item
      const contentPayload = {
        text: data.text,
        question_type: data.type, // Mapping to backend naming temporarily
        marks: data.marks,
        // CPT Metadata
        language_pair: data.language_pair,
        direction: data.direction,
        specialization: data.specialization === "General" ? null : data.specialization,
        difficulty: data.difficulty,
        preserve_format: data.preserve_format,
      }

      // @ts-ignore - Temporary until adminAPI.createQuestion types are fully updated
      const createdContent = await adminAPI.createQuestion(contentPayload)

      // Add Options (if MCQ)
      if (isMCQ && data.options) {
        const validOptions = data.options.filter(opt => opt.trim() !== "")
        const optionsPayload = validOptions.map((optText, index) => ({
          text: optText,
          is_correct: index.toString() === data.correct_option_index
        }))

        if (optionsPayload.length > 0 && createdContent?.id) {
          await adminAPI.addOptionsToQuestion(createdContent.id, optionsPayload)
        }
      }

      router.push("/admin/questions")
    } catch (err: any) {
      setError(err.message || "Failed to create content item")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content Bank
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add to Content Bank</h1>
        <p className="mt-2 text-muted-foreground">
          Create properly tagged CPT content for Section B (Text Packs) and Section C (Ethics).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── CARD 1: CPT Tagging Profile (Mandatory) ── */}
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Tag className="h-5 w-5 text-indigo-600" />
              CPT Tagging Profile
            </CardTitle>
            <CardDescription className="text-indigo-700/70">
              All content must be tagged for Randomization Rules and Blueprint matching.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Content Type */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(ct => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label} <span className="text-muted-foreground ml-1">({ct.section})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
              )}
            />

            {/* Language Pair */}
            <Controller
              name="language_pair"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">Language Pair <span className="text-red-500">*</span></Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.language_pair ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Pair..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_PAIRS.map(lp => (
                        <SelectItem key={lp.value} value={lp.value}>{lp.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.language_pair && <p className="text-sm text-destructive">{errors.language_pair.message}</p>}
                </div>
              )}
            />

            {/* Direction */}
            <Controller
              name="direction"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Directionality</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIRECTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Difficulty */}
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Specialization */}
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Specialization Track</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="General" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Marks */}
            <div className="space-y-2">
              <Label>Maximum Marks Available</Label>
              <Input type="number" {...register("marks", { valueAsNumber: true })} />
            </div>

          </CardContent>
        </Card>

        {/* ── CARD 2: Content Body ── */}
        <Card>
          <CardHeader>
            <CardTitle>Content Body</CardTitle>
            <CardDescription>
              {isMCQ
                ? "Provide the ethics question or scenario prompt."
                : "Provide the source text bundle or translation brief."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-3">
              <Label htmlFor="text">Main Text / Prompt <span className="text-red-500">*</span></Label>
              <Textarea
                id="text"
                placeholder={isMCQ ? "Enter ethics question..." : "Enter source text bundle..."}
                className="min-h-[200px] font-mono text-sm"
                {...register("text")}
              />
              {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
            </div>

            {/* Real-world Document Formatting Flag */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <Controller
                name="preserve_format"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="preserve_format"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="preserve_format" className="text-sm font-medium text-blue-900 cursor-pointer">
                  Preserve source formatting
                </Label>
                <p className="text-xs text-blue-700">
                  Enable this to simulate real-world document formatting (preserves whitespace, indentation, and line breaks exactly for B2 tasks).
                </p>
              </div>
            </div>

            {/* MCQ Options Section */}
            {isMCQ && (
              <div className="space-y-4 pt-4">
                <Separator />
                <div className="flex items-center justify-between pt-2">
                  <Label className="text-base">Multiple Choice Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append("")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3">
                      <div className="mt-2.5">
                        <input
                          type="radio"
                          name="correct_option"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={watch("correct_option_index") === index.toString()}
                          onChange={() => setValue("correct_option_index", index.toString())}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          {...register(`options.${index}` as const)}
                        />
                      </div>
                      {fields.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" className="mt-0.5 text-slate-400 hover:text-red-500" onClick={() => remove(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">Select the radio button next to the technically correct answer.</p>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save to Content Bank
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/questions">Cancel</Link>
          </Button>
        </div>

      </form>
    </div>
  )
}