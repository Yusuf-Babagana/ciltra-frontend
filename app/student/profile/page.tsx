"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Mail, Phone, MapPin, Save, Edit2 } from "lucide-react"

export default function StudentProfilePage() {
    const { user, login } = useAuth() // login is used here to update local context after save
    const { toast } = useToast()

    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        address: ""
    })

    // Load user data into form when page loads
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                phone: user.phone || "", // Assuming your User model has this
                address: user.address || "" // Assuming your User model has this
            })
        }
    }, [user])

    const handleSave = async () => {
        setLoading(true)
        try {
            // 1. Call API to update
            const updatedUser = await studentAPI.updateProfile(formData)

            // 2. Update Local Context (so the header updates immediately)
            // Note: You might need to adjust based on how your auth-context works
            // If 'login' expects tokens, we might just need to refresh the page or rely on re-fetching

            toast({ title: "Success", description: "Profile updated successfully!" })
            setIsEditing(false)
            window.location.reload() // Simple way to refresh context data
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    if (!user) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="grid md:grid-cols-3 gap-6">

                {/* Left Column: Avatar Card */}
                <Card className="md:col-span-1 shadow-sm h-fit">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="w-32 h-32 mb-4 border-4 border-slate-100">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-4xl bg-indigo-100 text-indigo-700 font-bold">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="font-bold text-xl">{user.first_name} {user.last_name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                        <div className="w-full pt-4 border-t mt-2">
                            <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Student ID</p>
                            <p className="font-mono text-sm">{user.id}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Details Form */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Personal Information</CardTitle>
                        {!isEditing && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        disabled={!isEditing}
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input disabled value={user.email} className="pl-9 bg-slate-50" />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="+234..."
                                    disabled={!isEditing}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Enter your address"
                                    disabled={!isEditing}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-3 pt-4 border-t mt-4">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}