import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import {
  Heart,
  Users,
  DollarSign,
  Briefcase,
  BookOpen,
  User as UserIcon,
  Bell,
  Lightbulb,
  UserCheck
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'More - WG Growth App',
  description: 'Access all features of your personal growth companion',
};

const moreItems = [
  { href: '/faith', label: 'Prayer', icon: Heart, description: 'Track your spiritual journey' },
  { href: '/relationships', label: 'Relationships', icon: Users, description: 'Manage your connections' },
  { href: '/finance', label: 'Finance', icon: DollarSign, description: 'Track income & expenses' },
  { href: '/business', label: 'Business', icon: Briefcase, description: 'Monitor business metrics' },
  { href: '/life-seasons', label: 'Life Seasons', icon: BookOpen, description: 'Reflect on life phases' },
  { href: '/accountability', label: 'Accountability', icon: UserCheck, description: 'Partner accountability' },
  { href: '/identity', label: 'Identity', icon: UserIcon, description: 'Define your identity' },
  { href: '/insights', label: 'Insights', icon: Lightbulb, description: 'AI-powered insights' },
  { href: '/notifications', label: 'Notifications', icon: Bell, description: 'Manage notifications' },
  { href: '/profile', label: 'Profile', icon: UserIcon, description: 'Your account settings' },
];

export default async function MorePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Simple Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-md border-b border-border-default">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-text-primary">More</h1>
          <p className="text-sm text-text-secondary mt-1">Explore all features</p>
        </div>
      </header>

      {/* Grid of Items */}
      <div className="p-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-start p-4 bg-bg-secondary rounded-2xl border border-border-default hover:border-accent-primary/50 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-3">
                  <Icon size={24} className="text-accent-primary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  {item.label}
                </h3>
                <p className="text-xs text-text-tertiary line-clamp-2">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
