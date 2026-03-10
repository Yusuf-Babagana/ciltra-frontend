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

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getQuestions()
      setContentItems(data)
    } catch (error) {
      console.error("Failed to fetch content", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load Content Bank."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await adminAPI.uploadQuestions(formData);
      toast({
        title: "Success",
        description: "Bulk questions uploaded and pending review."
      });
      fetchContent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not process CSV file."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await adminAPI.getQuestionTemplate()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `question_template.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast({ title: "Ready", description: "Question template downloaded." })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error.message
      })
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await adminAPI.approveQuestion(id)
      toast({
        title: "Content Approved",
        description: "The item has been approved and is ready for use."
      })
      fetchContent()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to approve content."
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Delete this content item? This action is logged.")) {
      try {
        await adminAPI.deleteQuestion(id)
        setContentItems(contentItems.filter(item => item.id !== id))
        toast({ title: "Deleted", description: "Content removed from bank." })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error.message || "Failed to delete item."
        })
      }
    }
  }

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
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Content
        </Button>
      </div>

      <div className="bg-indigo-50/50 p-6 rounded-lg border-2 border-dashed border-indigo-200 text-center">
        <h3 className="text-lg font-semibold mb-1">Bulk Question Import</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a CSV with columns: <strong>question_type</strong>, <strong>question_text</strong>, <strong>language_pair</strong>, etc.
        </p>
        <input
          type="file"
          id="bulk-question-upload"
          className="hidden"
          accept=".csv"
          onChange={handleBulkUpload}
        />
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline" className="cursor-pointer border-indigo-200 hover:bg-indigo-50">
            <label htmlFor="bulk-question-upload">
              <Plus className="mr-2 h-4 w-4 text-indigo-600" /> Select CSV File
            </label>
          </Button>

          <Button
            variant="ghost"
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
            onClick={handleTemplateDownload}
          >
            <FileText className="mr-2 h-4 w-4" /> Download Template (CSV)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>System Content</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search content..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                <select
                  className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Lifecycle</option>
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
          </div>
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
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="animate-spin mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading Content Bank...</p>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 max-w-md">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.question_type}</span>
                        <span className="text-sm font-medium line-clamp-1">{item.text || item.question_text}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{item.language_pair_code || item.language_pair || "Global"}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status || 'draft')}</TableCell>
                    <TableCell className="text-xs text-muted-foreground italic">
                      {item.approved_by_name || "—"}
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      {item.status !== 'approved' && item.status !== 'locked' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                      )}
                      <Button variant="ghost" size="sm"><Edit3 size={14} /></Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No content found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
