"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Admin Candidates Error:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600">
                <AlertCircle size={32} />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Something went wrong!
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    we encountered an unexpected error while loading candidate data.
                    This has been logged for our administrative team.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={() => reset()}
                    variant="default"
                    className="bg-slate-900 hover:bg-slate-800"
                >
                    <RefreshCcw size={16} className="mr-2" />
                    Try again
                </Button>

                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                >
                    Reload page
                </Button>
            </div>

            {error.digest && (
                <p className="text-[10px] text-slate-400 font-mono">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    )
}
