'use server';

import { db } from '@/lib/db';
import { users, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/crypto';
import { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema,
  type RegisterInput, 
  type LoginInput, 
  type ChangePasswordInput 
} from '@/lib/validators';
import { signIn, signOut, auth } from '@/lib/auth';

// ============================================================================
// Register User
// ============================================================================

export async function registerUser(input: RegisterInput) {
  try {
    // Validate input
    const validated = registerSchema.parse(input);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: validated.email,
        passwordHash,
        emailVerified: true,
        role: 'owner'
      })
      .returning();

    // Create profile
    await db.insert(profiles).values({
      userId: newUser.id,
      firstName: validated.firstName,
      lastName: validated.lastName,
      dateOfBirth: validated.dateOfBirth
    });

    return {
      success: true,
      message: 'Account created successfully! You can now sign in.'
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Unable to create account. Please try again.'
    };
  }
}

// ============================================================================
// Login User
// ============================================================================

export async function loginUser(input: LoginInput) {
  try {
    // Validate input
    const validated = loginSchema.parse(input);

    // Attempt sign in with NextAuth
    const result = await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirect: false
    });

    if (!result) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Check if biometric is enabled
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1);

    if (user?.biometricEnabled) {
      return {
        success: true,
        requiresBiometric: true,
        email: validated.email
      };
    }

    return {
      success: true,
      requiresBiometric: false
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Failed to log in'
    };
  }
}

// ============================================================================
// Logout User
// ============================================================================

export async function logoutUser() {
  await signOut({ redirectTo: '/auth/login' });
}

// ============================================================================
// Change Password
// ============================================================================

export async function changePassword(input: ChangePasswordInput) {
  try {
    // Get current session
    const session = await auth();
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Validate input
    const validated = changePasswordSchema.parse(input);

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Verify current password
    const { verifyPassword } = await import('@/lib/crypto');
    const isValid = await verifyPassword(validated.currentPassword, user.passwordHash);

    if (!isValid) {
      return {
        success: false,
        error: 'Current password is incorrect'
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(validated.newPassword);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error: any) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error.message || 'Failed to change password'
    };
  }
}

// ============================================================================
// Verify Email
// ============================================================================

export async function verifyEmail(token: string) {
  try {
    // TODO: Implement token verification
    // For now, we'll just mark the email as verified
    // In production, you'd want to store tokens in a separate table
    // and verify them here with expiration logic
    
    console.log('Verifying email with token:', token);

    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify email'
    };
  }
}
