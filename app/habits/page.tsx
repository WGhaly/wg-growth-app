import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getHabits } from '@/actions/habits';
import HabitsClient from '@/components/habits/HabitsClient';
import { PageContainer } from '@/components/ui/Navigation';

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const result = await getHabits();
  const habits = result.success ? result.habits : [];

  return (
    <PageContainer>
      <HabitsClient initialHabits={habits} />
    </PageContainer>
  );
}
