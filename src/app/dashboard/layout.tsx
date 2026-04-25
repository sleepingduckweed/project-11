'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, ClipboardList, LogOut, Utensils } from 'lucide-react';
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
    { href: '/dashboard/bookings', label: 'Bookings', icon: Utensils },
    { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fdfaf6] overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#fdfaf6] border-b border-orange-100/50 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
           <div className="size-8 bg-orange-600 rounded-xl flex items-center justify-center"><Utensils className="size-4 text-white" /></div> Kiymaa's Kitchen
        </h1>
        <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
           <LogOut className="size-5" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#fdfaf6] border-r border-orange-100/50 flex-col">
        <div className="p-8">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
            <div className="size-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100"><Utensils className="size-5 text-white" /></div> Kiymaa's
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
                className={`flex items-center gap-3 px-5 py-4 rounded-3xl font-black tracking-tight text-sm uppercase transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xl'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <Icon className="size-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-orange-100/50">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-5 py-4 text-slate-500 hover:text-white hover:bg-orange-600 rounded-3xl transition-all font-black tracking-tight text-sm uppercase"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100/50 px-6 py-3 flex items-center justify-between z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1.5 transition-all p-2 rounded-2xl active:scale-90 ${
                active
                  ? 'text-orange-600'
                  : 'text-slate-400'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-colors ${active ? 'bg-orange-50' : ''}`}>
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'opacity-100 text-orange-600' : 'opacity-50 text-slate-400'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
