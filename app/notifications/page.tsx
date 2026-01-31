import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { PageContainer } from '@/components/ui/Navigation';

export default async function NotificationsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-bg-primary p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-text-secondary mt-1">
              Manage your push notification preferences
            </p>
          </div>
          <NotificationSettings />
        </div>
      </div>
    </PageContainer>
  );
}
