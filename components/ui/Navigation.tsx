'use client';

import { useState } from 'react';
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
  Menu,
  X,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Button } from './Button';

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
  { href: '/accountability', label: 'Accountability', icon: Users },
  { href: '/identity', label: 'Identity', icon: User },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const showBackButton = pathname !== '/dashboard' && pathname !== '/';

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg-primary border-b border-border-default">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-text-primary" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-text-primary">
              {navigationItems.find(item => item.href === pathname)?.label || 'WG Growth'}
            </h1>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-text-primary" />
            ) : (
              <Menu size={24} className="text-text-primary" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <nav
        className={`
          lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-bg-primary border-l border-border-default
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h2 className="text-lg font-semibold text-text-primary">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-73px)] p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
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
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-all"
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </nav>

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
      <main className="min-h-screen pt-16 lg:pl-64 lg:pt-20">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
}
