"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, ArrowLeft, Settings2 } from "lucide-react"
import { toast } from "sonner"

const examSchema = z.object({
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    duration_minutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    pass_mark_percentage: z.coerce.number().min(1).max(100),
    grading_type: z.enum(["auto", "manual"]),
    randomize_questions: z.boolean().default(false),
    price: z.coerce.number().min(0),
    is_active: z.boolean().default(true),
})

type ExamFormValues = z.infer<typeof examSchema>

export default function CreateExamPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<ExamFormValues>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            duration_minutes: 60,
            pass_mark_percentage: 50,
            grading_type: "auto",
            randomize_questions: false,
            price: 0,
            is_active: true
        }
    })

    const onSubmit = async (data: ExamFormValues) => {
        setLoading(true)
        try {
            await adminAPI.createExam(data)
            toast.success("Exam created successfully")
            router.push("/admin/exams")
        } catch (e) {
            toast.error("Failed to create exam")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New Exam</h1>
                    <p className="text-muted-foreground">Configure duration, grading rules, and sections.</p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exam Details</CardTitle>
                        <CardDescription>Basic information visible to candidates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Exam Title</Label>
                            <Input placeholder="e.g., JAMB Mock 2026 - Mathematics" {...form.register("title")} />
                            {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Description / Instructions</Label>
                            <Textarea placeholder="Enter instructions for the students..." {...form.register("description")} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duration (Minutes)</Label>
                                <Input type="number" {...form.register("duration_minutes")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (₦)</Label>
                                <Input type="number" placeholder="0 for Free" {...form.register("price")} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scoring & Rules */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-indigo-600" />
                            <CardTitle>Scoring & Rules</CardTitle>
                        </div>
                        <CardDescription>Define how this exam is graded and delivered.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Pass Mark & Grading Type */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Pass Mark (%)</Label>
                                <Input type="number" {...form.register("pass_mark_percentage")} />
                                <p className="text-xs text-muted-foreground">Score required to generate a certificate.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Grading Mode</Label>
                                <Select
                                    onValueChange={(val: "auto" | "manual") => form.setValue("grading_type", val)}
                                    defaultValue={form.getValues("grading_type")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Automatic (Instant Results)</SelectItem>
                                        <SelectItem value="manual">Manual / Hybrid (Wait for Grader)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Use 'Manual' if exam contains theory questions.</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Toggles */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border p-3 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Randomize Questions</Label>
                                    <p className="text-xs text-muted-foreground">Shuffle question order for every student to prevent cheating.</p>
                                </div>
                                <Switch
                                    checked={form.watch("randomize_questions")}
                                    onCheckedChange={(checked) => form.setValue("randomize_questions", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between border p-3 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Active Status</Label>
                                    <p className="text-xs text-muted-foreground">If disabled, students cannot see or start this exam.</p>
                                </div>
                                <Switch
                                    checked={form.watch("is_active")}
                                    onCheckedChange={(checked) => form.setValue("is_active", checked)}
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800">
                            <strong>Note on Sections:</strong> You can assign questions to specific sections (e.g., "Section A") when adding questions to the Question Bank.
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="min-w-[150px]">
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Create Exam
                    </Button>
                </div>
            </form>
        </div>
    )
}