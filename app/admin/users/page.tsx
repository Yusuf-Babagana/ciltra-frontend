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
    Trash2,
    UserX,
    KeyRound,
    Unlock,
    Download,
    Filter,
    RotateCcw
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
import { authStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// --- Components ---

interface UserTableProps {
    users: any[]
    viewingTrash?: boolean
    onEdit: (user: any) => void
    onDelete: (id: number) => void
    onToggleStatus: (user: any) => void
    onResetPassword: (id: number) => void
    onUnlock: (id: number) => void
    onRestore?: (id: number) => void
}

function UserTable({ users, viewingTrash, onEdit, onDelete, onToggleStatus, onResetPassword, onUnlock, onRestore }: UserTableProps) {
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
                    <TableHead>Competencies</TableHead>
                    <TableHead>Security & Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {user?.first_name || "Unknown"} {user?.last_name || "User"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{user?.email || "No Email"}</span>
                                </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                                <div className="text-xs space-y-1">
                                    {user.language_pair && <p><strong>Pair:</strong> {user.language_pair}</p>}
                                    {user.specialization && <p><strong>Spec:</strong> {user.specialization}</p>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs space-y-1">
                                    <p className="text-muted-foreground">
                                        Last Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                    </p>
                                    <p className="text-muted-foreground">IP: {user.last_login_ip || 'N/A'}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {user.is_locked_out && (
                                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 flex gap-1 items-center w-fit">
                                                Locked Out
                                            </Badge>
                                        )}
                                        {user.failed_login_attempts > 0 && (
                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                                {user.failed_login_attempts} failed attempts
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {viewingTrash ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                            onClick={() => onRestore?.(user.id)}
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" /> Restore
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={user.is_active ? "text-red-600 border-red-200 hover:bg-red-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
                                                onClick={() => onToggleStatus(user)}
                                            >
                                                {user.is_active ? <UserX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                            </Button>

                                            {user.is_locked_out && (
                                                <Button size="sm" variant="outline" onClick={() => onUnlock(user.id)}>
                                                    <Unlock className="h-4 w-4" />
                                                </Button>
                                            )}

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
                                                    <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                                                        <KeyRound className="mr-2 h-4 w-4" /> Reset Password
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
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
        language_pair: "",
        direction: "AB",
        specialization: "General"
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                password: "",
                role: user.role || "examiner",
                language_pair: user.language_pair || "",
                direction: user.direction || "AB",
                specialization: user.specialization || "General"
            })
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                role: "examiner",
                language_pair: "",
                direction: "AB",
                specialization: "General"
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
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        {user ? "Update user details and competencies below." : "Enter details for the new user account."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold border-b pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold border-b pb-2">Competencies & Settings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="lang_pair">Language Pair (e.g. EN-FR)</Label>
                                    <Input
                                        id="lang_pair"
                                        value={formData.language_pair}
                                        onChange={(e) => setFormData({ ...formData, language_pair: e.target.value })}
                                        placeholder="EN-FR"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="direction">Direction</Label>
                                    <Select
                                        value={formData.direction}
                                        onValueChange={(val) => setFormData({ ...formData, direction: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AB">A → B</SelectItem>
                                            <SelectItem value="BA">B → A</SelectItem>
                                            <SelectItem value="BOTH">Both Directions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Select
                                    value={formData.specialization}
                                    onValueChange={(val) => setFormData({ ...formData, specialization: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Medical">Medical</SelectItem>
                                        <SelectItem value="Legal">Legal</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6 pt-0 mt-0">
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
    const [roleFilter, setRoleFilter] = useState("all")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)
    const [viewingTrash, setViewingTrash] = useState(false)

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bulk-register/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${authStorage.getAccessToken()}`,
                },
            });
            const data = await res.json();

            if (res.ok) {
                toast({ title: "Bulk Registration", description: data.message });
                if (data.skipped?.length > 0) {
                    console.log("Skipped:", data.skipped);
                }
                fetchUsers();
            } else {
                toast({ variant: "destructive", title: "Upload Failed", description: data.message || "Could not register users." });
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Upload Failed", description: "Check console for details." });
        }
    };

    useEffect(() => {
        fetchUsers()
    }, [viewingTrash])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await adminAPI.getUsers(viewingTrash)
            setUsers(Array.isArray(data) ? data : [])
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
            throw error
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure? This action is logged and will remove the user from active lists.")) {
            try {
                await adminAPI.deleteUser(id)
                // Filter the UI state
                setUsers(prevUsers => prevUsers.filter(u => u.id !== id))
                // Clear editing state if the deleted user was being edited
                if (editingUser?.id === id) {
                    setEditingUser(null)
                    setIsModalOpen(false)
                }
                toast({ title: "Success", description: "User removed successfully" })
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Delete Failed",
                    description: error.message || "Could not delete user."
                })
            }
        }
    }

    const handleToggleStatus = async (user: any) => {
        const action = user.is_active ? "suspend" : "activate"
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                const response = await adminAPI.toggleUserStatus(user.id)
                if (response) {
                    // Only update state if the API confirmed success
                    setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u))
                    toast({ title: "Status Updated", description: `User has been ${action}ed.` })
                }
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message })
            }
        }
    }

    const handleResetPassword = async (id: number) => {
        if (confirm("Reset password for this user? They will receive a new temporary password.")) {
            try {
                await adminAPI.resetUserPassword(id)
                toast({ title: "Password Reset", description: "Password reset request logged and processed." })
            } catch (error: any) {
                toast({ variant: "destructive", title: "Reset Failed", description: error.message })
            }
        }
    }

    const handleUnlock = async (id: number) => {
        try {
            await adminAPI.unlockUser(id)
            setUsers(users.map(u => u.id === id ? { ...u, is_locked_out: false } : u))
            toast({ title: "Account Unlocked", description: "User can now attempt to login again." })
        } catch (error: any) {
            toast({ variant: "destructive", title: "Unlock Failed", description: error.message })
        }
    }

    const handleRestore = async (id: number) => {
        try {
            await adminAPI.restoreUser(id)
            setUsers(users.filter(u => u.id !== id)) // Remove from Trash list
            toast({ title: "Restored", description: "User is now active again." })
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        }
    }

    const handleExport = async () => {
        try {
            const blob = await adminAPI.exportUsers(roleFilter === 'all' ? undefined : roleFilter)
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast({ title: "Export Complete", description: "User list has been exported to CSV." })
        } catch (error: any) {
            toast({ variant: "destructive", title: "Export Failed", description: error.message })
        }
    }

    const filteredUsers = users.filter(user => {
        const firstName = user?.first_name || ""
        const lastName = user?.last_name || ""
        const email = user?.email || ""
        const role = user?.role || ""

        const matchesSearch = (firstName + " " + lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || role === roleFilter
        return matchesSearch && matchesRole
    })

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
                        Manage administrators, examiners, graders, and candidates.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewingTrash ? "destructive" : "outline"}
                        onClick={() => setViewingTrash(!viewingTrash)}
                    >
                        {viewingTrash ? "View Active Users" : "View Trash / Archive"}
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>
            </div>

            {!viewingTrash && (
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border">
                    <div className="flex gap-4 items-center">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold">Register Multiple Students</p>
                            <p className="text-xs text-muted-foreground">Upload a CSV (email, full_name)</p>
                        </div>
                        <input
                            type="file"
                            id="bulk-upload"
                            className="hidden"
                            accept=".csv"
                            onChange={handleBulkUpload}
                        />
                        <Button asChild variant="outline" size="sm" className="cursor-pointer">
                            <label htmlFor="bulk-upload">
                                <Plus className="mr-2 h-4 w-4" /> Bulk Upload
                            </label>
                        </Button>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle>System Users</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
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
                            <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                                <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-[150px] border-none bg-transparent h-8">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                        <SelectItem value="examiner">Examiners</SelectItem>
                                        <SelectItem value="grader">Graders</SelectItem>
                                        <SelectItem value="candidate">Candidates</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <UserTable
                        users={filteredUsers}
                        viewingTrash={viewingTrash}
                        onEdit={(user) => { setEditingUser(user); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onResetPassword={handleResetPassword}
                        onUnlock={handleUnlock}
                        onRestore={handleRestore}
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
