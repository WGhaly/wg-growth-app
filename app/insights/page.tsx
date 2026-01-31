import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllInsights } from '@/actions/insights';
import { InsightsClient } from '@/components/insights/InsightsClient';

export default async function InsightsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const result = await getAllInsights();
  const insights = result.success && result.data ? result.data : [];

  return <InsightsClient initialInsights={insights} />;
}
