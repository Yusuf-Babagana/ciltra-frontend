"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api" // Import from centralized API
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Mail, Award, Activity, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Candidate {
  id: number
  email: string
  first_name: string
  last_name: string
  exams_taken: number
  certificates_earned: number
  last_activity: string
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      // Use the centralized API call
      const data = await adminAPI.getCandidates()
      setCandidates(data)
    } catch (err: any) {
      console.error("Failed to fetch candidates:", err)
      setError("Failed to load candidates. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCandidates = candidates.filter(
    (c) =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidate Management</h1>
        <p className="mt-2 text-muted-foreground">View and manage registered candidates</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search candidates by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md bg-white"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">No candidates found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {candidate.first_name} {candidate.last_name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate max-w-[150px]" title={candidate.email}>{candidate.email}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Exams Taken
                    </span>
                    <span className="font-medium">{candidate.exams_taken}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Award className="h-4 w-4" /> Certificates
                    </span>
                    <span className="font-medium">{candidate.certificates_earned}</span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <Badge variant="secondary" className="w-full justify-center">
                        Active: {new Date(candidate.last_activity).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}