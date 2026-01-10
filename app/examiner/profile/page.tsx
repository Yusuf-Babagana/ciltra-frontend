"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { userAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, ArrowLeft } from "lucide-react"

export default function ExaminerProfilePage() {
    const router = useRouter()
    const { user, login } = useAuth() // We use login to update the local context after save
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        bio: ""
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data: any = await userAPI.getProfile()
                setFormData({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    email: data.email || "",
                    phone_number: data.phone_number || "",
                    bio: data.bio || ""
                })
            } catch (error) {
                console.error("Failed to load profile", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            // 1. Update on Server
            const updatedUser: any = await userAPI.updateProfile(formData)

            // 2. Update Local Context (so the header name updates immediately)
            // We need the tokens to call login(), usually stored in localStorage
            // For now, we rely on the server update.
            toast({ title: "Success", description: "Profile updated successfully." })

        } catch (error) {
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto py-10 px-6 max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">My Profile</h1>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input value={formData.email} disabled className="bg-slate-100 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                placeholder="+234..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Bio / Professional Summary</Label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about your expertise..."
                                className="h-32"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}