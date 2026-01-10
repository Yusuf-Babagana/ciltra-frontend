// lib/api.ts

import { authStorage } from "./auth"
import type { User, AuthResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://51.77.149.67/api"

async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authStorage.getAccessToken()

    // Check if we are sending a file (FormData)
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        // Only set JSON content type if it's NOT a file upload
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers as Record<string, string>),
    }

    const config: RequestInit = {
        ...options,
        headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Handle 204 No Content (Delete operations)
    if (response.status === 204) {
        return {} as T
    }

    if (!response.ok) {
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            authStorage.removeTokens()
            if (typeof window !== 'undefined') window.location.href = '/login'
        }

        const errorData = await response.json().catch(() => ({}))
        console.error("API Error Response:", response.status, errorData) // Added logging
        const errorMessage = errorData.detail || errorData.message || errorData.error || "An error occurred"
        throw new Error(errorMessage)
    }

    return response.json()
}

export const authAPI = {
    register: (userData: any): Promise<User> =>
        apiClient("/auth/register/", { method: "POST", body: JSON.stringify(userData) }),

    login: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
        apiClient("/auth/login/", {
            method: "POST",
            body: JSON.stringify({
                username: credentials.email,
                email: credentials.email,
                password: credentials.password
            }),
        }),

    logout: () => {
        authStorage.removeTokens()
        if (typeof window !== "undefined") window.location.href = "/"
    },
}

export const adminAPI = {
    // --- Candidates ---
    getCandidates: () => apiClient<any[]>("/admin/candidates/"),

    // --- User Management (CRUD) ---
    getUsers: () => apiClient<any[]>("/users/"),
    createUser: (userData: any) =>
        apiClient("/users/", { method: "POST", body: JSON.stringify(userData) }),
    updateUser: (id: number, userData: any) =>
        apiClient(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(userData) }),
    deleteUser: (id: number) =>
        apiClient(`/users/${id}/`, { method: "DELETE" }),

    // --- Exam Management ---
    getExams: () => apiClient<any[]>("/exams/"),
    createExam: (examData: any) =>
        apiClient("/exams/", { method: "POST", body: JSON.stringify(examData) }),
    updateExam: (id: string | number, examData: any) =>
        apiClient(`/exams/${id}/`, { method: "PUT", body: JSON.stringify(examData) }),
    deleteExam: (id: string | number) =>
        apiClient(`/exams/${id}/`, { method: "DELETE" }),

    // --- NEW: Question Assignment ---
    assignQuestionsToExam: (examId: string | number, questionIds: number[]) =>
        apiClient(`/exams/${examId}/assign-questions/`, {
            method: "POST",
            body: JSON.stringify({ question_ids: questionIds })
        }),

    removeQuestionsFromExam: (examId: string | number, questionIds: number[]) =>
        apiClient(`/exams/${examId}/remove-questions/`, {
            method: "POST",
            body: JSON.stringify({ question_ids: questionIds })
        }),

    // --- Question Management ---
    getQuestions: () => apiClient<any[]>("/questions/"),

    createQuestion: (questionData: any) =>
        apiClient("/questions/", { method: "POST", body: JSON.stringify(questionData) }),

    addOptionsToQuestion: (questionId: number, options: { text: string, is_correct: boolean }[]) =>
        apiClient(`/questions/${questionId}/add_options/`, {
            method: "POST",
            body: JSON.stringify({ options })
        }),

    deleteQuestion: (id: number) =>
        apiClient(`/questions/${id}/`, { method: "DELETE" }),

    uploadQuestions: (formData: FormData) =>
        apiClient("/questions/bulk-upload/", {
            method: "POST",
            body: formData,
        }),

    // --- Grading ---
    getPendingGrading: () => apiClient<any[]>("/admin/grading/pending/"),
    submitGrades: (sessionId: string | number, grades: any[]) =>
        apiClient(`/admin/grading/submit/${sessionId}/`, {
            method: "POST",
            body: JSON.stringify({ grades })
        }),

    // --- Certificates ---
    getAllCertificates: () => apiClient("/admin/certificates/"),

    // --- Dashboard Stats ---
    getDashboardStats: () => apiClient<{
        total_exams: number;
        total_candidates: number;
        pending_grading: number;
        issued_certificates: number;
    }>("/admin/stats/"),
}

export const studentAPI = {
    // 1. Get all available exams
    getExams: () => apiClient<any[]>("/exams/"),

    // 2. Start Exam: Creates a session and fetches questions
    startExam: (examId: string | number) =>
        apiClient<{
            id: number; // session_id
            questions: any[];
            duration_minutes: number;
            time_remaining_seconds: number;
        }>(`/exams/${examId}/start/`, { method: "POST" }),

    // 3. Submit Exam: Sends all answers
    submitExam: (sessionId: number, answers: { question_id: number; selected_option_id?: number; text_answer?: string }[]) =>
        apiClient(`/exams/session/${sessionId}/submit/`, {
            method: "POST",
            body: JSON.stringify({ answers })
        }),

    // 4. Get Exam History (Attempts)
    getExamAttempts: () => apiClient<any[]>("/exams/attempts/"),

    // 5. Get Certificates
    getCertificates: () => apiClient<any[]>("/certificates/"),


    // ADD THIS FUNCTION
    getSession: (sessionId: string | number) =>
        apiClient<any>(`/exams/session/${sessionId}/`),

    getSessionResult: (sessionId: number) => apiClient(`/assessments/result/${sessionId}/`),


    getExamHistory: () => apiClient('/assessments/history/'),

    updateProfile: (data: any) => apiClient('/auth/users/me/', { method: 'PATCH', body: JSON.stringify(data) }),


    // Add to studentAPI:
    downloadCertificate: async (certId: string) => {
        const token = authStorage.getAccessToken();
        const res = await fetch(`${API_BASE_URL}/certificates/download/${certId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed");
        return res.blob();
    },

    downloadResult: async (sessionId: string) => {
        const token = authStorage.getAccessToken();
        const res = await fetch(`${API_BASE_URL}/assessments/result/${sessionId}/download/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            console.error("Download failed:", res.status, await res.text());
            throw new Error(`Failed: ${res.status}`);
        }
        return res.blob();
    },
}

export const examinerAPI = {
    // 1. Get List of Scripts to Grade
    // Fetches all finished sessions that haven't been graded yet
    getPendingReviews: () => apiClient<any[]>("/admin/grading/pending/"),

    // 2. Get Single Session Details (UPDATED)
    // Points to the NEW backend view that allows Examiners to see answers + correct options
    getSession: (sessionId: string | number) =>
        apiClient<any>(`/admin/grading/session/${sessionId}/`),

    // 3. Submit the Grade
    // Sends the manual scores and comments back to the server
    submitGrades: (sessionId: string | number, grades: any[]) =>
        apiClient(`/admin/grading/submit/${sessionId}/`, {
            method: "POST",
            body: JSON.stringify({ grades })
        }),

    // ADD THIS NEW FUNCTION:
    getStats: () => apiClient<{ pending: number; graded: number; total: number }>("/examiner/stats/"),

    getGradedHistory: () => apiClient<any[]>("/examiner/history/"),


}

export const userAPI = {
    getProfile: () => apiClient<User>("/profile/"),
    updateProfile: (data: Partial<User>) =>
        apiClient("/profile/", { method: "PATCH", body: JSON.stringify(data) }),
}

export const paymentAPI = {
    verifyPayment: (reference: string, examId: number) =>
        apiClient("/payments/verify/", {
            method: "POST",
            body: JSON.stringify({ reference, exam_id: examId })
        }),
}