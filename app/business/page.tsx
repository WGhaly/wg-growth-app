import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanies } from '@/actions/business';
import { BusinessClient } from '@/components/business/BusinessClient';
import { PageContainer } from '@/components/ui/Navigation';

export default async function BusinessPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const result = await getCompanies();
  const companies = result.success && result.data ? result.data : [];

  return (
    <PageContainer>
      <BusinessClient initialCompanies={companies} />
    </PageContainer>
  );
}
