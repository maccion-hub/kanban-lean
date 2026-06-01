'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@kanban/ui';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/upload', label: 'Importar' },
  { href: '/articles', label: 'Articles' },
  { href: '/config', label: 'Paràmetres' },
  { href: '/kanban', label: 'Generar' },
  { href: '/proposals', label: 'Propostes' },
  { href: '/assistant', label: 'Assistent IA' },
  { href: '/settings', label: 'Ajustos' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 px-6 h-12 overflow-x-auto">
      <span className="font-display font-bold text-[13px] uppercase tracking-caps text-white/90 mr-4 shrink-0">
        Kanban Lean
      </span>
      {links.map((link) => {
        const active =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-2.5 py-1.5 font-display text-[12px] font-semibold rounded-[2px] transition-colors whitespace-nowrap shrink-0',
              active
                ? 'bg-green text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
