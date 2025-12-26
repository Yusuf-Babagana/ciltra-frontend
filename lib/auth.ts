// lib/auth.ts
import { User, AuthTokens } from "./types";

const TOKEN_KEY = "auth_tokens";

export const authStorage = {
  getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const tokens = localStorage.getItem(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  },

  setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },

  removeTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },

  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.access || null;
  },

  getUser(): User | null {
    const tokens = this.getTokens();
    return tokens?.user || null;
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // Updated to check specific roles
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === "admin" || user?.is_staff || false;
  },

  isExaminer(): boolean {
    const user = this.getUser();
    return user?.role === "examiner";
  },

  isCandidate(): boolean {
    const user = this.getUser();
    return user?.role === "candidate";
  }
};