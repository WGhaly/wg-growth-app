'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  TrendingUp,
  Target,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { feedback } from '@/lib/haptics';

const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/habits', label: 'Habits', icon: TrendingUp },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/routines', label: 'Routines', icon: Calendar },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const handleNavClick = () => {
    feedback.tap();
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-t border-border-default pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-2xl
                transition-all duration-300 ease-out touch-target tap-highlight
                ${isActive 
                  ? 'text-accent-primary scale-105' 
                  : 'text-text-tertiary active:scale-95 active:text-text-secondary'
                }
              `}
            >
              <div className={`relative transition-all duration-300 ${
                isActive ? 'scale-110' : ''
              }`}>
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${
                    isActive ? 'drop-shadow-[0_0_8px_rgba(204,171,82,0.5)]' : ''
                  }`}
                />
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-primary rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-300 ${
                isActive ? 'font-bold' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
