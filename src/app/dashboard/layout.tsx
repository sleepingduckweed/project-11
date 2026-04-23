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
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-xl font-black text-emerald-600 flex items-center gap-2">
           <Tally5 className="size-6" /> Kiyamaa
        </h1>
        <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
           <LogOut className="size-5" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm">
        <div className="p-8">
          <h1 className="text-xl font-black text-emerald-600 flex items-center gap-3">
            <Tally5 className="size-8" /> Kiyamaa's Kitchen
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="size-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-40 md:pb-10 scroll-smooth">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[2rem]">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1.5 transition-all p-2 rounded-2xl active:scale-90 ${
                active
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-emerald-50' : ''}`}>
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-50'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
