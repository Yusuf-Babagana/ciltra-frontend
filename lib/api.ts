// lib/api.ts

import { authStorage } from "./auth"
import type { User, AuthResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cpt-cpt.ciltra.org";

async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authStorage.getAccessToken()

    // Check if we are sending a file (FormData)
    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
        // Only set JSON content type if it's NOT a file upload
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers as Record<string, string>),
    }

    // Remove Content-Type header for FormData (browser sets it automatically with boundary)
    if (isFormData) {
        delete headers["Content-Type"]
    }

    const config: RequestInit = {
        ...options,
        headers,
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

        // Handle 204 No Content (Delete operations)
        if (response.status === 204) {
            return {} as T
        }

        if (!response.ok) {
            // Handle 401 Unauthorized globally
            if (response.status === 401) {
                authStorage.removeTokens()
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
                throw new Error("Session expired. Please login again.")
            }

            // Try to parse error response
            let errorData: any = {}
            try {
                const text = await response.text()
                errorData = text ? JSON.parse(text) : {}
            } catch {
                errorData = {}
            }

            console.error("API Error Response:", response.status, errorData)

            const errorMessage = errorData.detail || errorData.message ||
                errorData.error || `HTTP ${response.status}: ${response.statusText}`
            throw new Error(errorMessage)
        }

        // Handle empty responses
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
            return response.json() as Promise<T>
        } else if (contentType && contentType.includes("application/pdf")) {
            // For PDF responses, return blob
            return response.blob() as unknown as Promise<T>
        } else {
            return response.text() as unknown as Promise<T>
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("API Request Failed:", error.message)
            throw error
        }
        throw new Error("Network error or request failed")
    }
}

// Create a GET helper
const get = <T>(endpoint: string) => apiClient<T>(endpoint, { method: "GET" })

// Create a POST helper
const post = <T>(endpoint: string, data?: any, isFormData = false) => {
    const body = isFormData ? data : data ? JSON.stringify(data) : undefined
    return apiClient<T>(endpoint, {
        method: "POST",
        body,
        headers: isFormData ? {} : undefined
    })
}

// Create a PUT helper
const put = <T>(endpoint: string, data?: any) =>
    apiClient<T>(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined
    })

// Create a PATCH helper
const patch = <T>(endpoint: string, data?: any) =>
    apiClient<T>(endpoint, {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined
    })

// Create a DELETE helper
const del = <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" })

export const authAPI = {
    register: (userData: any): Promise<User> =>
        post<User>("/auth/register/", userData),

    login: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
        post<AuthResponse>("/auth/login/", {
            username: credentials.email,
            email: credentials.email,
            password: credentials.password
        }),

    logout: () => {
        authStorage.removeTokens()
        if (typeof window !== "undefined") {
            window.location.href = "/"
        }
    },

    // Add refresh token if needed
    refreshToken: (refreshToken: string): Promise<AuthResponse> =>
        post<AuthResponse>("/auth/token/refresh/", { refresh: refreshToken }),
}

