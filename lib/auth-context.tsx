"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "./auth" // Using the new auth helper
import type { User, AuthTokens } from "./types"

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (tokens: AuthTokens) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // 1. Check for existing session on page load
        const storedUser = authStorage.getUser()
        if (storedUser) {
            setUser(storedUser)
        }
        setIsLoading(false)
    }, [])

    const login = (tokens: AuthTokens) => {
        // 2. Save tokens and update state
        authStorage.setTokens(tokens)
        setUser(tokens.user)
    }

    const logout = () => {
        // 3. Clear tokens and redirect
        authStorage.removeTokens()
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}