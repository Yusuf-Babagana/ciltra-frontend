"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function CreateExamPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration_minutes: 60,
        price: 0,
        pass_mark_percentage: 50,
        category: 1 // Assuming category ID 1 exists, ideally fetch categories
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await adminAPI.createExam(formData)
            toast({ title: "Success", description: "Exam created successfully" })
            router.push("/admin/dashboard")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Certification Exam</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Exam Title</Label>
                            <Input
                                required
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                required
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duration (Minutes)</Label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.duration_minutes}
                                    onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (NGN)</Label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <Button className="w-full mt-4" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Create Exam"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}