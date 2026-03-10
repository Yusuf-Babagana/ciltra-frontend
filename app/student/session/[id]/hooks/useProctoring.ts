"use client"

import { useEffect } from "react"
import { studentAPI } from "@/lib/api"
import { toast } from "sonner"

export function useProctoring(sessionId: number) {
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === "hidden") {
                // Candidate left the tab
                try {
                    await studentAPI.logIntegrityEvent(sessionId, {
                        event_type: "TAB_SWITCH",
                        details: "Candidate navigated away from the exam tab."
                    });
                    toast.warning("Warning: Navigation away from this tab is logged for the Board of Examiners.");
                } catch (error) {
                    console.error("Failed to log integrity event", error);
                }
            }
        };

        const handlePaste = async (e: ClipboardEvent) => {
            // CPT Rule: No pasting in Section B
            e.preventDefault();
            try {
                await studentAPI.logIntegrityEvent(sessionId, {
                    event_type: "PASTE_ATTEMPT",
                    details: "Candidate attempted to paste text into the workspace."
                });
                toast.error("Paste is disabled. You must type your translation manually.");
            } catch (error) {
                console.error("Failed to log integrity event", error);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("paste", handlePaste);
        };
    }, [sessionId]);
}
