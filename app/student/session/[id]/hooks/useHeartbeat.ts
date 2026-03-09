"use client"

import { useEffect, useRef } from "react"
import { studentAPI } from "@/lib/api"

export function useHeartbeat(sessionId: number, currentQuestionId: number, content: string) {
    const lastSavedContent = useRef(content);
    const currentContentRef = useRef(content);

    useEffect(() => {
        currentContentRef.current = content;
    }, [content]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const currentContent = currentContentRef.current;
            // Only sync if content has actually changed since last heartbeat
            if (currentContent !== lastSavedContent.current && currentContent.length > 0) {
                try {
                    await studentAPI.syncHeartbeat(sessionId, {
                        question_id: currentQuestionId,
                        text_answer: currentContent
                    });
                    lastSavedContent.current = currentContent;
                    console.log("CPT Heartbeat: Translation progress synced.");
                } catch (e) {
                    console.warn("Heartbeat failed. Retrying in 30s...");
                }
            }
        }, 30000); // 30-second heartbeat

        return () => clearInterval(interval);
    }, [sessionId, currentQuestionId]);
}
