"use client"

import { useEffect, useState } from "react"
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Languages,
    ArrowRight,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// --- Components ---

interface LanguagePairModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    pair: any | null
    onSave: () => void
}

function LanguagePairModal({ isOpen, onOpenChange, pair, onSave }: LanguagePairModalProps) {
    const { toast } = useToast()
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        source_language: "",
        target_language: "",
        pair_code: "" // Often generated or manual, e.g. "EN-FR"
    })

    useEffect(() => {
        if (pair) {
            setFormData({
                source_language: pair.source_language || "",
                target_language: pair.target_language || "",
                pair_code: pair.pair_code || ""
            })
        } else {
            setFormData({
                source_language: "",
                target_language: "",
                pair_code: ""
            })
        }
    }, [pair, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (pair) {
                await adminAPI.updateLanguagePair(pair.id, formData)
                toast({ title: "Success", description: "Language pair updated successfully." })
            } else {
                await adminAPI.createLanguagePair(formData)
                toast({ title: "Success", description: "Language pair created successfully." })
            }
            onSave()
            onOpenChange(false)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to save language pair."
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{pair ? "Edit Language Pair" : "Add New Language Pair"}</DialogTitle>
                        <DialogDescription>
                            Define the translation direction and unique pair code.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="source_language">Source Language</Label>
                            <Input
                                id="source_language"
                                placeholder="e.g. English"
                                value={formData.source_language}
                                onChange={(e) => setFormData({ ...formData, source_language: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="target_language">Target Language</Label>
                            <Input
                                id="target_language"
                                placeholder="e.g. French"
                                value={formData.target_language}
                                onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pair_code">Pair Code (e.g. EN-FR)</Label>
                            <Input
                                id="pair_code"
                                placeholder="Unique code"
                                value={formData.pair_code}
                                onChange={(e) => setFormData({ ...formData, pair_code: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {pair ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// --- Main Page ---

export default function LanguagePairsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [pairs, setPairs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPair, setEditingPair] = useState<any | null>(null)

    const fetchPairs = async () => {
        try {
            setLoading(true)
            const data = await adminAPI.getLanguagePairs()
            setPairs(Array.isArray(data) ? data : [])
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Fetch Failed",
                description: error.message || "Could not load language pairs."
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPairs()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this language pair? This may affect existing exams.")) return

        try {
            await adminAPI.deleteLanguagePair(id)
            setPairs(prev => prev.filter(p => p.id !== id))
            toast({ title: "Deleted", description: "Language pair removed." })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message
            })
        }
    }

    const filteredPairs = pairs.filter(p =>
        p.pair_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.source_language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.target_language?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading && pairs.length === 0) return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Language Pairs</h1>
                    <p className="text-muted-foreground">
                        Manage supported translation directions for exams and content.
                    </p>
                </div>
                <Button onClick={() => { setEditingPair(null); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Pair
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search pairs..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pair Code</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead></TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPairs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No language pairs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPairs.map((pair) => (
                                    <TableRow key={pair.id}>
                                        <TableCell className="font-bold text-indigo-600">{pair.pair_code}</TableCell>
                                        <TableCell>{pair.source_language}</TableCell>
                                        <TableCell><ArrowRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                                        <TableCell>{pair.target_language}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setEditingPair(pair); setIsModalOpen(true); }}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(pair.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <LanguagePairModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                pair={editingPair}
                onSave={fetchPairs}
            />
        </div>
    )
}
