"use client"

import { useState, useEffect } from "react"
import { authStorage, type User } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = authStorage.getUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const logout = () => {
    authStorage.removeTokens()
    setUser(null)
    window.location.href = "/login"
  }

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff || false,
    isLoading,
    logout,
  }
}
