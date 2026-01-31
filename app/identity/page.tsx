import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ManifestoEditor from '@/components/identity/ManifestoEditor';
import ValuesManager from '@/components/identity/ValuesManager';
import FaithCommitmentEditor from '@/components/identity/FaithCommitmentEditor';

export default async function IdentityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Identity</h1>
          <p className="text-text-secondary mt-1">
            Define who you are, what you stand for, and what guides your life
          </p>
        </div>

        <div className="space-y-6">
          <ManifestoEditor />
          <ValuesManager />
          <FaithCommitmentEditor />
        </div>
      </div>
    </div>
  );
}
