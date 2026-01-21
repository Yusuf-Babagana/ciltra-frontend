"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, PlusCircle, History, Loader2, CheckCircle, Power, Ban, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CandidatesPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // History & Reset State
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userHistory, setUserHistory] = useState<any[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Assign Exam State
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers()
      setUsers(data.filter((u: any) => u.role === 'candidate' || u.role === 'student'))
    } catch (e) {
      toast.error("Failed to load candidates")
    } finally {
      setLoading(false)
    }
  }

  // --- FIX: Logic to Toggle Suspend/Activate ---
  const handleToggleStatus = async (user: any) => {
    // Treat undefined as active (true) to prevent UI bugs
    const currentStatus = user.is_active !== false;
    const action = currentStatus ? "suspend" : "activate";

    if (!confirm(`Are you sure you want to ${action} ${user.first_name}?`)) return;

    try {
      await adminAPI.updateUser(user.id, { is_active: !currentStatus })
      toast.success(`User ${action}ed successfully`)
      fetchUsers()
    } catch (e) {
      toast.error("Failed to update status")
    }
  }

  const handleViewHistory = async (user: any) => {
    setSelectedUser(user)
    setIsHistoryOpen(true)
    setLoadingHistory(true)
    try {
      const allHistory = await adminAPI.getGradedHistory()
      setUserHistory(allHistory.filter((h: any) => h.user.id === user.id))
    } catch (e) {
      toast.error("Failed to load history")
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleResetAttempt = async (sessionId: number) => {
    if (!confirm("Are you sure? This will DELETE the student's answers and score.")) return;
    try {
      await adminAPI.resetSession(sessionId)
      toast.success("Attempt reset successfully.")
      setUserHistory(prev => prev.filter(h => h.id !== sessionId))
    } catch (e) {
      toast.error("Failed to reset session")
    }
  }

  const openAssignModal = async (user: any) => {
    setSelectedUser(user)
    setIsAssignOpen(true)
    if (exams.length === 0) {
      try {
        const eData = await adminAPI.getExams()
        setExams(eData)
      } catch (e) {
        toast.error("Could not load exams")
      }
    }
  }

  const handleAssignExam = async () => {
    if (!selectedExamId || !selectedUser) return;
    try {
      await adminAPI.assignExamToStudent(selectedExamId, selectedUser.email)
      toast.success(`Exam assigned to ${selectedUser.first_name}`)
      setIsAssignOpen(false)
    } catch (e) {
      toast.error("Failed to assign exam.")
    }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Management</h1>
          <p className="text-muted-foreground">Manage student enrollments, status, and history.</p>
        </div>
      </div>

      <div className="flex items-center py-4 bg-white p-4 rounded-lg border">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 focus-visible:ring-0" />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No candidates found.</TableCell></TableRow>
            ) : (
              filtered.map((user) => {
                // --- FIX: Logic to correctly identify suspended users ---
                const isSuspended = user.is_active === false;

                return (
                  <TableRow key={user.id} className={isSuspended ? "bg-red-50/50" : ""}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                          {user.first_name[0]}{user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                        {isSuspended && <span className="ml-2 text-xs text-red-600 font-bold">(SUSPENDED)</span>}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {!isSuspended ? (
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 gap-1">
                          <CheckCircle className="h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="h-3 w-3" /> Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={!isSuspended ? "Suspend User" : "Activate User"}
                          onClick={() => handleToggleStatus(user)}
                          className={!isSuspended ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => handleViewHistory(user)}>
                          <History className="h-4 w-4 mr-1" /> History
                        </Button>
                        <Button size="sm" variant="default" onClick={() => openAssignModal(user)}>
                          <PlusCircle className="h-4 w-4 mr-1" /> Assign Exam
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- HISTORY & RESET MODAL --- */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Exam History: {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
            <DialogDescription>View past attempts or reset a session.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingHistory ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : userHistory.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded border border-dashed text-muted-foreground">No exams found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userHistory.map(h => (
                    <TableRow key={h.id}>
                      <TableCell>{h.exam.title}</TableCell>
                      <TableCell>{new Date(h.end_time).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">{h.score}%</TableCell>
                      <TableCell><Badge variant={h.passed ? "default" : "destructive"}>{h.passed ? "Passed" : "Failed"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleResetAttempt(h.id)}>
                          <RotateCcw className="h-4 w-4 mr-1" /> Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ASSIGN MODAL --- */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Exam</DialogTitle>
            <DialogDescription>Grant free access to {selectedUser?.first_name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select onValueChange={setSelectedExamId}>
              <SelectTrigger><SelectValue placeholder="Choose exam..." /></SelectTrigger>
              <SelectContent>
                {exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded border border-blue-100">User will bypass payment.</div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignExam}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}