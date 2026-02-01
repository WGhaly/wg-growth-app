import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();
  
  if (session?.user) {
    redirect('/dashboard');
  }
  
  // Check if user has biometric setup (we'll check client-side)
  redirect('/auth/auto-biometric');
}
