import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPrayerItems } from '@/actions/prayer';
import { getFaithCommitment } from '@/actions/identity';
import FaithClient from '@/components/faith/FaithClient';
import { PageContainer } from '@/components/ui/Navigation';

export default async function FaithPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const [prayersResult, commitmentResult] = await Promise.all([
    getPrayerItems(),
    getFaithCommitment(),
  ]);

  const prayers = prayersResult.success ? prayersResult.items : [];
  const faithCommitment = commitmentResult.success ? commitmentResult.faithCommitment : null;

  return (
    <PageContainer>
      <FaithClient initialPrayers={prayers} faithCommitment={faithCommitment} />
    </PageContainer>
  );
}
