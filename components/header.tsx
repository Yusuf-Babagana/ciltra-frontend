"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, LayoutDashboard, Shield } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()

  return (
    // Increased header height slightly to h-20 to accommodate bigger logo
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-20 items-center justify-between">

        {/* LEFT SIDE: Bigger Logo & Brand */}
        <Link href="/" className="flex items-center gap-3">
          {/* Increased size: h-12/w-12 mobile, h-16/w-16 desktop */}
          <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-md">
            <Image
              src="data:image/jpeg;base64,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"
              alt="CILTRA Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold"></span>
        </Link>

        {/* RIGHT SIDE: Navigation & Auth */}
        <nav className="flex items-center gap-6">
          <Link
            href="/exams"
            className={`text-sm font-medium transition-colors hover:text-blue-800 ${pathname === "/exams" ? "text-blue-700 font-bold" : "text-blue-600 dark:text-blue-400"
              }`}
          >
            Examinations
          </Link>
          <Link
            href="/verify"
            className={`text-sm font-medium transition-colors hover:text-blue-800 ${pathname === "/verify" ? "text-blue-700 font-bold" : "text-blue-600 dark:text-blue-400"
              }`}
          >
            Verify Certificate
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-blue-600 dark:text-blue-400">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.first_name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}