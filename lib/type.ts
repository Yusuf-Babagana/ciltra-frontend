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
    /** True when this record is a reusable CPT Blueprint rather than a live instance */
    is_blueprint: boolean;
    /** ISO language-pair code, e.g. "EN-FR" */
    language_pair: string;
    /** Section A weighting (default 15%) */
    weight_section_a: number;
    /** Section B weighting (default 65%) */
    weight_section_b: number;
    /** Section C weighting (default 20%) */
    weight_section_c: number;
    status: "draft" | "approved" | "live" | "marking" | "finalized";
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