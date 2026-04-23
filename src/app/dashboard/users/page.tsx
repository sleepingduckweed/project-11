'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Phone, MapPin, Wallet, Edit2, Check, X, Loader2, History } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', phone: '', address: '', foodPreference: 'Veg' });
  const [rechargeUser, setRechargeUser] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showLedger, setShowLedger] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showLedger) {
      fetchTransactions(showLedger._id);
    }
  }, [showLedger]);

  const fetchTransactions = async (userId: string) => {
    setLedgerLoading(true);
    const res = await fetch(`/api/admin/transactions?userId=${userId}`);
    const data = await res.json();
    setTransactions(data);
    setLedgerLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewUser({ name: '', phone: '', address: '', foodPreference: 'Veg' });
      fetchUsers();
    }
  };

  const handleRecharge = async () => {
    const amount = Number(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid number of tiffins (minimum 1)");
      return;
    }

    const res = await fetch(`/api/admin/users/${rechargeUser._id}`, {
      method: 'PUT',
      body: JSON.stringify({ tiffinCount: amount }),
    });
    if (res.ok) {
      setRechargeUser(null);
      setRechargeAmount('');
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Manage your tiffin customers and their balances</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="size-5" /> Add New User
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="input pl-10 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List - Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Contact & Food</th>
              <th className="px-8 py-5">Preferred Time</th>
              <th className="px-8 py-5">Balance</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500"><Loader2 className="animate-spin inline-block size-8 text-emerald-500" /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold">No users found.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <p className="font-black text-slate-800 text-lg">{user.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-medium"><MapPin className="size-3" /> {user.address}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-slate-600 font-bold flex items-center gap-2 tracking-tight"><Phone className="size-4" /> {user.phone}</p>
                    <span className={`text-[10px] w-fit px-3 py-1 rounded-full font-black uppercase tracking-widest ${user.foodPreference === 'Veg' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.foodPreference}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-700">{user.preferredReminderTime || '09:00'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Prompt</p>
                </td>
                <td className="px-8 py-5">
                  <p className={`text-xl font-black ${user.tiffinBalance < 2 ? 'text-red-600' : 'text-emerald-600'}`}>{user.tiffinBalance}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiffins Left</p>
                </td>
                <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setRechargeUser(user)}
                    className="h-10 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-emerald-100"
                  >
                    + Recharge
                  </button>
                  <button 
                    onClick={() => setShowLedger(user)}
                    className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                  >
                    <History className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User List - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
           <div className="p-10 text-center"><Loader2 className="animate-spin inline-block size-8 text-emerald-500" /></div>
        ) : filteredUsers.length === 0 ? (
           <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">No users found.</div>
        ) : (
          filteredUsers.map(user => (
            <div key={user._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1"><MapPin className="size-3" /> {user.address}</p>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${user.foodPreference === 'Veg' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {user.foodPreference}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Balance</p>
                    <p className={`text-2xl font-black ${user.tiffinBalance < 2 ? 'text-red-500' : 'text-emerald-600'}`}>
                       {user.tiffinBalance} <span className="text-[10px] uppercase font-bold text-slate-400">Tiffins</span>
                    </p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Prompt</p>
                    <p className="text-xl font-black text-slate-700">{user.preferredReminderTime || '09:00'}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setRechargeUser(user)}
                   className="flex-1 h-14 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                 >
                   Recharge
                 </button>
                 <button 
                    onClick={() => setShowLedger(user)}
                    className="size-14 flex items-center justify-center bg-slate-50 text-slate-600 rounded-2xl active:scale-90 transition-transform"
                 >
                    <History className="size-6" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold">Add New Tiffin User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input required className="input" placeholder="e.g. Rahul Sharma" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">WhatsApp Number (with 91)</label>
                <input required className="input" placeholder="91XXXXXXXXXX" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Address</label>
                <textarea required className="input min-h-[80px]" placeholder="Full address..." value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Food Preference</label>
                <select className="input" value={newUser.foodPreference} onChange={e => setNewUser({...newUser, foodPreference: e.target.value})}>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {rechargeUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full space-y-6 shadow-2xl">
            <div className="text-center">
              <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="size-8" />
              </div>
              <h2 className="text-xl font-bold">Recharge Wallet</h2>
              <p className="text-slate-500">Adding money for <strong>{rechargeUser.name}</strong></p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Number of Tiffins to Add</label>
                <input 
                  autoFocus
                  type="number" 
                  min="1"
                  className="input text-center text-2xl font-bold" 
                  placeholder="10" 
                  value={rechargeAmount}
                  onChange={e => setRechargeAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setRechargeUser(null)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={handleRecharge} className="btn btn-primary flex-1">Confirm +{rechargeAmount || 0} Tiffins</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Ledger Modal */}
      {showLedger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full space-y-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center shrink-0">
               <h2 className="text-xl font-bold">Tiffin Ledger: {showLedger.name}</h2>
               <button onClick={() => setShowLedger(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="size-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Activity</th>
                    <th className="px-4 py-2 text-right">Tiffins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerLoading ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Loading history...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No activity found.</td></tr>
                  ) : transactions.map(tx => (
                    <tr key={tx._id}>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {mounted && new Date((tx as any).createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{(tx as any).reason}</td>
                      <td className={`px-4 py-3 text-sm font-bold text-right ${(tx as any).type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {(tx as any).type === 'Credit' ? '+' : '-'}{(tx as any).tiffinCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
              <p className="text-sm font-medium text-slate-600 text-center w-full">Current Tiffins: <span className="text-emerald-600 font-bold">{showLedger.tiffinBalance ?? 0}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