export const adminAPI = {
    // --- Dashboard Stats ---
    getDashboardStats: () =>
        get<{
            total_exams: number;
            total_candidates: number;
            pending_grading: number;
            issued_certificates: number;
        }>("/admin/stats/"),

    // --- User Management ---
    getUsers: () => get<any[]>("/users/"),
    createUser: (userData: any) => post<any>("/users/", userData),
    updateUser: (id: number, userData: any) => patch<any>(`/users/${id}/`, userData),
    deleteUser: (id: number) => del<any>(`/users/${id}/`),

    // --- Candidates ---
    getCandidates: () => get<any[]>("/admin/candidates/"),

    // --- Exam Management ---
    getExams: () => get<any[]>("/exams/"),
    createExam: (examData: any) => post<any>("/exams/", examData),
    updateExam: (id: string | number, examData: any) => put<any>(`/exams/${id}/`, examData),
    deleteExam: (id: string | number) => del<any>(`/exams/${id}/`),

    // --- Question Assignment ---
    assignQuestionsToExam: (examId: string | number, questionIds: number[]) =>
        post<any>(`/exams/${examId}/assign-questions/`, { question_ids: questionIds }),

    removeQuestionsFromExam: (examId: string | number, questionIds: number[]) =>
        post<any>(`/exams/${examId}/remove-questions/`, { question_ids: questionIds }),

    // --- Question Management ---
    getQuestions: () => get<any[]>("/questions/"),
    createQuestion: (questionData: any) => post<any>("/questions/", questionData),

    addOptionsToQuestion: (questionId: number, options: { text: string, is_correct: boolean }[]) =>
        post<any>(`/questions/${questionId}/add_options/`, { options }),

    deleteQuestion: (id: number) => del<any>(`/questions/${id}/`),

    uploadQuestions: (formData: FormData) =>
        post<any>("/questions/bulk-upload/", formData, true),

    // --- Grading ---
    getPendingGrading: () => get<any[]>("/admin/grading/pending/"),

    submitGrades: (sessionId: string | number, grades: any[]) =>
        post<any>(`/admin/grading/submit/${sessionId}/`, { grades }),

    getGradingSession: (sessionId: number) =>
        get<any>(`/assessments/grading/session/${sessionId}/`),

    // --- Grading History ---
    getGradedHistory: () => get<any[]>("/admin/grading/history/"),

    // --- Certificates ---
    getAllCertificates: () => get<any[]>("/admin/certificates/"),

    revokeCertificate: (id: number, reason: string) =>
        post<any>(`/certificates/revoke/${id}/`, { reason }),

    // --- Exam Assignment ---
    assignExamToStudent: (examId: string | number, email: string) =>
        post<any>(`/exams/${examId}/assign-student/`, { email }),

    // --- Reset Student Attempt ---
    resetSession: (sessionId: number) =>
        del<any>(`/assessments/admin/session/${sessionId}/reset/`),

    // --- Export Results ---
    exportExamResults: async (examId: number): Promise<Blob> => {
        const token = authStorage.getAccessToken()
        const response = await fetch(`${API_BASE_URL}/assessments/admin/export/exam/${examId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        })

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status} ${response.statusText}`)
        }

        return response.blob()
    },

    // --- Download Result Slip ---
    downloadResultPdf: async (sessionId: number): Promise<Blob> => {
        const token = authStorage.getAccessToken()
        const response = await fetch(`${API_BASE_URL}/assessments/result/${sessionId}/download/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        })

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`)
        }

        return response.blob()
    },

    // --- Analytics ---
    getAnalytics: () => get<any>("/admin/analytics/"),

    // --- Platform Settings ---
    getSettings: () => get<any>("/core/settings/"),

    updateSettings: (settingsData: any) => {
        if (settingsData instanceof FormData) {
            return post<any>("/core/settings/", settingsData, true)
        }
        return put<any>("/core/settings/", settingsData)
    },

    // --- Audit Logs ---
    getAuditLogs: () => get<any[]>("/core/audit-logs/"),

    // --- Download Certificate ---
    downloadCertificate: async (sessionId: string | number): Promise<Blob> => {
        const token = authStorage.getAccessToken()
        const response = await fetch(`${API_BASE_URL}/certificates/download/${sessionId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        })

        if (!response.ok) {
            throw new Error(`Certificate download failed: ${response.status} ${response.statusText}`)
        }

        return response.blob()
    },

    // --- BACKUP & RESTORE ---
    getBackups: () => get<any[]>("/admin/backups/list/"),

    restoreBackup: (filename: string) =>
        post<any>("/admin/backups/restore/", { filename }),

    deleteBackup: (filename: string) =>
        del<any>(`/admin/backups/delete/${filename}/`),

    downloadBackup: async (filename: string): Promise<void> => {
        const token = authStorage.getAccessToken()
        const response = await fetch(`${API_BASE_URL}/admin/backups/download/${filename}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })

        if (!response.ok) {
            throw new Error(`Download backup failed: ${response.status} ${response.statusText}`)
        }

        // Create a temporary URL for the blob
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Cleanup
        if (link.parentNode) {
            link.parentNode.removeChild(link)
        }
        window.URL.revokeObjectURL(url)
    },

    createBackup: () => apiClient.post('/admin/backups/create/').then(res => res.data), // Ensure the '/' is at the end
}

export const studentAPI = {
    // --- Exams ---
    getExams: () => get<any[]>("/exams/"),

    startExam: (examId: string | number) =>
        post<{
            id: number;
            questions: any[];
            duration_minutes: number;
            time_remaining_seconds: number;
        }>(`/exams/${examId}/start/`),

    submitExam: (sessionId: number, answers: {
        question_id: number;
        selected_option_id?: number;
        text_answer?: string
    }[]) =>
        post<any>(`/exams/session/${sessionId}/submit/`, { answers }),

    // --- History & Results ---
    getExamAttempts: () => get<any[]>("/exams/attempts/"),

    getExamHistory: () => get<any[]>("/assessments/history/"),

    getSession: (sessionId: string | number) => get<any>(`/exams/session/${sessionId}/`),

    getSessionResult: (sessionId: number) => get<any>(`/assessments/result/${sessionId}/`),

    // --- Certificates ---
    getCertificates: () => get<any[]>("/certificates/"),

    downloadCertificate: async (certId: string): Promise<Blob> => {
        const token = authStorage.getAccessToken()
        const response = await fetch(`${API_BASE_URL}/certificates/download/${certId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) {
            throw new Error(`Certificate download failed: ${response.status} ${response.statusText}`)
        }

        return response.blob()
    },

    // --- Profile ---
    updateProfile: (data: any) => patch<any>('/auth/users/me/', data),

    // --- Download Result ---
    downloadResult: async (sessionId: string): Promise<Blob> => {
        const token = authStorage.getAccessToken()
        const response = await fetch(`${API_BASE_URL}/assessments/result/${sessionId}/download/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        })

        if (!response.ok) {
            throw new Error(`Result download failed: ${response.status} ${response.statusText}`)
        }

        return response.blob()
    },
}

export const examinerAPI = {
    // --- Reviews ---
    getPendingReviews: () => get<any[]>("/admin/grading/pending/"),

    getSession: (sessionId: string | number) => get<any>(`/admin/grading/session/${sessionId}/`),

    submitGrades: (sessionId: string | number, grades: any[]) =>
        post<any>(`/admin/grading/submit/${sessionId}/`, { grades }),

    // --- Stats & History ---
    getStats: () => get<{ pending: number; graded: number; total: number }>("/examiner/stats/"),

    getGradedHistory: () => get<any[]>("/examiner/history/"),
}

export const userAPI = {
    getProfile: () => get<User>("/profile/"),
    updateProfile: (data: Partial<User>) => patch<User>("/profile/", data),
}

export const paymentAPI = {
    verifyPayment: (reference: string, examId: number) =>
        post<any>("/payments/verify/", { reference, exam_id: examId }),
}

export const publicAPI = {
    verifyCertificate: (code: string) => get<any>(`/certificates/verify/${code}/`)
}