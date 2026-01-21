"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Trash2, UserCog, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

const examinerSchema = z.object({
    first_name: z.string().min(2, "Name is required"),
    last_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type ExaminerForm = z.infer<typeof examinerSchema>

export default function ExaminersPage() {
    const [examiners, setExaminers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Initialize Form
    const form = useForm<ExaminerForm>({
        resolver: zodResolver(examinerSchema),
    })

    useEffect(() => {
        fetchExaminers()
    }, [])

    const fetchExaminers = async () => {
        try {
            const data = await adminAPI.getUsers()
            // Filter for examiners
            setExaminers(data.filter((u: any) => u.role === 'examiner'))
        } catch (e) {
            toast.error("Failed to load examiners")
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data: ExaminerForm) => {
        try {
            await adminAPI.createUser({
                ...data,
                role: 'examiner'
            })
            toast.success("Examiner account created")
            setIsCreateOpen(false)
            form.reset()
            fetchExaminers()
        } catch (e: any) {
            toast.error(e.message || "Failed to create account")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will remove their access immediately.")) return;
        try {
            await adminAPI.deleteUser(id)
            toast.success("Examiner deleted")
            setExaminers(prev => prev.filter(e => e.id !== id))
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    const filtered = examiners.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.first_name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Examiner Management</h1>
                    <p className="text-muted-foreground">Create accounts for staff members who grade theory exams.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Examiner
                </Button>
            </div>

            <div className="flex items-center py-4 bg-white p-4 rounded-lg border">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input placeholder="Search examiners..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 focus-visible:ring-0" />
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Examiner</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No examiners found.</TableCell></TableRow>
                        ) : filtered.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                                            {user.first_name[0]}{user.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                        <UserCog className="h-3 w-3 mr-1" /> Examiner
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(user.id)}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Examiner</DialogTitle>
                        <DialogDescription>Create a login for a staff member. They will only see the Grading Dashboard.</DialogDescription>
                    </DialogHeader>

                    {/* --- FIX: Use form.handleSubmit here --- */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input {...form.register("first_name")} />
                                {form.formState.errors.first_name && <p className="text-xs text-red-500">{form.formState.errors.first_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input {...form.register("last_name")} />
                                {form.formState.errors.last_name && <p className="text-xs text-red-500">{form.formState.errors.last_name.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input type="email" {...form.register("email")} />
                            {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" {...form.register("password")} />
                            {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Account</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}