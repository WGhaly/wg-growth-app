import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/crypto';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        biometricVerified: { label: 'Biometric Verified', type: 'text' }
      },
      async authorize(credentials) {
        try {
          console.log('[authorize] Starting authorization...');
          
          if (!credentials?.email) {
            console.log('[authorize] Missing email');
            return null;
          }

          console.log('[authorize] Fetching user from database...');
          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!user) {
            console.log('[authorize] User not found');
            return null;
          }

          console.log('[authorize] User found:', user.email);

          // Handle biometric verification
          if (credentials.biometricVerified === 'true') {
            console.log('[authorize] Biometric verification flow');
            
            // Check if biometric is enabled
            if (!user.biometricEnabled) {
              console.log('[authorize] Biometric not enabled');
              return null;
            }

            // Check recent biometric verification (within 30 seconds)
            if (user.lastBiometricVerification) {
              const timeSinceVerification = Date.now() - user.lastBiometricVerification.getTime();
              if (timeSinceVerification > 30000) {
                console.log('[authorize] Biometric verification expired');
                return null;
              }
            } else {
              console.log('[authorize] No recent biometric verification');
              return null;
            }

            console.log('[authorize] Biometric authorization successful');
            // Return user data for session
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              biometricEnabled: user.biometricEnabled || false
            };
          }

          // Handle password verification
          if (!credentials?.password) {
            console.log('[authorize] Missing password');
            return null;
          }

          // Check if account is locked
          if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
            console.log('[authorize] Account is locked');
            throw new Error('Too many failed login attempts. Your account is temporarily locked for 15 minutes.');
          }

          // Check if account is active
          if (!user.isActive) {
            console.log('[authorize] Account is not active');
            throw new Error('Your account has been deactivated. Please contact support for assistance.');
          }

          console.log('[authorize] Verifying password...');
          // Verify password
          const isValid = await verifyPassword(credentials.password as string, user.passwordHash);

          if (!isValid) {
            console.log('[authorize] Password is invalid');
            // Increment failed login attempts
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const shouldLock = attempts >= 5;

            await db
              .update(users)
              .set({
                failedLoginAttempts: attempts,
                isLocked: shouldLock,
                lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : undefined // 15 minutes
              })
              .where(eq(users.id, user.id));

            if (shouldLock) {
              throw new Error('Too many failed login attempts. Your account has been locked for 15 minutes.');
            }

            return null;
          }

          console.log('[authorize] Password is valid, updating user...');
          // Reset failed login attempts on successful login
          await db
            .update(users)
            .set({
              failedLoginAttempts: 0,
              isLocked: false,
              lockedUntil: null,
              lastActivity: new Date()
            })
            .where(eq(users.id, user.id));

          console.log('[authorize] Authorization successful');
          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            biometricEnabled: user.biometricEnabled || false
          };
        } catch (error) {
          console.error('[authorize] Error during authorization:', error);
          throw error;
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.biometricEnabled = user.biometricEnabled;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.biometricEnabled = token.biometricEnabled as boolean;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60 // 15 minutes (auto-lock)
  },
  
  secret: process.env.NEXTAUTH_SECRET
});
