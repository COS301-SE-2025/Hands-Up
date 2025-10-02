// This file centralizes your active session data
export const activeSessions = new Map();
export const loginAttempts = new Map();

// You might also want to export your constants here
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 1000 * 60 * 5; // 5 minutes
export const LOCKOUT_DURATION_MINUTES = 5;
