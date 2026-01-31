import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// ============================================================================
// Password Hashing (bcrypt with 10 rounds - optimized for development)
// ============================================================================

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    console.log('[verifyPassword] Starting password verification...');
    const result = await bcrypt.compare(password, hash);
    console.log('[verifyPassword] Password verification completed:', result);
    return result;
  } catch (error) {
    console.error('[verifyPassword] Error during password verification:', error);
    throw error;
  }
}

// ============================================================================
// Token Generation (for email verification, password reset, etc.)
// ============================================================================

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// ============================================================================
// Session Token Generation
// ============================================================================

export function generateSessionToken(): string {
  return generateSecureToken(64);
}

// ============================================================================
// Email Verification Token Generation
// ============================================================================

export function generateEmailVerificationToken(): string {
  return generateSecureToken(32);
}
