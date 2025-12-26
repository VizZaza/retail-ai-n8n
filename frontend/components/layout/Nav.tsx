'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/sales', label: 'Sales' },
  { href: '/ai', label: 'AI' },
];

export default function Nav() {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="font-semibold">Retail AI</div>
        <div className="flex gap-2 text-sm">
          {items.map(i => (
            <Link
              key={i.href}
              href={i.href}
              className={`px-3 py-1 rounded ${path === i.href ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
            >
              {i.label}
            </Link>
          ))}
        </div>
        <div className="flex-1" />
        <button
          className="text-sm px-3 py-1 rounded border hover:bg-slate-50"
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
