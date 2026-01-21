"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Save, FileImage, Upload, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Combined State for ALL settings
    const [formData, setFormData] = useState<any>({
        site_name: "",
        support_email: "",
        maintenance_mode: false,
        default_pass_mark: 50,
        default_exam_duration: 60,
        certificate_signer_name: "",
        certificate_signer_title: "",
    })

    // File States
    const [logo, setLogo] = useState<File | null>(null)
    const [signature, setSignature] = useState<File | null>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const data = await adminAPI.getSettings()
            // Ensure we don't have nulls for text fields to avoid React warnings
            setFormData({
                ...data,
                certificate_signer_name: data.certificate_signer_name || "",
                certificate_signer_title: data.certificate_signer_title || ""
            })
        } catch (e) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            const data = new FormData()

            // 1. Append General & Exam Settings
            data.append("site_name", formData.site_name)
            data.append("support_email", formData.support_email)
            data.append("maintenance_mode", String(formData.maintenance_mode)) // Convert boolean to string
            data.append("default_pass_mark", formData.default_pass_mark)
            data.append("default_exam_duration", formData.default_exam_duration)

            // 2. Append Certificate Text
            data.append("certificate_signer_name", formData.certificate_signer_name)
            data.append("certificate_signer_title", formData.certificate_signer_title)

            // 3. Append Files (Only if selected)
            if (logo) data.append("certificate_logo", logo)
            if (signature) data.append("certificate_signature", signature)

            await adminAPI.updateSettings(data)
            toast.success("Settings saved successfully!")

            // Reset file inputs visually if needed (optional)
            setLogo(null)
            setSignature(null)

        } catch (e) {
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    // Helper to update text state
    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    if (loading) return <div className="p-10">Loading settings...</div>

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
                    <p className="text-muted-foreground">Manage global configurations, exam defaults, and certificates.</p>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-indigo-600">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">General & Exams</TabsTrigger>
                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                </TabsList>

                {/* --- TAB 1: GENERAL & EXAMS --- */}
                <TabsContent value="general" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" /> General Information
                            </CardTitle>
                            <CardDescription>Basic details about the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Site Name</Label>
                                    <Input
                                        value={formData.site_name}
                                        onChange={(e) => handleChange("site_name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input
                                        value={formData.support_email}
                                        onChange={(e) => handleChange("support_email", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Disable access for students temporarily.
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.maintenance_mode}
                                    onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Defaults</CardTitle>
                            <CardDescription>Default settings for newly created exams.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Pass Mark (%)</Label>
                                    <Input
                                        type="number"
                                        value={formData.default_pass_mark}
                                        onChange={(e) => handleChange("default_pass_mark", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Duration (Minutes)</Label>
                                    <Input
                                        type="number"
                                        value={formData.default_exam_duration}
                                        onChange={(e) => handleChange("default_exam_duration", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB 2: CERTIFICATES --- */}
                <TabsContent value="certificates" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificate Customization</CardTitle>
                            <CardDescription>Upload assets and set signer details for automatic PDF generation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Signer Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Signer Name</Label>
                                    <Input
                                        placeholder="e.g. Dr. John Doe"
                                        value={formData.certificate_signer_name}
                                        onChange={(e) => handleChange("certificate_signer_name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Signer Title</Label>
                                    <Input
                                        placeholder="e.g. Director of Studies"
                                        value={formData.certificate_signer_title}
                                        onChange={(e) => handleChange("certificate_signer_title", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Logo Upload */}
                                <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <FileImage className="h-5 w-5 text-indigo-600" />
                                        <Label className="font-semibold">Institute Logo</Label>
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Upload a high-quality PNG or JPG. Appears at the top center.
                                    </p>
                                    {logo && <p className="text-xs text-green-600 font-medium">Selected: {logo.name}</p>}
                                </div>

                                {/* Signature Upload */}
                                <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-indigo-600" />
                                        <Label className="font-semibold">Digital Signature</Label>
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSignature(e.target.files?.[0] || null)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Upload a transparent PNG. Appears above the signer's name.
                                    </p>
                                    {signature && <p className="text-xs text-green-600 font-medium">Selected: {signature.name}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}