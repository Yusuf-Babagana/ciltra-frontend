"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileDown, FileSpreadsheet, Loader2, CheckCircle, XCircle, Filter } from "lucide-react"
import { toast } from "sonner"

export default function ExamResultsPage() {
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all") // all, passed, failed
    const [exams, setExams] = useState<any[]>([])
    const [selectedExam, setSelectedExam] = useState("all")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // 1. Fetch all graded history
            const historyData = await adminAPI.getGradedHistory()
            setResults(historyData)

            // 2. Fetch exams for the filter dropdown
            const examsData = await adminAPI.getExams()
            setExams(examsData)
        } catch (e) {
            toast.error("Failed to load results")
        } finally {
            setLoading(false)
        }
    }

    // --- ACTIONS ---

    const handleDownloadPdf = async (session: any) => {
        try {
            toast.info("Generating PDF...")
            const blob = await adminAPI.downloadResultPdf(session.id)

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Result_${session.user.first_name}_${session.exam.title}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            toast.success("PDF Downloaded")
        } catch (e) {
            toast.error("Failed to download PDF")
        }
    }

    const handleExportExcel = async () => {
        if (selectedExam === "all") {
            toast.error("Please select a specific exam to export Excel.")
            return
        }
        try {
            toast.info("Exporting Excel...")
            const blob = await adminAPI.exportExamResults(Number(selectedExam))

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            // Find exam title for filename
            const examTitle = exams.find(e => e.id.toString() === selectedExam)?.title || "Report"
            a.download = `Report_${examTitle}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            toast.success("Excel Exported")
        } catch (e) {
            toast.error("Export failed")
        }
    }

    // --- FILTERING LOGIC ---
    const filtered = results.filter(r => {
        // 1. Search (Student Name or Email)
        const matchesSearch =
            r.user.first_name.toLowerCase().includes(search.toLowerCase()) ||
            r.user.last_name.toLowerCase().includes(search.toLowerCase()) ||
            r.user.email.toLowerCase().includes(search.toLowerCase())

        // 2. Status Filter
        const matchesStatus =
            statusFilter === "all" ? true :
                statusFilter === "passed" ? r.passed :
                    !r.passed

        // 3. Exam Filter
        const matchesExam =
            selectedExam === "all" ? true :
                r.exam.id.toString() === selectedExam

        return matchesSearch && matchesStatus && matchesExam
    })

    // Calculate Stats for the current view
    const passCount = filtered.filter(r => r.passed).length
    const avgScore = filtered.length > 0
        ? (filtered.reduce((acc, curr) => acc + curr.score, 0) / filtered.length).toFixed(1)
        : 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
                    <p className="text-muted-foreground">View scores, download transcripts, and export reports.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadData}>
                        <Filter className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        disabled={selectedExam === "all"}
                        className={selectedExam === "all" ? "opacity-50" : ""}
                        title={selectedExam === "all" ? "Select an exam first" : "Export Excel"}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                </div>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Attempts</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pass Rate (Visible)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {filtered.length > 0 ? ((passCount / filtered.length) * 100).toFixed(0) : 0}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Average Score</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{avgScore}%</div></CardContent>
                </Card>
            </div>

            {/* --- FILTERS TOOLBAR --- */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border items-end md:items-center">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Search Student</label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Name or Email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="w-full md:w-[200px] space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Filter by Exam</label>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                        <SelectTrigger><SelectValue placeholder="All Exams" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Exams</SelectItem>
                            {exams.map(e => (
                                <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full md:w-[150px] space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="passed">Passed Only</SelectItem>
                            <SelectItem value="failed">Failed Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Transcript</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No results found matching your filters.</TableCell></TableRow>
                        ) : filtered.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{item.user.first_name} {item.user.last_name}</div>
                                    <div className="text-xs text-muted-foreground">{item.user.email}</div>
                                </TableCell>
                                <TableCell>{item.exam.title}</TableCell>
                                <TableCell>{new Date(item.end_time).toLocaleDateString()}</TableCell>
                                <TableCell className="font-bold text-base">{item.score}%</TableCell>
                                <TableCell>
                                    {item.passed ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
                                            <CheckCircle className="h-3 w-3" /> Passed
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 gap-1">
                                            <XCircle className="h-3 w-3" /> Failed
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(item)}>
                                        <FileDown className="h-4 w-4 mr-1 text-blue-600" /> PDF Slip
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}