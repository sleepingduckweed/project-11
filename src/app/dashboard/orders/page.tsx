'use client';

import { useEffect, useState } from 'react';
import { Send, CheckCircle2, ClipboardList, Loader2, Info, Search, X } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  const getTriggerSlots = () => {
    const now = new Date();
    const hour = now.getHours();
    const slots = [];
    
    // Logic: Today Dinner + Next 3 slots
    let startOffset = hour < 14 ? 0 : 0.5; // If early, can start with today lunch? 
    // User specifically asked: at 3pm, show Dinner Today, Lunch tomorrow, Dinner tomorrow, Lunch day after.
    
    const baseDate = new Date();
    if (hour >= 14) {
        // Dinner Today
        slots.push({ label: 'Today Dinner', dayLabel: 'Today', mealType: 'Dinner', dateStr: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(baseDate) });
        // Tomorrow Lunch
        const tomorrow = new Date(baseDate); tomorrow.setDate(baseDate.getDate() + 1);
        slots.push({ label: 'Tomorrow Lunch', dayLabel: 'Tomorrow', mealType: 'Lunch', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
        // Tomorrow Dinner
        slots.push({ label: 'Tomorrow Dinner', dayLabel: 'Tomorrow', mealType: 'Dinner', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
        // Day After Lunch
        const dayAfter = new Date(baseDate); dayAfter.setDate(baseDate.getDate() + 2);
        slots.push({ label: 'Day After Lunch', dayLabel: 'Day After', mealType: 'Lunch', dateStr: dayAfter.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(dayAfter) });
    } else {
        // Today Lunch
        slots.push({ label: 'Today Lunch', dayLabel: 'Today', mealType: 'Lunch', dateStr: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(baseDate) });
        // Today Dinner
        slots.push({ label: 'Today Dinner', dayLabel: 'Today', mealType: 'Dinner', dateStr: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(baseDate) });
        // Tomorrow Lunch
        const tomorrow = new Date(baseDate); tomorrow.setDate(baseDate.getDate() + 1);
        slots.push({ label: 'Tomorrow Lunch', dayLabel: 'Tomorrow', mealType: 'Lunch', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
        // Tomorrow Dinner
        slots.push({ label: 'Tomorrow Dinner', dayLabel: 'Tomorrow', mealType: 'Dinner', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
    }
    return slots;
  };

  const [showPromptModal, setShowPromptModal] = useState<any>(null);
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (showPromptModal) {
      setModalPage(1);
      fetchModalUsers('', 1);
    }
  }, [showPromptModal]);

  const fetchModalUsers = async (query: string, page: number) => {
    setModalLoading(true);
    const res = await fetch(`/api/admin/users?query=${query}&page=${page}&limit=10`);
    const data = await res.json();
    setModalUsers(data.users || []);
    setModalTotalPages(data.totalPages || 1);
    setModalLoading(false);
  };

  const handleModalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setModalSearch(val);
    setModalPage(1);
    fetchModalUsers(val, 1);
  };

  const handleModalPageChange = (newPage: number) => {
    setModalPage(newPage);
    fetchModalUsers(modalSearch, newPage);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleManualBroadcast = (slot: any) => {
    setShowPromptModal(slot);
    setSelectedUserIds([]);
  };

  const confirmBroadcast = async () => {
    if (selectedUserIds.length === 0) {
        if (!confirm(`No users selected. Send to ALL active users with balance for ${showPromptModal.label}?`)) return;
    } else {
        if (!confirm(`Send booking prompt for ${showPromptModal.label} to ${selectedUserIds.length} selected users?`)) return;
    }
    
    const slot = showPromptModal;
    setProcessing(slot.label);
    setShowPromptModal(null);

    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ 
        slotLabel: slot.label, 
        slotDate: slot.date,
        userIds: selectedUserIds 
      }),
    });
    if (res.ok) {
        const data = await res.json();
        alert(`Prompt sent to ${data.sentCount} users!`);
    }
    setProcessing(null);
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  const handleDispatch = async (mealType: string) => {
    setProcessing(mealType);
    const res = await fetch('/api/admin/orders', {
      method: 'POST',
      body: JSON.stringify({ mealType }),
    });
    if (res.ok) {
      alert(`Dispatched all ${mealType} orders and sent notifications!`);
      fetchOrders();
    }
    setProcessing(null);
  };

  const lunchOrders = orders.filter(o => o.mealType === 'Lunch' || o.mealType === 'Both');
  const dinnerOrders = orders.filter(o => o.mealType === 'Dinner' || o.mealType === 'Both');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daily Bookings</h1>
        <p className="text-slate-500">Manage today's tiffin distribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lunch Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-emerald-700">
              <div className="size-3 bg-emerald-500 rounded-full" /> Lunch Orders ({lunchOrders.length})
            </h2>
            <button 
              disabled={lunchOrders.length === 0 || processing === 'Lunch'}
              onClick={() => handleDispatch('Lunch')}
              className="btn btn-primary btn-sm flex items-center gap-2 text-sm py-1.5"
            >
              {processing === 'Lunch' ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Dispatch All Lunch
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[200px]">
             {loading ? (
                <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
             ) : lunchOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No lunch bookings for today.</div>
             ) : (
               <table className="w-full text-left">
                 <tbody className="divide-y divide-slate-100">
                   {lunchOrders.map(order => (
                     <tr key={order._id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium text-slate-800">{order.userId?.name}</td>
                       <td className="px-4 py-3 text-sm text-slate-500">{order.userId?.phone}</td>
                       <td className="px-4 py-3 text-right">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                           {order.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

        {/* Dinner Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-orange-700">
              <div className="size-3 bg-orange-500 rounded-full" /> Dinner Orders ({dinnerOrders.length})
            </h2>
            <button 
               disabled={dinnerOrders.length === 0 || processing === 'Dinner'}
               onClick={() => handleDispatch('Dinner')}
               className="btn bg-orange-600 text-white hover:bg-orange-700 active:scale-95 btn-sm flex items-center gap-2 text-sm py-1.5"
            >
              {processing === 'Dinner' ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Dispatch All Dinner
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[200px]">
            {loading ? (
                <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
             ) : dinnerOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No dinner bookings for today.</div>
             ) : (
               <table className="w-full text-left">
                 <tbody className="divide-y divide-slate-100">
                   {dinnerOrders.map(order => (
                     <tr key={order._id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium text-slate-800">{order.userId?.name}</td>
                       <td className="px-4 py-3 text-sm text-slate-500">{order.userId?.phone}</td>
                       <td className="px-4 py-3 text-right">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                           {order.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>
      </div>

      {/* Trigger Hub */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Send className="size-5 text-emerald-600" />
          <h2 className="text-lg font-bold">WhatsApp Trigger Hub</h2>
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-2">Manual Prompts</span>
        </div>
        <p className="text-sm text-slate-500">Send a booking prompt to all active users for upcoming slots.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {mounted && getTriggerSlots().map((slot, index) => (
            <button
              key={index}
              onClick={() => handleManualBroadcast(slot)}
              disabled={!!processing}
              className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-wider">{slot.dayLabel}</span>
              <span className="text-lg font-bold text-slate-800">{slot.mealType}</span>
              <span className="text-[10px] text-slate-500">{slot.dateStr}</span>
              {processing === slot.label && <Loader2 className="size-4 animate-spin mt-2" />}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-2xl w-full max-w-2xl flex flex-col h-[92vh] md:h-auto md:max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom md:zoom-in duration-300">
            {/* Handle for mobile pull-down feel */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 md:hidden" />
            
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem] md:rounded-t-2xl">
               <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">Send Booking Prompt</h2>
                  <p className="text-sm text-slate-500 font-medium">{showPromptModal.label} • {showPromptModal.dateStr}</p>
               </div>
               <button onClick={() => setShowPromptModal(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors active:scale-95"><X className="size-6 text-slate-400" /></button>
            </div>

            <div className="p-4 md:p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="input pl-12 py-3 text-base md:text-sm"
                      value={modalSearch}
                      onChange={handleModalSearch}
                    />
                 </div>
                 <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <Info className="size-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">
                      {selectedUserIds.length === 0 ? 'Broadcasting to ALL active users' : `${selectedUserIds.length} users selected`}
                    </span>
                 </div>
              </div>

              {/* Responsive User List: Card List on Mobile, Table on Desktop */}
              <div className="flex-1 border border-slate-100 rounded-2xl overflow-y-auto bg-slate-50/30">
                 {/* Desktop Table View */}
                 <table className="w-full text-left border-collapse hidden md:table">
                    <thead className="bg-white sticky top-0 border-b border-slate-100 z-10">
                       <tr>
                          <th className="px-6 py-4 w-12">
                             <input 
                               type="checkbox" 
                               className="size-5 rounded-lg accent-emerald-500 cursor-pointer" 
                               checked={selectedUserIds.length > 0 && selectedUserIds.length === modalUsers.length}
                               onChange={(e) => {
                                  if (e.target.checked) setSelectedUserIds(modalUsers.map(u => u._id));
                                  else setSelectedUserIds([]);
                               }}
                             />
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">User Details</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider text-right">Balance</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                       {modalLoading ? (
                          <tr><td colSpan={3} className="p-16 text-center text-slate-400 font-medium"><Loader2 className="animate-spin inline-block mr-3" /> Fetching latest users...</td></tr>
                       ) : modalUsers.length === 0 ? (
                          <tr><td colSpan={3} className="p-16 text-center text-slate-400 font-medium">No users found for "{modalSearch}"</td></tr>
                       ) : modalUsers.map(user => (
                          <tr key={user._id} className={`hover:bg-emerald-50/30 transition-colors cursor-pointer ${selectedUserIds.includes(user._id) ? 'bg-emerald-50/50' : ''}`} onClick={() => toggleUserSelection(user._id)}>
                             <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                <input 
                                  type="checkbox" 
                                  className="size-5 rounded-lg accent-emerald-500 cursor-pointer" 
                                  checked={selectedUserIds.includes(user._id)} 
                                  onChange={() => toggleUserSelection(user._id)}
                                />
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex flex-col">
                                   <span className="font-bold text-slate-800">{user.name}</span>
                                   <span className="text-sm text-slate-500">{user.phone}</span>
                                </div>
                             </td>
                             <td className={`px-6 py-4 text-right font-black ${user.tiffinBalance < 2 ? 'text-red-500' : 'text-emerald-600'}`}>{user.tiffinBalance}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>

                 {/* Mobile Card List View */}
                 <div className="md:hidden divide-y divide-slate-100 bg-white">
                    {modalLoading ? (
                       <div className="p-12 text-center text-slate-400 font-medium"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</div>
                    ) : modalUsers.length === 0 ? (
                       <div className="p-12 text-center text-slate-400 font-medium">No users found.</div>
                    ) : modalUsers.map(user => (
                       <div key={user._id} className={`p-5 flex items-center gap-4 active:bg-emerald-50 transition-colors ${selectedUserIds.includes(user._id) ? 'bg-emerald-50/50' : ''}`} onClick={() => toggleUserSelection(user._id)}>
                          <div onClick={e => e.stopPropagation()}>
                             <input 
                               type="checkbox" 
                               className="size-6 rounded-lg accent-emerald-500" 
                               checked={selectedUserIds.includes(user._id)} 
                               onChange={() => toggleUserSelection(user._id)}
                             />
                          </div>
                          <div className="flex-1">
                             <p className="font-black text-slate-800">{user.name}</p>
                             <p className="text-sm text-slate-500">{user.phone}</p>
                          </div>
                          <div className="text-right">
                             <p className={`font-black text-lg ${user.tiffinBalance < 2 ? 'text-red-500' : 'text-emerald-600'}`}>{user.tiffinBalance}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Tiffins</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="flex items-center justify-between px-2">
                 <div className="text-sm text-slate-400 font-bold tracking-tight">Page {modalPage} of {modalTotalPages}</div>
                 <div className="flex gap-4">
                    <button 
                      disabled={modalPage <= 1} 
                      onClick={() => handleModalPageChange(modalPage - 1)}
                      className="p-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                    >
                       <X className="size-5 rotate-45 text-slate-600" /> 
                    </button>
                    <button 
                      disabled={modalPage >= modalTotalPages} 
                      onClick={() => handleModalPageChange(modalPage + 1)}
                      className="p-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                    >
                       <Send className="size-5 -rotate-45 text-slate-600" />
                    </button>
                 </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 md:rounded-b-2xl flex flex-col md:flex-row gap-3">
               <button onClick={() => setShowPromptModal(null)} className="btn btn-secondary py-4 md:py-2 text-lg md:text-base order-2 md:order-1">Cancel</button>
               <button onClick={confirmBroadcast} className="btn btn-primary py-4 md:py-2 text-lg md:text-base flex-1 flex items-center justify-center gap-3 order-1 md:order-2 shadow-lg shadow-emerald-200">
                  <Send className="size-5" />
                  <span className="font-bold">{selectedUserIds.length === 0 ? 'Send to All Active' : `Send to ${selectedUserIds.length} Selected`}</span>
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700">
        <Info className="size-6 shrink-0" />
        <p className="text-sm">Dispatching an order marks it as sent and automatically sends a WhatsApp notification to the customer. This action cannot be undone.</p>
      </div>
    </div>
  );
}
