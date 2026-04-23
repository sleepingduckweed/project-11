'use client';

import { useEffect, useState } from 'react';
import { Users, ClipboardList, AlertCircle } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    lunchOrders: 0,
    dinnerOrders: 0,
    lowBalanceUsers: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users').then(res => res.json()),
        fetch('/api/admin/orders').then(res => res.json()),
      ]);

      if (usersRes && Array.isArray(usersRes.users) && Array.isArray(ordersRes)) {
        setStats({
          totalUsers: usersRes.total,
          lunchOrders: ordersRes.filter(o => o.mealType === 'Lunch' || o.mealType === 'Both').length,
          dinnerOrders: ordersRes.filter(o => o.mealType === 'Dinner' || o.mealType === 'Both').length,
          lowBalanceUsers: usersRes.users.filter((u: any) => u.tiffinBalance < 2).length,
        });
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: "Today's Lunch", value: stats.lunchOrders, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: "Today's Dinner", value: stats.dinnerOrders, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Low Balance', value: stats.lowBalanceUsers, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="animate-in fade-in slide-in-from-top duration-700">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium tracking-tight">Welcome back! Here's what's happening at Kiyamaa's Kitchen today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.label} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in zoom-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`p-4 rounded-2xl w-fit ${card.bg} ${card.color} shadow-sm`}>
                <Icon className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
