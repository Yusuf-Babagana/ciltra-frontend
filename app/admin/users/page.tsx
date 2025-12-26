"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search, Trash2, Edit, User as UserIcon } from "lucide-react"

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const { toast } = useToast()

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        email: "", first_name: "", last_name: "", role: "candidate", password: ""
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const data = await adminAPI.getUsers()
            setUsers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingUser) {
                await adminAPI.updateUser(editingUser.id, formData)
                toast({ title: "Updated", description: "User updated successfully" })
            } else {
                await adminAPI.createUser(formData)
                toast({ title: "Created", description: "User created successfully" })
            }
            setIsDialogOpen(false)
            fetchUsers()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return
        try {
            await adminAPI.deleteUser(id)
            setUsers(users.filter(u => u.id !== id))
            toast({ title: "Deleted", description: "User removed." })
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
        }
    }

    const openEdit = (user: any) => {
        setEditingUser(user)
        setFormData({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            password: "" // Keep empty unless changing
        })
        setIsDialogOpen(true)
    }

    const openCreate = () => {
        setEditingUser(null)
        setFormData({ email: "", first_name: "", last_name: "", role: "candidate", password: "" })
        setIsDialogOpen(true)
    }

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage Admins, Examiners, and Candidates</p>
                </div>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add User</Button>
            </div>

            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {isLoading ? <Loader2 className="animate-spin" /> : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers.map(user => (
                        <Card key={user.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {user.first_name} {user.last_name}
                                </CardTitle>
                                <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground truncate mt-1">{user.email}</div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="candidate">Candidate</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="examiner">Examiner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Password {editingUser && "(Leave blank to keep current)"}</Label>
                            <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} />
                        </div>
                        <Button type="submit" className="w-full">{editingUser ? "Update User" : "Create User"}</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}