"use client"

import { useEffect, useState } from "react"
import {
    Plus,
    Search,
    MoreHorizontal,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    Pencil,
    Trash2
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
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// --- Components ---

interface UserTableProps {
    users: any[]
    onEdit: (user: any) => void
    onDelete: (id: number) => void
}

function UserTable({ users, onEdit, onDelete }: UserTableProps) {
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge variant="destructive" className="flex gap-1 items-center w-fit"><ShieldAlert className="w-3 h-3" /> Admin</Badge>
            case 'examiner': return <Badge variant="default" className="bg-blue-600 flex gap-1 items-center w-fit"><ShieldCheck className="w-3 h-3" /> Examiner</Badge>
            case 'grader': return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 flex gap-1 items-center w-fit"><UserCheck className="w-3 h-3" /> Grader</Badge>
            default: return <Badge variant="outline">Candidate</Badge>
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {new Date(user.date_joining || user.date_joined).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEdit(user)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => onDelete(user.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No users found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

interface UserModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    user: any | null
    onSave: (formData: any) => Promise<void>
}

function UserModal({ isOpen, onOpenChange, user, onSave }: UserModalProps) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "examiner",
        competencies: ""
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                password: "", // Don't populate password on edit
                role: user.role || "examiner",
                competencies: user.competencies || ""
            })
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                role: "examiner",
                competencies: ""
            })
        }
    }, [user, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave(formData)
            onOpenChange(false)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        {user ? "Update user details below." : "Enter details for the new user account."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fname">First Name</Label>
                                <Input
                                    id="fname"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lname">Last Name</Label>
                                <Input
                                    id="lname"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        {!user && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="examiner">Examiner</SelectItem>
                                    <SelectItem value="grader">Grader</SelectItem>
                                    <SelectItem value="candidate">Candidate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="competencies">Competencies (Optional)</Label>
                            <Input
                                id="competencies"
                                value={formData.competencies}
                                onChange={(e) => setFormData({ ...formData, competencies: e.target.value })}
                                placeholder="e.g. English, French, Technical Writing"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : (user ? "Update User" : "Create User")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// --- Main Page Component ---

export default function UserManagementPage() {
    const { toast } = useToast()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await adminAPI.getUsers()
            setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load users list."
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (formData: any) => {
        try {
            if (editingUser) {
                await adminAPI.updateUser(editingUser.id, formData)
                toast({ title: "Success", description: "User updated successfully" })
            } else {
                await adminAPI.createUser(formData)
                toast({ title: "Success", description: "New user created" })
            }
            fetchUsers()
        } catch (error: any) {
            console.error("Operation failed", error)
            toast({
                variant: "destructive",
                title: "Failed",
                description: error.message || "Could not complete operation."
            })
            throw error // Let the modal handles progress state
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure? This action is logged.")) {
            try {
                await adminAPI.deleteUser(id)
                setUsers(users.filter(u => u.id !== id))
                toast({ title: "Success", description: "User deleted successfully" })
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Delete Failed",
                    description: error.message || "Could not delete user."
                })
            }
        }
    }

    const filteredUsers = users.filter(user =>
        (user.first_name + " " + user.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage administrators, examiners, and graders.
                    </p>
                </div>
                <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>System Users</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search users..."
                                    className="pl-8 w-[250px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <UserTable
                        users={filteredUsers}
                        onEdit={(user) => { setEditingUser(user); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                user={editingUser}
                onSave={handleSubmit}
            />
        </div>
    )
}
