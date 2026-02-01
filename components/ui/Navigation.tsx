'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Target,
  TrendingUp,
  Heart,
  Users,
  DollarSign,
  Briefcase,
  Calendar,
  BookOpen,
  User,
  Bell,
  Lightbulb,
  ArrowLeft,
  UserCheck,
  MoreHorizontal
} from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/habits', label: 'Habits', icon: TrendingUp },
  { href: '/routines', label: 'Routines', icon: Calendar },
  { href: '/faith', label: 'Prayer', icon: Heart },
  { href: '/relationships', label: 'Relationships', icon: Users },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/business', label: 'Business', icon: Briefcase },
  { href: '/life-seasons', label: 'Life Seasons', icon: BookOpen },
  { href: '/accountability', label: 'Accountability', icon: UserCheck },
  { href: '/identity', label: 'Identity', icon: User },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const showBackButton = pathname !== '/dashboard' && pathname !== '/';

  const handleBack = () => {
    router.back();
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const currentItem = navigationItems.find(item => item.href === pathname);
    if (currentItem) return currentItem.label;
    
    // Handle dynamic routes
    if (pathname.startsWith('/goals/')) return 'Goal Details';
    if (pathname.startsWith('/habits/')) return 'Habit Details';
    if (pathname.startsWith('/routines/')) return 'Routine Details';
    
    return 'WG Growth';
  };

  return (
    <>
      {/* Mobile Header - Simplified, no hamburger */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-border-default">
        <div className="flex items-center px-4 py-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-bg-secondary rounded-lg transition-colors mr-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-text-primary">
            {getPageTitle()}
          </h1>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-bg-primary border-r border-border-default overflow-y-auto">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-bg-primary font-bold">WG</span>
            </div>
            <span className="text-xl font-bold text-text-primary">Growth</span>
          </Link>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-accent-primary text-bg-primary font-medium' 
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border-default">
            <Link
              href="/profile"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${pathname === '/profile'
                  ? 'bg-accent-primary text-bg-primary font-medium'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }
              `}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Desktop Header with Back Button */}
      <header className="hidden lg:block fixed top-0 left-64 right-0 z-40 bg-bg-primary/80 backdrop-blur-sm border-b border-border-default">
        <div className="flex items-center px-6 py-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-14 pb-20 lg:pl-64 lg:pt-20 lg:pb-8">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
}
