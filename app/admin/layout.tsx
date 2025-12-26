"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  Loader2,
  Menu,
  Bell,
  Search,
  ShieldCheck,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Generate dynamic breadcrumbs based on path
  const pathSegments = pathname.split('/').filter(Boolean).slice(1) // remove 'admin'

  useEffect(() => {
    // 1. Skip check for the login page itself
    if (pathname === "/admin/login") {
      setIsAuthorized(true)
      return
    }

    if (!isLoading) {
      // 2. Strict Role Check
      if (!user || (user.role !== "admin" && !user.is_staff)) {
        router.push("/admin/login")
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, isLoading, router, pathname])

  // --- LOADING STATE ---
  if (isLoading || !isAuthorized) {
    if (pathname === "/admin/login") return <>{children}</>

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="p-4 rounded-full bg-indigo-50 animate-pulse">
          <ShieldCheck className="h-10 w-10 text-indigo-600" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Verifying Admin Privileges...</p>
      </div>
    )
  }

  // --- LOGIN PAGE (Full Screen) ---
  if (pathname === "/admin/login") {
    return (
      <main className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center">
        {/* Abstract background blobs for visual flair */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="relative z-10 w-full">
          {children}
        </div>
      </main>
    )
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">

      {/* 1. SIDEBAR (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <AdminSidebar />
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">

        {/* 2.1 HEADER (Sticky) */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:shadow-none">

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs (Desktop & Mobile) */}
          <div className="flex-1 hidden md:block">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.map((segment, index) => (
                  <div key={segment} className="flex items-center">
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {index === pathSegments.length - 1 ? (
                        <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={`/admin/${segment}`} className="capitalize">
                          {segment}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Search */}
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>

          {/* User & Notification Menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || ""} alt={user?.first_name} />
                    <AvatarFallback>{user?.first_name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 2.2 PAGE CONTENT */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}