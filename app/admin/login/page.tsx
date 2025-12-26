"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // 1. Call Backend Login
            const response = await authAPI.login(formData)
            
            // 2. Check if user is actually an admin
            if (response.user.role !== 'admin' && !response.user.is_staff) {
                throw new Error("Access Denied: You do not have administrator privileges.")
            }

            // 3. Store tokens and redirect
            login(response)
            router.push("/admin/dashboard")
            
        } catch (err: any) {
            console.error("Login failed", err)
            setError(err.message || "Invalid email or password")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo / Header */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/50">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Secure access for CILTRA staff
                    </p>
                </div>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">Sign In</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter your credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="border-red-900/50 bg-red-900/20 text-red-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@ciltra.org"
                                    className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus:border-indigo-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus:border-indigo-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-slate-800 pt-4">
                        <p className="text-xs text-slate-500">
                            Authorized personnel only. All activities are monitored.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}