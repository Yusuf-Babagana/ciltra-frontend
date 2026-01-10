"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminAPI } from "@/lib/api" // Updated import
import { Loader2, Users, FileText, Award, DollarSign, TrendingUp, Activity, ClipboardList } from "lucide-react"

interface DashboardStats {
  total_candidates: number
  total_exams: number
  total_certificates: number
  total_revenue: number
  recent_exams_taken: number
  pass_rate: number
  pending_grading: number // Added this since it is available from backend
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Use the standardized adminAPI
      const data = await adminAPI.getDashboardStats()

      // Map the backend response to the dashboard state
      setStats({
        total_candidates: data.total_candidates || 0,
        total_exams: data.total_exams || 0,
        total_certificates: data.issued_certificates || 0,
        pending_grading: data.pending_grading || 0,
        // Defaulting these to 0 as they are not yet in the backend API
        total_revenue: 0,
        recent_exams_taken: 0,
        pass_rate: 0
      })
    } catch (err) {
      console.error("[v0] Failed to fetch dashboard stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of platform performance and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_candidates || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_exams || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Available certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_grading || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_certificates || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Successful completions</p>
          </CardContent>
        </Card>

        {/* These cards display 0 for now until backend revenue logic is implemented */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_revenue || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">From exam registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Exams</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent_exams_taken || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pass_rate || 0}%</div>
            <p className="mt-1 text-xs text-muted-foreground">Overall success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/exams/new"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Create Exam</span>
            </a>
            {/* Updated link to point to Exam list for questions management */}
            <a
              href="/admin/exams"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Questions</span>
            </a>
            <a
              href="/admin/candidates"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">View Students</span>
            </a>
            <a
              href="/admin/reports"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Generate Report</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}