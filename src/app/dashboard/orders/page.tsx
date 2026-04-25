'use client';

import { useEffect, useState } from 'react';
import { Send, CheckCircle2, ClipboardList, Loader2, Info, Search, X, Plus, Calendar, User, ShoppingBag, Coffee, Sun, Moon, Sparkles, MessageCircle } from 'lucide-react';
import { useDialog } from '@/providers/DialogProvider';
import { MealType, OrderStatus } from '@/types/enums';
import Modal from '@/components/ui/Modal';

export default function OrdersPage() {
  const { alert, confirm } = useDialog();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [notifyOnCancel, setNotifyOnCancel] = useState(true);
  const [notifyOnDispatch, setNotifyOnDispatch] = useState(true);
  const [individualNotify, setIndividualNotify] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  // Manual Booking States
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [bookingUser, setBookingUser] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingMealType, setBookingMealType] = useState('Lunch');
  const [notifyOnManual, setNotifyOnManual] = useState(true);
  const [bookingProcessing, setBookingProcessing] = useState(false);

  // Search Modal for Booking
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);

  // Broadcast Stats
  const [showPromptModal, setShowPromptModal] = useState<any>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

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

  const openUserSearch = () => {
    setShowUserSearch(true);
    setModalPage(1);
    fetchModalUsers('', 1);
  };

  const selectUserForBooking = (user: any) => {
    setBookingUser(user);
    setShowUserSearch(false);
  };

  const handleManualBooking = async () => {
    if (!bookingUser) return alert('Error', 'Please select a customer', 'error');
    
    const impact = bookingMealType === 'Both' ? 2 : 1;
    confirm("Confirm Manual Booking", `Are you sure you want to book ${bookingMealType} for ${bookingUser.name}? This will deduct ${impact} tiffin(s) from their balance.`, async () => {
        setBookingProcessing(true);
        try {
          const res = await fetch('/api/admin/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              manualBooking: {
                userId: bookingUser._id,
                bookingDate,
                mealType: bookingMealType,
                notifyUser: notifyOnManual
              }
            })
          });
          const data = await res.json();
          if (data.success) {
            alert('Success', 'Booking successful!', 'success');
            setBookingUser(null);
            fetchOrders();
          } else {
            alert('Error', data.error, 'error');
          }
        } catch (err) {
          alert('Error', 'Failed to process booking', 'error');
        } finally {
          setBookingProcessing(false);
        }
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDispatch = (mealType: string) => {
    confirm("Confirm Bulk Dispatch", `Are you sure you want to dispatch all ${mealType} orders? This will notify all relevant customers.`, async () => {
        setProcessing(mealType);
        try {
          const res = await fetch('/api/admin/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mealType, notifyUser: notifyOnDispatch }),
          });
          if (res.ok) {
            alert('Success', `Dispatched all ${mealType} orders!`, 'success');
            fetchOrders();
          } else {
            alert('Error', 'Failed to dispatch', 'error');
          }
        } catch (err) {
          alert('Error', 'An unexpected error occurred', 'error');
        } finally {
          setProcessing(null);
        }
    });
  };

  const handleIndividualDispatch = async (orderId: string) => {
    const shouldNotify = individualNotify[orderId] ?? true;
    setDispatchingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.Dispatched, notifyUser: shouldNotify }),
      });
      if (res.ok) {
          fetchOrders();
      } else {
          const data = await res.json();
          alert('Error', data.error, 'error');
      }
    } catch (err) {
      alert('Error', 'Failed to update order', 'error');
    } finally {
      setDispatchingId(null);
    }
  };

  const toggleIndividualNotify = (orderId: string) => {
    setIndividualNotify(prev => ({
        ...prev,
        [orderId]: !(prev[orderId] ?? true)
    }));
  };

  const handleCancelOrder = (orderId: string) => {
    confirm("Cancel Order", "Are you sure you want to cancel this order? The user will be refunded to their specific balance bucket.", async () => {
        setCancellingId(orderId);
        try {
          const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notifyUser: notifyOnCancel })
          });
          const data = await res.json();
          if (data.success) {
            alert('Success', 'Order cancelled and user refunded!', 'success');
            fetchOrders();
          } else {
            alert('Error', data.error, 'error');
          }
        } catch (err) {
          alert('Error', 'Failed to cancel order.', 'error');
        } finally {
          setCancellingId(null);
        }
    });
  };

  const getTriggerSlots = () => {
    const now = new Date();
    const hour = now.getHours();
    const slots = [];
    const baseDate = new Date();
    if (hour >= 14) {
        slots.push({ label: 'Today Dinner', dayLabel: 'Today', mealType: 'Dinner', dateStr: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(baseDate) });
        const tomorrow = new Date(baseDate); tomorrow.setDate(baseDate.getDate() + 1);
        slots.push({ label: 'Tomorrow Lunch', dayLabel: 'Tomorrow', mealType: 'Lunch', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
        slots.push({ label: 'Tomorrow Dinner', dayLabel: 'Tomorrow', mealType: 'Dinner', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
        const dayAfter = new Date(baseDate); dayAfter.setDate(baseDate.getDate() + 2);
        slots.push({ label: 'Day After Lunch', dayLabel: 'Day After', mealType: 'Lunch', dateStr: dayAfter.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(dayAfter) });
    } else {
        slots.push({ label: 'Today Lunch', dayLabel: 'Today', mealType: 'Lunch', dateStr: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(baseDate) });
        slots.push({ label: 'Today Dinner', dayLabel: 'Today', mealType: 'Dinner', dateStr: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(baseDate) });
        const tomorrow = new Date(baseDate); tomorrow.setDate(baseDate.getDate() + 1);
        slots.push({ label: 'Tomorrow Lunch', dayLabel: 'Tomorrow', mealType: 'Lunch', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
        slots.push({ label: 'Tomorrow Dinner', dayLabel: 'Tomorrow', mealType: 'Dinner', dateStr: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), date: new Date(tomorrow) });
    }
    return slots;
  };

  const handleManualBroadcast = (slot: any) => {
    setShowPromptModal(slot);
    setSelectedUserIds([]);
    setModalPage(1);
    fetchModalUsers('', 1);
  };

  const confirmBroadcast = async () => {
    const slot = showPromptModal;
    const sendToAll = selectedUserIds.length === 0;
    
    confirm(
        sendToAll ? "Broadcast to ALL?" : "Send to Selected?",
        sendToAll 
            ? `Send booking prompt for ${slot.label} to ALL active users with sufficient balance?`
            : `Send booking prompt for ${slot.label} to ${selectedUserIds.length} selected users?`,
        async () => {
            setProcessing(slot.label);
            setShowPromptModal(null);
            try {
                const res = await fetch('/api/admin/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slotLabel: slot.label, slotDate: slot.date, userIds: selectedUserIds }),
                });
                if (res.ok) {
                    const data = await res.json();
                    alert('Success', `Message sent to ${data.sentCount} users!`, 'success');
                } else {
                    alert('Error', 'Failed to send broadcast', 'error');
                }
            } catch (err) {
                alert('Error', 'An unexpected error occurred', 'error');
            } finally {
                setProcessing(null);
            }
        }
    );
  };

  const todayStr = new Date().toDateString();
  const breakfastOrders = orders.filter(o => (new Date(o.bookingDate).toDateString() === todayStr) && (o.mealType === MealType.Breakfast));
  const lunchOrders = orders.filter(o => (new Date(o.bookingDate).toDateString() === todayStr) && (o.mealType === MealType.Lunch || o.mealType === 'Both'));
  const dinnerOrders = orders.filter(o => (new Date(o.bookingDate).toDateString() === todayStr) && (o.mealType === MealType.Dinner || o.mealType === 'Both'));

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Orders Dashboard</h1>
           <p className="text-slate-500 font-medium">Manage daily distribution and manual bookings.</p>
        </div>
        <button 
           onClick={() => setShowManualBooking(!showManualBooking)}
           className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95"
        >
           {showManualBooking ? <X className="size-5" /> : <Plus className="size-5" />}
           {showManualBooking ? 'Close Manual Booking' : 'New Manual Order'}
        </button>
      </div>

      {/* Manual Booking Panel */}
      {showManualBooking && (
        <div className="bg-white p-10 rounded-[3rem] border border-orange-100 shadow-2xl shadow-orange-50/50 animate-in zoom-in-95 duration-500 space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <ShoppingBag className="size-64 -rotate-12" />
           </div>
           
           <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Sparkles className="size-6 text-orange-500" /> Direct User Booking
              </h2>
              <p className="text-slate-500 font-medium">Add orders directly to the system without WhatsApp prompts.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Customer</label>
                 <button 
                   onClick={openUserSearch}
                   className="w-full text-left p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-orange-500 transition-all"
                 >
                    {bookingUser ? (
                       <div className="truncate">
                          <p className="font-bold text-slate-800">{bookingUser.name}</p>
                          <p className="text-xs text-slate-500">{bookingUser.phone}</p>
                       </div>
                    ) : (
                       <span className="text-slate-400 flex items-center justify-between">Pick a user <Plus className="size-4" /></span>
                    )}
                 </button>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booking Date</label>
                 <input 
                   type="date" 
                   value={bookingDate}
                   onChange={e => setBookingDate(e.target.value)}
                   className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700" 
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meal Type</label>
                 <select 
                   value={bookingMealType}
                   onChange={e => setBookingMealType(e.target.value)}
                   className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat"
                 >
                    <option value={MealType.Breakfast}>Breakfast</option>
                    <option value={MealType.Lunch}>Lunch</option>
                    <option value={MealType.Dinner}>Dinner</option>
                 </select>
              </div>

              <div className="flex flex-col justify-end gap-3">
                 <label className="flex items-center gap-3 cursor-pointer mb-1">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={notifyOnManual}
                        onChange={(e) => setNotifyOnManual(e.target.checked)}
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${notifyOnManual ? 'bg-orange-500' : 'bg-slate-200'}`} />
                      <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${notifyOnManual ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notify WhatsApp</span>
                 </label>
                 <button 
                   disabled={!bookingUser || bookingProcessing}
                   onClick={handleManualBooking}
                   className="w-full bg-orange-600 text-white p-5 rounded-3xl font-black shadow-lg hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {bookingProcessing ? <Loader2 className="animate-spin size-5" /> : <ShoppingBag className="size-5" />}
                    Confirm Booking
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Trigger Hub Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <MessageCircle className="size-48" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Send className="size-6 text-orange-600" /> WhatsApp Trigger Hub
                        </h2>
                        <p className="text-slate-500 font-medium">Send manual booking prompts for upcoming slots.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {mounted && getTriggerSlots().map((slot, index) => (
                        <button
                            key={index}
                            onClick={() => handleManualBroadcast(slot)}
                            disabled={!!processing}
                            className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-orange-500 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group"
                        >
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-orange-600 uppercase tracking-widest mb-1">{slot.dayLabel}</span>
                            <span className="text-lg font-black text-slate-800">{slot.mealType}</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">{slot.dateStr}</span>
                            {processing === slot.label && <Loader2 className="size-4 animate-spin mt-3 text-orange-500" />}
                        </button>
                    ))}
                </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="size-32" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Today's Load</h3>
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-4xl font-black">{breakfastOrders.length + lunchOrders.length + dinnerOrders.length}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-right">Total<br/>Tiffins</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1">
                            <p className="text-lg font-black text-amber-500">{breakfastOrders.length}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Breakfast</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-black text-emerald-500">{lunchOrders.length}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Lunch</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-black text-blue-500">{dinnerOrders.length}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Dinner</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Distribution Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {[
          { label: MealType.Breakfast, orders: breakfastOrders, color: 'amber', icon: Coffee },
          { label: MealType.Lunch, orders: lunchOrders, color: 'emerald', icon: Sun },
          { label: MealType.Dinner, orders: dinnerOrders, color: 'blue', icon: Moon }
        ].map(section => (
          <div key={section.label} className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className={`flex items-center gap-3 text-slate-900 font-black text-xl tracking-tight`}>
                    <section.icon className={`size-5 text-${section.color}-500`} /> 
                    {section.label}
                    <span className="text-xs font-bold text-slate-300 ml-1">({section.orders.length})</span>
                </h2>
                <button 
                    disabled={section.orders.filter(o => o.status === OrderStatus.Booked).length === 0 || processing === section.label}
                    onClick={() => handleDispatch(section.label)}
                    className={`px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-30`}
                >
                    {processing === section.label ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                    Dispatch All
                </button>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden min-h-[300px] shadow-sm flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-16"><Loader2 className="animate-spin text-orange-500" /></div>
                ) : section.orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-4">
                        <section.icon className="size-8 text-slate-200" />
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No bookings</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
                        {section.orders.map(order => (
                          <div key={order._id} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                             <div className="space-y-1">
                                <p className="font-black text-slate-800 text-sm leading-tight">{order.userId?.name || 'Unknown'}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400 font-bold">{order.userId?.phone || 'No Phone'}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                                        order.status === OrderStatus.Dispatched ? 'text-blue-500' : 
                                        order.status === OrderStatus.Cancelled ? 'text-red-500' : 
                                        'text-orange-500'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-2">
                               {order.status === OrderStatus.Booked && (
                                 <>
                                    <button
                                        onClick={() => toggleIndividualNotify(order._id)}
                                        className={`size-8 rounded-xl flex items-center justify-center border transition-all ${
                                            (individualNotify[order._id] ?? true) 
                                            ? 'bg-orange-50 border-orange-100 text-orange-600' 
                                            : 'bg-slate-50 border-slate-100 text-slate-300'
                                        }`}
                                    >
                                        <MessageCircle className="size-4" />
                                    </button>
                                    <button
                                        disabled={dispatchingId === order._id}
                                        onClick={() => handleIndividualDispatch(order._id)}
                                        className="size-8 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        {dispatchingId === order._id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                                    </button>
                                 </>
                               )}
                               
                               {order.status !== OrderStatus.Cancelled && (
                                 <button
                                   disabled={cancellingId === order._id}
                                   onClick={() => handleCancelOrder(order._id)}
                                   className="size-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
                                 >
                                   {cancellingId === order._id ? <Loader2 className="size-3 animate-spin" /> : <X className="size-4" />}
                                 </button>
                               )}
                             </div>
                          </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Search Modal */}
      <Modal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} title="Select Customer">
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input 
                    type="text" 
                    placeholder="Search name or phone..." 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                    value={modalSearch}
                    onChange={handleModalSearch}
                />
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
                {modalLoading ? (
                    <div className="py-12 text-center text-slate-400"><Loader2 className="animate-spin inline-block mr-2" /> Searching...</div>
                ) : modalUsers.map(user => (
                    <div 
                        key={user._id} 
                        className="py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-4 rounded-xl transition-colors"
                        onClick={() => selectUserForBooking(user)}
                    >
                        <div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-orange-600 uppercase tracking-widest">{user.subscriptionPlan}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </Modal>

      {/* Broadcast Modal */}
      <Modal 
        isOpen={!!showPromptModal} 
        onClose={() => setShowPromptModal(null)} 
        title={showPromptModal ? `Broadcast: ${showPromptModal.label}` : 'Broadcast'}
      >
        <div className="space-y-6">
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4 text-orange-800">
                <Info className="size-5 shrink-0 mt-1" />
                <p className="text-sm leading-relaxed">
                    This will send a booking prompt to users. You can search and select specific users, or leave selection empty to broadcast to <strong>ALL</strong> active users with balance.
                </p>
            </div>
            
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input 
                    type="text" 
                    placeholder="Filter users..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                    value={modalSearch}
                    onChange={handleModalSearch}
                />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
                {modalUsers.map(user => (
                    <div 
                        key={user._id} 
                        className={`p-3 flex items-center justify-between rounded-xl border transition-all cursor-pointer ${
                            selectedUserIds.includes(user._id) ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
                        }`}
                        onClick={() => toggleUserSelection(user._id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`size-4 rounded border transition-colors flex items-center justify-center ${
                                selectedUserIds.includes(user._id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                            }`}>
                                {selectedUserIds.includes(user._id) && <CheckCircle2 className="size-3" />}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{user.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">{user.phone}</span>
                    </div>
                ))}
            </div>

            <button 
                onClick={confirmBroadcast}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-3"
            >
                <Send className="size-5" />
                {selectedUserIds.length === 0 ? 'Broadcast to All Active' : `Send to ${selectedUserIds.length} Selected`}
            </button>
        </div>
      </Modal>
    </div>
  );
}
