// lib/types.ts

export type UserRole = "candidate" | "examiner" | "admin";

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