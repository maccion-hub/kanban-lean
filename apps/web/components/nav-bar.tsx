'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@kanban/ui';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/upload', label: 'Importar Excel' },
  { href: '/articles', label: 'Articles' },
  { href: '/config', label: 'Configuració' },
  { href: '/kanban', label: 'Generar' },
  { href: '/proposals', label: 'Propostes' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 px-6 h-12">
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
              'px-3 py-1.5 font-display text-[13px] font-semibold rounded-[2px] transition-colors whitespace-nowrap',
              active
                ? 'bg-green text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
