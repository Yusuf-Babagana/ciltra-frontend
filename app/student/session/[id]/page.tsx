"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Clock,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    BrainCircuit,
    FileType2,
    Type,
    Plus,
    X,
    Loader2
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import TranslationWorkspace from "../components/TranslationWorkspace"
import SubmitAuditModal from "../components/SubmitModal"
import { useHeartbeat } from "./hooks/useHeartbeat"
import { useProctoring } from "./hooks/useProctoring"

export default function ExamSessionPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [session, setSession] = useState<any>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [answers, setAnswers] = useState<Record<number, any>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // CPT Specific State
    const [aiDisclosed, setAiDisclosed] = useState(false)
    const [glossaryTerms, setGlossaryTerms] = useState<{ source: string, target: string }[]>([])
    const [newTermSource, setNewTermSource] = useState("")
    const [newTermTarget, setNewTermTarget] = useState("")

    // Modal State
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

    useEffect(() => {
        fetchSession()
    }, [id])

    // --- 1. Global Countdown Logic ---
    useEffect(() => {
        if (timeLeft <= 0 && session && !isLoading) {
            // Only auto-submit if time actually ran out and session is loaded
            handleAutoSubmit()
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft, session, isLoading])

    const fetchSession = async () => {
        try {
            const data = await studentAPI.getSession(Number(id))
            setSession(data)
            setTimeLeft(data.time_remaining_seconds)

            // Initialize answer state from existing session data
            const initial: Record<number, any> = {}
            if (data.questions) {
                data.questions.forEach((q: any) => {
                    initial[q.id] = q.current_answer || ""
                })
            }
            setAnswers(initial)
        } catch (error) {
            console.error("Failed to load session", error)
            toast({ title: "Error", description: "Could not load exam session.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    // --- 2. Heartbeat Integration ---
    const currentQuestion = session?.questions?.[currentQuestionIndex]
    useHeartbeat(
        Number(id),
        currentQuestion?.id,
        currentQuestion?.section === "Section B" ? answers[currentQuestion.id] : ""
    )

    // Security Monitoring
    useProctoring(Number(id))

    const handleAutoSubmit = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        try {
            await performSubmit()
            router.push(`/student/results/${id}`)
        } catch (e) {
            console.error("Auto-submit failed", e)
        } finally {
            setIsSubmitting(false)
        }
    }

    const performSubmit = async () => {
        const formattedAnswers = session.questions.map((q: any) => {
            const val = answers[q.id]
            if (!val) return null

            if (q.question_type === 'mcq') {
                return { question_id: q.id, selected_option_id: parseInt(val) }
            } else {
                return { question_id: q.id, text_answer: String(val) }
            }
        }).filter((a: any) => a !== null)

        const payload = {
            answers: formattedAnswers,
            metadata: {
                ai_disclosed: aiDisclosed,
                glossary: glossaryTerms
            }
        }

        await studentAPI.submitExam(Number(id), payload)
    }

    const handleManualSubmit = async () => {
        setIsSubmitting(true)
        try {
            await performSubmit()
            toast({ title: "Success", description: "Exam submitted successfully!" })
            router.push(`/student/results/${id}`)
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to submit.", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
            setIsSubmitModalOpen(false)
        }
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

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600 h-8 w-8" /> <span className="ml-3 text-slate-600 font-medium">Initializing Secure Environment...</span></div>
    if (!session) return <div className="p-10 text-center">No session data found.</div>

    const isLast15 = timeLeft < 900
    const isLast5 = timeLeft < 300
    const isSectionB = currentQuestion?.section === "Section B"
    const isTheory = currentQuestion?.question_type === 'theory' || currentQuestion?.question_type === 'essay'
    const isLastQuestion = currentQuestionIndex === session.questions.length - 1

    // Stats for the Submit Modal
    const sectionBQuestions = session.questions.filter((q: any) => q.section === "Section B")
    const sectionBCompleted = sectionBQuestions.every((q: any) => answers[q.id] && answers[q.id].trim().length > 0)
    const totalAnswered = Object.values(answers).filter(val => val && String(val).trim().length > 0).length

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* SIDEBAR: Exam Map */}
            <aside className="w-80 bg-white border-r flex flex-col shadow-lg z-20">
                <div className="p-6 border-b bg-indigo-900 text-white shadow-inner">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className={`h-6 w-6 ${isLast5 ? 'animate-pulse text-red-400' : 'text-indigo-300'}`} />
                        <span className={`text-2xl font-black tabular-nums tracking-tighter ${isLast5 ? 'text-red-400' : ''}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-indigo-300 tracking-widest">
                            <span>Overall Progress</span>
                            <span>{Math.round((totalAnswered / session.questions.length) * 100)}%</span>
                        </div>
                        <Progress value={(totalAnswered / session.questions.length) * 100} className="h-1.5 bg-indigo-950" />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {["Section A", "Section B", "Section C"].map(section => {
                            const sectionQuestions = session.questions.filter((q: any) => q.section === section)
                            if (sectionQuestions.length === 0) return null

                            return (
                                <div key={section} className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{section}</h4>
                                    {sectionQuestions.map((q: any) => {
                                        const qIdx = session.questions.indexOf(q)
                                        const isActive = currentQuestion.id === q.id
                                        const isAnswered = answers[q.id] && String(answers[q.id]).trim().length > 0

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentQuestionIndex(qIdx)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all duration-200 border ${isActive
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-sm'
                                                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] ${isActive ? 'bg-indigo-600 text-white' : isAnswered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                                        }`}>
                                                        {qIdx + 1}
                                                    </span>
                                                    <span className="truncate max-w-[140px]">
                                                        {q.question_type === 'mcq' ? 'Knowledge Check' : isSectionB ? 'Translation Task' : 'Theory / Ethics'}
                                                    </span>
                                                </div>
                                                {isAnswered && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                {/* Sidebar Footer */}
                <div className="p-4 border-t bg-slate-50/50">
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold h-11"
                        onClick={() => setIsSubmitModalOpen(true)}
                    >
                        Final Review & Submit
                    </Button>
                </div>
            </aside>

            {/* MAIN WORKSPACE */}
            <main className="flex-1 flex flex-col relative">
                <header className="h-16 bg-white border-b px-8 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 uppercase tracking-widest text-[10px] font-bold px-3 py-1">
                            {currentQuestion.section}
                        </Badge>
                        <h1 className="font-serif text-slate-800 font-medium hidden md:block">{session.exam_title}</h1>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-lg font-semibold"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            className="h-9 px-4 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(session.questions.length - 1, prev + 1))}
                            disabled={isLastQuestion}
                        >
                            Next
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-9 px-4 rounded-lg font-bold shadow-sm"
                            onClick={() => setIsSubmitModalOpen(true)}
                        >
                            Finish Exam
                        </Button>
                    </div>
                </header>

                <div className="p-8 flex-1 overflow-y-auto bg-slate-50/30">
                    {/* CPT Environment Notice */}
                    {isTheory && !isSectionB && (
                        <div className="max-w-4xl mx-auto mb-6 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm shadow-sm">
                            <FileType2 className="w-4 h-4 shrink-0 text-blue-600" />
                            <span className="font-semibold">Professional Editor:</span> Whitespace and formatting are preserved here for technical documentation accuracy.
                        </div>
                    )}

                    {isSectionB ? (
                        <div className="max-w-6xl mx-auto">
                            <TranslationWorkspace
                                sourceText={currentQuestion.question_text}
                                brief={currentQuestion.brief || currentQuestion.instructions}
                                value={answers[currentQuestion.id] || ""}
                                onChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
                            />
                        </div>
                    ) : (
                        <Card className="max-w-4xl mx-auto shadow-sm border-t-4 border-t-indigo-500 overflow-hidden">
                            <CardHeader className="bg-white border-b pb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Badge variant="outline" className="text-xs font-bold text-slate-400">
                                        MAXIMUM POINTS: {currentQuestion.points || 5}
                                    </Badge>
                                    <Badge className="bg-slate-800 text-white text-[10px] font-bold">
                                        {isTheory ? "THEORY / ESSAY" : "MULTIPLE CHOICE"}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl font-serif text-slate-800 leading-normal">
                                    {currentQuestion.question_text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                {isTheory ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Essay Response</Label>

                                            {/* Glossary Builder (Available for Theory too) */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                                                        <Type className="h-3 w-3 mr-1.5" />
                                                        Glossary Tool ({glossaryTerms.length})
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Term Glossary Builder</DialogTitle>
                                                        <DialogDescription>
                                                            Use this to maintain consistency in your technical or professional responses.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="flex items-end gap-2">
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="text-xs">Source Term</Label>
                                                                <Input value={newTermSource} onChange={(e) => setNewTermSource(e.target.value)} placeholder="Source Term" />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="text-xs">Translation</Label>
                                                                <Input value={newTermTarget} onChange={(e) => setNewTermTarget(e.target.value)} placeholder="Translation" />
                                                            </div>
                                                            <Button size="icon" onClick={handleAddGlossaryTerm} className="bg-indigo-600"><Plus className="h-4 w-4" /></Button>
                                                        </div>
                                                        <ScrollArea className="h-[200px] border rounded-md p-2">
                                                            {glossaryTerms.map((term, i) => (
                                                                <div key={i} className="flex items-center justify-between bg-white p-2 mb-2 rounded border text-sm">
                                                                    <span><span className="font-bold">{term.source}</span> → <span className="text-indigo-600">{term.target}</span></span>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveGlossaryTerm(i)}><X className="h-3 w-3" /></Button>
                                                                </div>
                                                            ))}
                                                        </ScrollArea>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <textarea
                                            className="w-full min-h-[400px] p-6 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-serif text-lg leading-relaxed shadow-inner"
                                            placeholder="Type your professional response here..."
                                            value={answers[currentQuestion.id] || ""}
                                            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <RadioGroup
                                        value={answers[currentQuestion.id]?.toString() || ""}
                                        onValueChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
                                        className="space-y-3"
                                    >
                                        {currentQuestion.options?.map((opt: any) => (
                                            <div key={opt.id} className={`flex items-start space-x-3 border-2 p-5 rounded-2xl cursor-pointer transition-all ${answers[currentQuestion.id] == opt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 hover:bg-slate-50'}`}>
                                                <RadioGroupItem value={opt.id.toString()} id={`opt-${opt.id}`} className="mt-1" />
                                                <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-medium text-slate-700 leading-relaxed text-lg pt-0.5">
                                                    {opt.text}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Disclosure Section (Only on last question) */}
                    {isLastQuestion && (
                        <Card className="max-w-4xl mx-auto border-amber-200 bg-amber-50/20 mt-8 mb-20 overflow-hidden">
                            <div className="h-1 bg-amber-400 w-full" />
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                                    <BrainCircuit className="h-5 w-5 text-amber-600" />
                                    Certification Ethics & AI Declaration
                                </CardTitle>
                                <CardDescription className="text-amber-800/70">
                                    In accordance with CILTRA C2 Guidelines, candidates must declare if any AI assistance was used for terminology lookups.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                                    <Checkbox
                                        id="ai_disclose"
                                        checked={aiDisclosed}
                                        onCheckedChange={(c) => setAiDisclosed(!!c)}
                                        className="mt-1 border-amber-300 data-[state=checked]:bg-amber-600"
                                    />
                                    <Label htmlFor="ai_disclose" className="font-medium text-slate-800 leading-relaxed cursor-pointer text-sm">
                                        I declare that this work represents my own translation competence. I have not used unauthorized machine translation engines for large blocks of text, and any terminology tools used in Section C have been ethical.
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Navigation Bar */}
                <footer className="h-16 bg-white border-t px-8 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                        Question {currentQuestionIndex + 1} of {session.questions.length}
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none border-slate-300 text-slate-600 font-bold"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous Task
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                className={`flex-1 sm:flex-none font-black shadow-md ${!aiDisclosed ? 'bg-slate-300 opacity-50' : 'bg-green-600 hover:bg-green-700'}`}
                                disabled={!aiDisclosed || isSubmitting}
                                onClick={() => setIsSubmitModalOpen(true)}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Submit Final Portfolio
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(session.questions.length - 1, prev + 1))}
                            >
                                Save & Continue <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </footer>
            </main>

            {/* MODALS */}
            <SubmitAuditModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onConfirm={handleManualSubmit}
                stats={{ sectionBCompleted, totalAnswered, totalQuestions: session.questions.length }}
            />
        </div>
    )
}