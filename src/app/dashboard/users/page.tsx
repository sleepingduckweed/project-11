'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Phone, MapPin, Wallet, Edit2, Check, X, Loader2, History, Coffee, Sun, Moon } from 'lucide-react';
import { useDialog } from '@/providers/DialogProvider';
import { MealType, FoodPreference, PlanType, TransactionType } from '@/types/enums';
import Modal from '@/components/ui/Modal';

export default function UsersPage() {
  const { alert, confirm } = useDialog();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    foodPreference: FoodPreference.Veg as FoodPreference, 
    plan: PlanType.Regular as PlanType 
  });
  const [rechargeUser, setRechargeUser] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeType, setRechargeType] = useState<MealType>(MealType.Lunch);
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
      setNewUser({ 
        name: '', 
        phone: '', 
        address: '', 
        foodPreference: FoodPreference.Veg, 
        plan: PlanType.Regular 
      });
      fetchUsers();
    }
  };

  const handleRecharge = async () => {
    const amount = Number(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid Input", "Please enter a valid number of tiffins (minimum 1)", "error");
      return;
    }

    const res = await fetch(`/api/admin/users/${rechargeUser._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tiffinCount: amount,
        mealType: rechargeType 
      }),
    });
    if (res.ok) {
      setRechargeUser(null);
      setRechargeAmount('');
      fetchUsers();
      alert("Success", "Balance updated successfully!", "success");
    } else {
        alert("Error", "Failed to update balance", "error");
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
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500"><Loader2 className="animate-spin inline-block size-8 text-orange-500" /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold">No users found.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <p className="font-black text-slate-800 text-lg">{user.name}</p>
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.2em]">{user.plan || 'Regular'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-medium"><MapPin className="size-3" /> {user.address}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-slate-600 font-bold flex items-center gap-2 tracking-tight"><Phone className="size-4" /> {user.phone}</p>
                    <span className={`text-[10px] w-fit px-3 py-1 rounded-full font-black uppercase tracking-widest ${user.foodPreference === 'Veg' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {user.foodPreference}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-700">{user.preferredReminderTime || '09:00'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Prompt</p>
                </td>
               <td className="px-8 py-5">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <Coffee className={`size-3.5 mb-1 ${user.breakfastBalance < 1 ? 'text-slate-300' : 'text-amber-500'}`} />
                        <p className={`text-sm font-black ${user.breakfastBalance < 1 ? 'text-slate-300' : 'text-slate-700'}`}>{user.breakfastBalance || 0}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Sun className={`size-3.5 mb-1 ${user.lunchBalance < 2 ? 'text-red-400' : 'text-orange-500'}`} />
                        <p className={`text-sm font-black ${user.lunchBalance < 2 ? 'text-red-400' : 'text-slate-700'}`}>{user.lunchBalance || 0}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Moon className={`size-3.5 mb-1 ${user.dinnerBalance < 2 ? 'text-red-400' : 'text-blue-500'}`} />
                        <p className={`text-sm font-black ${user.dinnerBalance < 2 ? 'text-red-400' : 'text-slate-700'}`}>{user.dinnerBalance || 0}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setRechargeUser(user)}
                    className="h-10 px-4 bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-orange-100"
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
           <div className="p-10 text-center"><Loader2 className="animate-spin inline-block size-8 text-orange-500" /></div>
        ) : filteredUsers.length === 0 ? (
           <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">No users found.</div>
        ) : (
          filteredUsers.map(user => (
            <div key={user._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{user.name}</h3>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.2em]">{user.plan || 'Regular'}</p>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1"><MapPin className="size-3" /> {user.address}</p>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${user.foodPreference === 'Veg' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                  {user.foodPreference}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Balance</p>
                    <p className={`text-2xl font-black ${user.tiffinBalance < 2 ? 'text-red-500' : 'text-orange-600'}`}>
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
                   className="flex-1 h-14 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all"
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
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New Tiffin User"
        footer={
            <>
                <button onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={handleAddUser} className="btn btn-primary flex-1">Save User</button>
            </>
        }
      >
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Full Name</label>
                <input required className="input" placeholder="e.g. Rahul Sharma" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">WhatsApp Number (with 91)</label>
                <input required className="input" placeholder="91XXXXXXXXXX" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Delivery Address</label>
                <textarea required className="input min-h-[80px]" placeholder="Full address..." value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Preference</label>
                    <select className="input" value={newUser.foodPreference} onChange={e => setNewUser({...newUser, foodPreference: e.target.value as any})}>
                    <option value={FoodPreference.Veg}>Veg</option>
                    <option value={FoodPreference.NonVeg}>Non-Veg</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Plan</label>
                    <select className="input" value={newUser.plan} onChange={e => setNewUser({...newUser, plan: e.target.value as PlanType})}>
                        {Object.values(PlanType).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
              </div>
            </div>
      </Modal>

      {/* Recharge Modal */}
      <Modal 
        isOpen={!!rechargeUser} 
        onClose={() => setRechargeUser(null)}
        title="Update Tiffin Balance"
        footer={
            <>
                <button onClick={() => setRechargeUser(null)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={handleRecharge} className="btn btn-primary flex-1">Confirm Update</button>
            </>
        }
      >
            <div className="space-y-8 py-4">
                <div className="flex justify-center gap-6">
                    {[MealType.Breakfast, MealType.Lunch, MealType.Dinner].map(type => (
                        <button 
                            key={type}
                            onClick={() => setRechargeType(type)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${rechargeType === type ? 'border-orange-500 bg-orange-50 shadow-inner' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                        >
                            {type === MealType.Breakfast && <Coffee className={`size-6 ${rechargeType === type ? 'text-orange-600' : 'text-slate-400'}`} />}
                            {type === MealType.Lunch && <Sun className={`size-6 ${rechargeType === type ? 'text-orange-600' : 'text-slate-400'}`} />}
                            {type === MealType.Dinner && <Moon className={`size-6 ${rechargeType === type ? 'text-orange-600' : 'text-slate-400'}`} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                        </button>
                    ))}
                </div>

                <div className="text-center space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tiffins to Add/Subtract</label>
                    <input 
                        autoFocus
                        type="number" 
                        className="w-full bg-slate-50 border-none text-center text-5xl font-black text-slate-800 focus:ring-0 rounded-3xl py-6"
                        placeholder="10" 
                        value={rechargeAmount}
                        onChange={e => setRechargeAmount(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 font-medium italic">Enter negative value to deduct tiffins.</p>
                </div>
            </div>
      </Modal>
      {/* Ledger Modal */}
      <Modal
        isOpen={!!showLedger}
        onClose={() => setShowLedger(null)}
        title={`Tiffin Ledger: ${showLedger?.name}`}
      >
            <div className="overflow-y-auto max-h-[60vh] -mx-4 px-4 pr-2 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Activity</th>
                    <th className="px-4 py-3 text-right">Tiffins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ledgerLoading ? (
                    <tr><td colSpan={3} className="px-4 py-12 text-center text-slate-400"><Loader2 className="animate-spin inline-block size-6" /></td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-12 text-center text-slate-400 font-bold tracking-tight">No activity found.</td></tr>
                  ) : transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-[10px] font-black text-slate-800">{mounted && new Date((tx as any).createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        <p className="text-[8px] font-bold text-slate-400">{mounted && new Date((tx as any).createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-4 py-4 text-[10px] font-bold text-slate-600 leading-relaxed">{(tx as any).reason}</td>
                      <td className={`px-4 py-4 text-xs font-black text-right ${(tx as any).type === TransactionType.Credit ? 'text-emerald-500' : 'text-red-500'}`}>
                        {(tx as any).type === TransactionType.Credit ? '+' : '-'}{(tx as any).tiffinCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      </Modal>
    </div>
  );
}
