// Extend NextAuth types
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    biometricEnabled: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      biometricEnabled: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: string;
    biometricEnabled: boolean;
  }
}
