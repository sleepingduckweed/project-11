'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, ClipboardList, LogOut, Tally5 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <Tally5 className="size-6" /> Kiyamaa's Kitchen
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="size-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
