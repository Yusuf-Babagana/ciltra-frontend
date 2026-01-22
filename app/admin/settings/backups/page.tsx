"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" // Fixed: Added missing import
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { toast } from "sonner"
import {
    Database,
    RefreshCcw,
    Download,
    History,
    Loader2,
    AlertTriangle,
    Trash,
    HardDriveDownload,
    Plus
} from "lucide-react"

export default function BackupPage() {
    const [backups, setBackups] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [restoring, setRestoring] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    const fetchBackups = async () => {
        try {
            const data = await adminAPI.getBackups()
            setBackups(data)
        } catch (error) {
            toast.error("Could not load backup list")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchBackups() }, [])

    const handleCreateBackup = async () => {
        setIsCreating(true)
        try {
            await adminAPI.createBackup()
            toast.success("New backup snapshot created successfully")
            fetchBackups()
        } catch (error) {
            toast.error("Failed to trigger backup")
        } finally {
            setIsCreating(false)
        }
    }

    const handleDownload = async (filename: string) => {
        setIsDownloading(filename)
        try {
            toast.info(`Preparing ${filename} for secure download...`)
            await adminAPI.downloadBackup(filename)
            toast.success("Download started")
        } catch (error) {
            toast.error("Download failed. Please check your connection.")
        } finally {
            setIsDownloading(null)
        }
    }

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to permanently delete ${filename}?`)) return
        try {
            await adminAPI.deleteBackup(filename)
            toast.success("Backup deleted")
            fetchBackups()
        } catch (error) {
            toast.error("Failed to delete backup")
        }
    }

    const handleRestore = async (filename: string) => {
        const confirmRestore = confirm(
            `CRITICAL: This will overwrite your current database with ${filename}. All data since this backup will be lost. Proceed?`
        )
        if (!confirmRestore) return

        setRestoring(filename)
        try {
            await adminAPI.restoreBackup(filename)
            toast.success("Database restored successfully!")
            setTimeout(() => window.location.reload(), 1500)
        } catch (error) {
            toast.error("Restore failed. Check server logs.")
        } finally {
            setRestoring(null)
        }
    }

    if (loading) return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Header />
            <main className="container mx-auto py-10 px-4">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                            <History className="text-blue-600" /> System Backups
                        </h1>
                        <p className="text-slate-500 mt-1">Manage snapshots and disaster recovery.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleCreateBackup}
                            disabled={isCreating}
                            className="bg-blue-600 hover:bg-blue-700 shadow-md"
                        >
                            {isCreating ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus className="mr-2" size={16} />}
                            Backup Now
                        </Button>
                    </div>
                </div>

                {/* Security Alert */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4 shadow-sm mb-8">
                    <AlertTriangle className="text-amber-600" size={24} />
                    <div>
                        <p className="text-xs text-amber-900 font-bold uppercase tracking-wider">Disaster Recovery Warning</p>
                        <p className="text-xs text-amber-800 font-medium">
                            Restoring will revert ALL system data (Users, Exams, Results) to the state of the selected snapshot.
                        </p>
                    </div>
                </div>

                {/* Backups Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="py-4 pl-6 text-slate-900 font-bold">Snapshot Name</TableHead>
                                <TableHead className="text-slate-900 font-bold">Type</TableHead>
                                <TableHead className="text-right pr-6 text-slate-900 font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {backups.map((file) => (
                                <TableRow key={file} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Database size={18} className="text-blue-600" />
                                            </div>
                                            <span className="font-mono text-sm font-semibold text-slate-700">{file}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 uppercase text-[10px]">
                                            SQLITE3
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 space-x-2">

                                        {/* Secure Download */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            title="Download Securely"
                                            className="text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleDownload(file)}
                                            disabled={isDownloading !== null}
                                        >
                                            {isDownloading === file ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        </Button>

                                        {/* Restore */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                            onClick={() => handleRestore(file)}
                                            disabled={restoring !== null || isDownloading !== null}
                                        >
                                            {restoring === file ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                                            Restore
                                        </Button>

                                        {/* Delete */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-300 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(file)}
                                            disabled={restoring !== null || isDownloading !== null}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {backups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <HardDriveDownload size={48} className="text-slate-200" />
                                            <p className="text-slate-400 font-medium text-lg">No backup snapshots found.</p>
                                            <p className="text-slate-300 text-sm">Click "Backup Now" to create your first snapshot.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    )
}