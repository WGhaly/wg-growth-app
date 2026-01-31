import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRoutines } from '@/actions/routines';
import { RoutinesClient } from '@/components/routines/RoutinesClient';
import { PageContainer } from '@/components/ui/Navigation';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const result = await getRoutines();
  const routines = result.success ? result.routines : [];

  return (
    <PageContainer>
      <RoutinesClient initialRoutines={routines} />
    </PageContainer>
  );
}
