'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, Factory, Link2, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Radar', icon: Radio },
  { href: '/factory', label: 'Factory', icon: Factory },
  { href: '/funnel', label: 'Funnel', icon: Link2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-white/5 bg-[#0d0d14] p-4">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-bold tracking-tight text-[#00e68a]">
          CashThesis
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-white/30">
          Command Center
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[#00e68a]/10 text-[#00e68a]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/5 pt-4">
        <p className="px-2 text-[10px] text-white/20">v0.1.0 MVP</p>
      </div>
    </aside>
  );
}
