"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog" // --- NEW: Dialog components
import {
  CheckCircle,
  Lock,
  Edit3,
  Trash2,
  Search,
  Filter,
  Loader2,
  Plus,
  FileText
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContentBankPage() {
  const { toast } = useToast()
  const [contentItems, setContentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // --- NEW: State for Modal/Editing ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ text: "", question_type: "MCQ", section: "Section A" })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getQuestions()
      setContentItems(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fetch Failed", description: "Could not load content." })
    } finally {
      setLoading(false)
    }
  }

  // --- NEW: Open Modal for Add or Edit ---
  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({ text: item.text || item.question_text, question_type: item.question_type, section: item.section })
    } else {
      setEditingItem(null)
      setFormData({ text: "", question_type: "MCQ", section: "Section A" })
    }
    setIsModalOpen(true)
  }

  // --- NEW: Handle Save (Create or Update) ---
  const handleSave = async () => {
    try {
      setLoading(true)
      if (editingItem) {
        await adminAPI.updateQuestion(editingItem.id, formData)
        toast({ title: "Updated", description: "Content item updated successfully." })
      } else {
        await adminAPI.createQuestion(formData)
        toast({ title: "Created", description: "New content added to bank." })
      }
      setIsModalOpen(false)
      fetchContent()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await adminAPI.approveQuestion(id)
      toast({ title: "Approved", description: "Content is now ready for use." })
      fetchContent()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Approval failed." })
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Delete this content item?")) {
      try {
        await adminAPI.deleteQuestion(id)
        setContentItems(contentItems.filter(item => item.id !== id))
        toast({ title: "Deleted", description: "Content removed." })
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: "Delete failed." })
      }
    }
  }

  // ... (getStatusBadge and filtering logic remains the same) ...
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline" className="bg-slate-50">Draft</Badge>
      case 'review': return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">In Review</Badge>
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Approved</Badge>
      case 'locked': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200 flex gap-1"><Lock size={12} /> Locked</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = (item.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.question_type || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Bank</h1>
          <p className="text-muted-foreground">Manage MCQs, Case Scenarios, and Translation Briefs.</p>
        </div>
        {/* --- FIXED: Added onClick to Add Content --- */}
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add Content
        </Button>
      </div>

      {/* ... (Bulk Upload Section remains the same) ... */}

      <Card>
        <CardHeader>
          {/* ... (Search and Filter header remains the same) ... */}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6">Content Type / Text</TableHead>
                <TableHead>Language Pair</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approver</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{item.question_type}</span>
                      <span className="text-sm font-medium line-clamp-1">{item.text || item.question_text}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.language_pair_code || "Global"}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status || 'draft')}</TableCell>
                  <TableCell>{item.approved_by_name || "—"}</TableCell>
                  <TableCell className="text-right pr-6 space-x-2">
                    {item.status !== 'approved' && (
                      <Button variant="outline" size="sm" onClick={() => handleApprove(item.id)}>Approve</Button>
                    )}
                    {/* --- FIXED: Added onClick to Edit --- */}
                    <Button variant="ghost" size="sm" onClick={() => openModal(item)}><Edit3 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- NEW: Add/Edit Dialog --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Content" : "Add New Content"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <Input
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter question text here..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="THEORY">Theory/Translation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}