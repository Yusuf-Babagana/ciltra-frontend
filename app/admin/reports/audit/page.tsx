"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { exportToExcel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Search, ShieldAlert, History } from "lucide-react"
import { toast } from "sonner"

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        try {
            const data = await adminAPI.getAuditLogs()
            setLogs(data)
        } catch (e) {
            toast.error("Failed to load audit logs")
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        const excelData = logs.map(log => ({
            "Date": new Date(log.timestamp).toLocaleString(),
            "Admin/User": `${log.actor_name} (${log.actor_email})`,
            "Action": log.action,
            "Target": log.target_model,
            "Details": log.details
        }))
        exportToExcel(excelData, "System_Audit_Logs")
        toast.success("Audit report downloaded")
    }

    // Helper to color-code actions
    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return "bg-green-100 text-green-800 border-green-200"
            case 'UPDATE': return "bg-blue-100 text-blue-800 border-blue-200"
            case 'DELETE': return "bg-red-100 text-red-800 border-red-200"
            case 'GRADE': return "bg-purple-100 text-purple-800 border-purple-200"
            default: return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const filteredLogs = logs.filter(log =>
        log.actor_email?.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Security trail of all administrative actions.</p>
                </div>
                <Button onClick={handleExport} variant="outline" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> Export Report
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center py-4 bg-white p-4 rounded-lg border">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                    placeholder="Search by admin email, action, or details..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading security logs...</TableCell></TableRow>
                        ) : filteredLogs.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">No logs found.</TableCell></TableRow>
                        ) : (
                            filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{log.actor_name || "System"}</div>
                                        <div className="text-xs text-muted-foreground">{log.actor_email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getActionColor(log.action)}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <span className="font-medium text-slate-600">[{log.target_model}]</span> {log.details}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}