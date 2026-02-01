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

const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/habits', label: 'Habits', icon: TrendingUp },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/routines', label: 'Routines', icon: Calendar },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary border-t border-border-default pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]
                ${isActive 
                  ? 'text-accent-primary' 
                  : 'text-text-tertiary active:text-text-secondary'
                }
              `}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'fill-accent-primary/20' : ''}
              />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
