"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Clock, CheckCircle, AlertCircle, FileType2, BrainCircuit, Type, Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import TranslationWorkspace from "../components/TranslationWorkspace"

export default function ExamSessionPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [session, setSession] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [currentQIndex, setCurrentQIndex] = useState(0)

    // Store answers: { questionId: value }
    const [answers, setAnswers] = useState<Record<number, any>>({})

    // CPT Student Workspace Additions
    const [aiDisclosed, setAiDisclosed] = useState(false)
    const [glossaryTerms, setGlossaryTerms] = useState<{ source: string, target: string }[]>([])
    const [newTermSource, setNewTermSource] = useState("")
    const [newTermTarget, setNewTermTarget] = useState("")

    const [timeLeft, setTimeLeft] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await studentAPI.getSession(Number(id))

                setSession(data)
                setQuestions(data.questions || [])

                let remaining = 0
                if (data.time_remaining_seconds !== undefined) {
                    remaining = data.time_remaining_seconds
                } else if (data.start_time) {
                    const start = new Date(data.start_time).getTime()
                    const durationMs = data.duration_minutes * 60 * 1000
                    const end = start + durationMs
                    const now = new Date().getTime()
                    remaining = Math.floor((end - now) / 1000)
                }

                setTimeLeft(remaining > 0 ? remaining : 0)
            } catch (error) {
                console.error("Failed to load session", error)
                toast({ title: "Error", description: "Could not load exam session.", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [id, toast])

    useEffect(() => {
        if (timeLeft <= 0 && !loading && session) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, loading, session])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleAnswerChange = (questionId: number, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleAddGlossaryTerm = () => {
        if (!newTermSource || !newTermTarget) return
        setGlossaryTerms(prev => [...prev, { source: newTermSource, target: newTermTarget }])
        setNewTermSource("")
        setNewTermTarget("")
    }

    const handleRemoveGlossaryTerm = (index: number) => {
        setGlossaryTerms(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !confirm("Are you sure you want to submit? You cannot undo this.")) return
        if (!isAuto && !aiDisclosed) {
            toast({ title: "Action Required", description: "You must complete the AI tool disclosure before submitting.", variant: "destructive" })
            return
        }

        setSubmitting(true)
        try {
            const formattedAnswers: any[] = questions.map((q) => {
                const ansValue = answers[q.id];
                if (!ansValue) return null;

                if (q.question_type === 'mcq') {
                    return {
                        question_id: q.id,
                        selected_option_id: parseInt(ansValue)
                    };
                } else {
                    return {
                        question_id: q.id,
                        text_answer: String(ansValue)
                    };
                }
            }).filter((a) => a !== null);

            // Send answers + glossary metadata
            const payload = {
                answers: formattedAnswers,
                metadata: {
                    ai_disclosed: aiDisclosed,
                    glossary: glossaryTerms
                }
            }

            await studentAPI.submitExam(Number(id), payload)

            toast({ title: "Success", description: "Exam submitted successfully!" })
            router.push(`/student/results/${id}`)
        } catch (error: any) {
            console.error("Submit error:", error)
            toast({ title: "Error", description: error.message || "Failed to submit exam.", variant: "destructive" })
            setSubmitting(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
    if (!session || questions.length === 0) return <div className="p-10 text-center">No questions found for this exam.</div>

    const currentQ = questions[currentQIndex]
    const isTheory = currentQ.question_type === 'theory' || currentQ.question_type === 'essay';
    const isSectionB = currentQ.section === "Section B";
    const isLastQuestion = currentQIndex === questions.length - 1;

    // Word Counter Logic
    const currentAnswerText = answers[currentQ.id] || "";
    const currentWordCount = currentAnswerText.trim().split(/\s+/).filter(Boolean).length;

    // CPT Word Limits (derived from typical B1/B2 rules)
    // We enforce a warning at 800 words, and hard-cap at 1000 for standard CPT B2 instances
    const WORD_LIMIT_WARNING = 800;
    const WORD_LIMIT_MAX = 1000;
    const isOverWarning = currentWordCount > WORD_LIMIT_WARNING;
    const isOverMax = currentWordCount > WORD_LIMIT_MAX;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
            {/* Header: Timer & Progress */}
            <div className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h2 className="font-bold text-xl text-slate-800">{session.exam_title}</h2>
                    <p className="text-sm font-medium tracking-wide text-slate-500 uppercase mt-1">Section Question {currentQIndex + 1} of {questions.length}</p>
                </div>

                <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-md ${timeLeft < 300 ? 'bg-red-100 text-red-600 border border-red-200 shadow-sm shadow-red-100' : 'bg-slate-100 text-slate-700'}`}>
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Question Area */}
            <main className="flex-1 container mx-auto max-w-4xl py-8 px-4 flex flex-col gap-6">

                {/* Formatting Notification */}
                {isTheory && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm shadow-sm">
                        <FileType2 className="w-4 h-4 shrink-0 text-blue-600" />
                        <span className="font-semibold">CPT Environment Notice:</span> Whitespace, paragraph breaks, and text formatting are preserved in this editor to simulate real-world B2 professional documents.
                    </div>
                )}

                {isSectionB ? (
                    <TranslationWorkspace
                        sourceText={currentQ.question_text}
                        brief={currentQ.brief || currentQ.instructions}
                        value={answers[currentQ.id] || ""}
                        onChange={(val) => handleAnswerChange(currentQ.id, val)}
                    />
                ) : (
                    <Card className={`shadow-md border-t-4 ${isTheory ? 'border-t-orange-500' : 'border-t-indigo-600'}`}>
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <Badge variant="outline" className={`text-sm px-3 py-1 font-bold ${isTheory ? 'border-orange-200 bg-orange-100 text-orange-800' : 'border-indigo-200 bg-indigo-100 text-indigo-800'}`}>
                                    Maximum Points: {currentQ.points || (isTheory ? 10 : 2)}
                                </Badge>

                                <Badge variant="secondary" className="uppercase tracking-wider text-xs font-bold border shadow-sm">
                                    {isTheory ? "Theory / Translation" : "Multiple Choice"}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl leading-relaxed text-slate-800 font-serif">
                                {currentQ.question_text}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="pt-6">
                            {isTheory ? (
                                /* --- THEORY INPUT --- */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Your Translation</Label>

                                        {/* CPT Glossary Builder Modal */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-sm">
                                                    <Type className="w-3 h-3 mr-1.5" />
                                                    Glossary Builder ({glossaryTerms.length})
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Translation Glossary</DialogTitle>
                                                    <DialogHeader>
                                                        <DialogDescription>
                                                            Build a glossary of terms for this section to aid your translation and demonstrate terminology competence.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs">Source Term</Label>
                                                            <Input value={newTermSource} onChange={(e) => setNewTermSource(e.target.value)} placeholder="e.g. Legal framework" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs">Target Term</Label>
                                                            <Input value={newTermTarget} onChange={(e) => setNewTermTarget(e.target.value)} placeholder="e.g. Cadre juridique" />
                                                        </div>
                                                        <Button size="icon" className="shrink-0" onClick={handleAddGlossaryTerm}>
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                                                        {glossaryTerms.map((term, i) => (
                                                            <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border text-sm">
                                                                <div>
                                                                    <span className="font-semibold">{term.source}</span>
                                                                    <span className="mx-2 text-slate-400">→</span>
                                                                    <span className="text-indigo-700">{term.target}</span>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => handleRemoveGlossaryTerm(i)}>
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        {glossaryTerms.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border-dashed border rounded">No terms added yet.</p>}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <textarea
                                        className={`flex min-h-[350px] w-full rounded-md border bg-white px-4 py-3 text-base shadow-inner focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${isOverMax ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-indigo-500'}`}
                                        placeholder="Type your translation here. Paragraph formatting is preserved."
                                        value={currentAnswerText}
                                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                    />

                                    {/* Live Word Counter */}
                                    <div className="flex justify-end">
                                        <div className={`text-xs font-bold px-2.5 py-1 rounded-md border ${isOverMax ? 'bg-red-100 text-red-700 border-red-200' :
                                            isOverWarning ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            Words: {currentWordCount} / {WORD_LIMIT_MAX}
                                            {isOverMax && " (Limit Exceeded)"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* --- MCQ INPUT --- */
                                <div className="py-2">
                                    {currentQ.options && currentQ.options.length > 0 ? (
                                        <RadioGroup
                                            value={answers[currentQ.id]?.toString() || ""}
                                            onValueChange={(val) => handleAnswerChange(currentQ.id, parseInt(val))}
                                            className="space-y-3"
                                        >
                                            {currentQ.options.map((opt: any) => (
                                                <div key={opt.id} className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${answers[currentQ.id] === opt.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                                                    <RadioGroupItem value={opt.id.toString()} id={`opt-${opt.id}`} className="mt-1 border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                                    <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-medium text-slate-700 leading-relaxed text-base pt-0.5">
                                                        {opt.text}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                            No options available for this question.
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* AI Disclosure and Final Submit Section */}
                {isLastQuestion && (
                    <Card className="border-amber-200 bg-amber-50/30 shadow-sm mt-4 overflow-hidden">
                        <div className="h-1 w-full bg-amber-400"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                                <BrainCircuit className="w-5 h-5 text-amber-600" />
                                Academic Integrity & AI Disclosure
                            </CardTitle>
                            <CardDescription className="text-amber-800/80">
                                Section C2 of the CPT guidelines requires a mandatory declaration of AI tool usage.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-3 p-4 bg-white rounded-md border border-amber-100 shadow-sm">
                                <Checkbox
                                    id="ai_disclose"
                                    checked={aiDisclosed}
                                    onCheckedChange={(c) => setAiDisclosed(!!c)}
                                    className="mt-1 border-amber-300 data-[state=checked]:bg-amber-600"
                                />
                                <div className="space-y-1 leading-none">
                                    <Label htmlFor="ai_disclose" className="font-semibold text-slate-800 cursor-pointer text-sm leading-snug">
                                        I hereby declare that my answers represent my own professional competence. If any AI translation engines (e.g., DeepL, ChatGPT) were used for Section C terminology queries, I have disclosed them accurately.
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
                        onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQIndex === 0}
                    >
                        Review Previous
                    </Button>

                    {isLastQuestion ? (
                        <Button
                            size="lg"
                            className={`font-bold shadow-md transition-all ${!aiDisclosed ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
                            onClick={() => handleSubmit(false)}
                            disabled={submitting || !aiDisclosed}
                        >
                            {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                            Sign & Submit Exam
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md hover:shadow-lg transition-all"
                            onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        >
                            Save & Continue
                        </Button>
                    )}
                </div>
            </main>
        </div>
    )
}