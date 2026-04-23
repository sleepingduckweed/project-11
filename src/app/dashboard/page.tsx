'use client';

import { useEffect, useState } from 'react';
import { Users, ClipboardList, Wallet, AlertCircle } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-500">Welcome back, Tiffin Didi!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex items-center gap-6">
              <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="size-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions or some charts could go here in V1.1 */}
    </div>
  );
}
