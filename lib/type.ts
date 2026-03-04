// lib/types.ts

export type UserRole = "admin" | "examiner" | "grader" | "candidate";

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_staff: boolean;
    phone_number?: string;
    bio?: string;
    avatar?: string;
    /** CPT: Language pairs the user is competent in, e.g. ["EN-FR", "FR-EN"] */
    language_competence?: string[];
    /** CPT: Domains the user specialises in, e.g. ["Medical", "Legal"] */
    specialization_competence?: string[];
}

export interface Exam {
    id: number;
    title: string;
    description: string;
    is_blueprint: boolean; // blueprint vs instance [cite: 191]
    language_pair?: {
        source_language: string;
        target_language: string;
        pair_code: string;
    };
    // Section Weights [cite: 192]
    weight_section_a: number; // 15%
    weight_section_b: number; // 65%
    weight_section_c: number; // 20%
    pass_mark_percentage: number;
    price: number;
}

export interface ExamSession {
    id: number;
    user_email: string;
    score_section_a: number;
    score_section_b: number;
    score_section_c: number;
    is_graded: boolean;
    requires_moderation: boolean; // double-blind variance trigger [cite: 151, 193]
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface AuthTokens {
    access: string;
    refresh: string;
    user: User;
}