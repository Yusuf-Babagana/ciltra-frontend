"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SubmitAuditModal({ isOpen, onClose, onConfirm, stats }: any) {
    // stats contains: { sectionBCompleted: boolean, totalAnswered: number, totalQuestions: number }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Final Submission Review</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!stats.sectionBCompleted && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Critical Warning</AlertTitle>
                            <AlertDescription>
                                You have not completed the **Practical Translation (Section B)**.
                                This section accounts for **65%** of your total grade.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Questions Answered:</span>
                            <span className="font-bold">{stats.totalAnswered} / {stats.totalQuestions}</span>
                        </div>
                        <p className="text-muted-foreground text-xs italic">
                            Once submitted, your session will be locked and sent to the Board of Examiners for manual grading.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Return to Exam</Button>
                    <Button onClick={onConfirm} className="bg-emerald-600">Lock & Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
