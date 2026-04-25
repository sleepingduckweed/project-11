'use client';

import { useEffect, useState } from 'react';
import { 
  Users, ClipboardList, AlertCircle, TrendingUp, 
  Wallet, Clock, ArrowRight, CheckCircle2,
  Coffee, Sun, Moon, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
            <span className="animate-spin text-orange-500 font-bold text-xl">/</span>
            <p className="font-black uppercase tracking-widest text-xs">Cooking Statistics...</p>
        </div>
    </div>
  );

  const mainStats = [
    { label: 'Total Customers', value: stats?.totalUsers || 0, icon: Users, color: 'text-slate-900', bg: 'bg-slate-100', link: '/dashboard/users' },
    { label: 'System Tiffin Pool', value: stats?.totalTiffins || 0, icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50', link: '/dashboard/users' },
    { label: 'Credit Velocity', value: stats?.tiffinsCredited || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/dashboard/users' },
    { label: 'Today Dispatches', value: (stats?.today.breakfast + stats?.today.lunch + stats?.today.dinner) || 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/orders' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top duration-700">
        <div className="space-y-1">
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">Overview.</h1>
           <p className="text-slate-500 font-medium tracking-tight italic">Live performance metrics and kitchen load.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/dashboard/bookings" className="btn btn-primary px-8 py-4 rounded-[2rem] shadow-xl shadow-orange-100 flex items-center gap-2">
              <Sparkles className="size-4" /> Manage Matrix
           </Link>
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((card, i) => (
          <Link 
            href={card.link}
            key={card.label} 
            className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in zoom-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`p-4 rounded-2xl w-fit ${card.bg} ${card.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
              <card.icon className="size-8" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{card.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-orange-500 transition-colors">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Today's Load Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Clock className="size-6 text-orange-600" /> Today's Distribution Load
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="size-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm"><Coffee className="size-7" /></div>
                <div>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">{stats?.today.breakfast}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Breakfast</p>
                </div>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="size-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><Sun className="size-7" /></div>
                <div>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">{stats?.today.lunch}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lunch</p>
                </div>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm"><Moon className="size-7" /></div>
                <div>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">{stats?.today.dinner}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dinner</p>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                <Sparkles className="size-48" />
             </div>
             <div className="relative z-10 space-y-6">
                <h3 className="text-3xl font-black tracking-tight leading-tight">Master Weekly<br/>Planning Matrix.</h3>
                <p className="text-slate-400 font-medium max-w-sm">Use the specialized matrix view to handle 100+ manual bookings for the entire week across all customers.</p>
                <Link href="/dashboard/bookings" className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-500 px-8 py-4 rounded-3xl font-black uppercase text-xs tracking-widest transition-all">
                   Go to Matrix <ArrowRight className="size-4" />
                </Link>
             </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <TrendingUp className="size-6 text-emerald-600" /> Recent Recharges
          </h2>
          <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-xl shadow-slate-100/20">
             <div className="divide-y divide-slate-50">
                {stats?.recentTransactions.length === 0 ? (
                   <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent recharges</div>
                ) : stats?.recentTransactions.map((tx: any) => (
                   <div key={tx._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="space-y-1">
                         <p className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors">{tx.reason}</p>
                         <p className="text-[10px] text-slate-400 font-bold">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-emerald-100">
                         +{tx.tiffinCount}
                      </div>
                   </div>
                ))}
             </div>
             <Link href="/dashboard/users" className="block p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 border-t border-slate-50 transition-colors">
                View All Customers
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
