import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPeople } from '@/actions/relationships';
import { RelationshipsClient } from '@/components/relationships/RelationshipsClient';
import { PageContainer } from '@/components/ui/Navigation';

export default async function RelationshipsPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const result = await getPeople();
  const people = result.success && result.data ? result.data : [];

  return (
    <PageContainer>
      <RelationshipsClient initialPeople={people} />
    </PageContainer>
  );
}
