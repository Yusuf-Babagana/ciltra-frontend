"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login")
            } else if (user && !allowedRoles.includes(user.role)) {
                // Redirect to their respective dashboard if they don't have permission
                router.push("/dashboard")
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router])

    if (isLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}