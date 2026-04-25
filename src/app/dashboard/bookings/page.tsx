'use client';

import { useEffect, useState } from 'react';

import { 
  Calendar, Search, ChevronLeft, ChevronRight, 
  Loader2, Filter, UserCheck, UserMinus, 
  Coffee, Sun, Moon, Sparkles, X, Check, Plus
} from 'lucide-react';
import { useDialog } from '@/providers/DialogProvider';
import { MealType, OrderStatus } from '@/types/enums';
import Modal from '@/components/ui/Modal';

export default function BookingsMatrixPage() {
  const { alert, confirm } = useDialog();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Modal State for Quick Booking
  const [bookingModal, setBookingModal] = useState<any>(null); // { user, date }
  const [selectedMeal, setSelectedMeal] = useState(MealType.Lunch);
  const [notifyUser, setNotifyUser] = useState(true);
  const [bookingProcessing, setBookingProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const userRes = await fetch(`/api/admin/users?query=${search}&page=${page}&limit=20`);
      const userData = await userRes.json();
      setUsers(userData.users || []);
      setTotalPages(userData.totalPages || 1);

      // 2. Fetch Orders for next 7 days
      const orderRes = await fetch('/api/admin/orders'); // Existing GET returns today onwards
      const orderData = await orderRes.json();
      setOrders(orderData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate 7 days labels
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0,0,0,0);
      days.push({
        date: d,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        key: d.toDateString()
      });
    }
    return days;
  };

  const dates = getNext7Days();

  const getBookingForSlot = (userId: string, dateKey: string) => {
    return orders.filter((o: any) => 
      o.userId?._id === userId && 
      new Date(o.bookingDate).toDateString() === dateKey &&
      o.status !== OrderStatus.Cancelled
    );
  };

  const handleBooking = async () => {
    if (!bookingModal) return;
    setBookingProcessing(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualBooking: {
            userId: bookingModal.user._id,
            bookingDate: bookingModal.date,
            mealType: selectedMeal,
            notifyUser: notifyUser
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingModal(null);
        fetchData(); // Refresh matrix
        alert("Success", "Booking created successfully", "success");
      } else {
        alert("Error", data.error, "error");
      }
    } catch (err) {
      alert("Error", "Failed to book", "error");
    } finally {
      setBookingProcessing(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    confirm("Confirm Cancellation", "Are you sure you want to cancel this booking? The tiffin will be refunded to the user's correct balance bucket.", async () => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notifyUser: true })
            });
            if (res.ok) {
                fetchData();
                alert("Cancelled", "Booking has been cancelled and refunded.", "success");
            } else {
                alert("Error", "Cancellation failed", "error");
            }
        } catch (err) {
            alert("Error", "An unexpected error occurred", "error");
        }
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Sparkles className="size-8 text-orange-500 fill-orange-500/10" /> Booking Matrix
          </h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Weekly overview for managed customer bookings.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64 shadow-sm"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
           </div>
        </div>
      </div>

      {/* Aggregate Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Today Breakfast', value: orders.filter((o: any) => new Date(o.bookingDate).toDateString() === new Date().toDateString() && o.mealType === 'Breakfast' && o.status !== 'Cancelled').length, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Today Lunch', value: orders.filter((o: any) => new Date(o.bookingDate).toDateString() === new Date().toDateString() && (o.mealType === 'Lunch' || o.mealType === 'Both') && o.status !== 'Cancelled').length, icon: Sun, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Today Dinner', value: orders.filter((o: any) => new Date(o.bookingDate).toDateString() === new Date().toDateString() && (o.mealType === 'Dinner' || o.mealType === 'Both') && o.status !== 'Cancelled').length, icon: Moon, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Load', value: orders.filter((o: any) => new Date(o.bookingDate).toDateString() === new Date().toDateString() && o.status !== 'Cancelled').length, icon: Sparkles, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat: any) => (
            <div key={stat.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm">
                <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                    <stat.icon className="size-6" />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                </div>
            </div>
          ))}
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-orange-50/50 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="p-8 sticky left-0 bg-slate-50/50 z-20 w-80 min-w-[280px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Details</span>
                     </th>
                     {dates.map(d => (
                        <th key={d.key} className="p-4 min-w-[140px] text-center border-l border-slate-100/50">
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">{d.label}</span>
                              <span className="text-2xl font-black text-slate-800 leading-none">{d.day}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.month}</span>
                           </div>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading && users.length === 0 ? (
                     <tr><td colSpan={8} className="p-20 text-center text-slate-400"><Loader2 className="animate-spin inline-block mr-2" /> Loading matrix...</td></tr>
                  ) : users.map((user: any) => (
                     <tr key={user._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-8 sticky left-0 bg-white group hover:bg-slate-50 transition-colors z-10 border-r border-slate-50">
                           <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1 items-end min-w-[60px] mr-2">
                                <div className="flex items-center gap-1">
                                    <Coffee className={`size-3 ${user.breakfastBalance < 1 ? 'text-slate-200' : 'text-amber-500'}`} />
                                    <span className={`text-[10px] font-black ${user.breakfastBalance < 1 ? 'text-slate-200' : 'text-slate-600'}`}>{user.breakfastBalance || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Sun className={`size-3 ${user.lunchBalance < 2 ? 'text-red-300' : 'text-orange-500'}`} />
                                    <span className={`text-[10px] font-black ${user.lunchBalance < 2 ? 'text-red-300' : 'text-slate-600'}`}>{user.lunchBalance || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Moon className={`size-3 ${user.dinnerBalance < 2 ? 'text-red-300' : 'text-blue-500'}`} />
                                    <span className={`text-[10px] font-black ${user.dinnerBalance < 2 ? 'text-red-300' : 'text-slate-600'}`}>{user.dinnerBalance || 0}</span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-black text-slate-800 truncate max-w-[140px]">{user.name}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.plan || 'Regular'}</span>
                              </div>
                           </div>
                        </td>
                        {dates.map(date => {
                           const bookings = getBookingForSlot(user._id, date.key);
                           return (
                              <td key={date.key} className="p-3 border-l border-slate-50 hover:bg-orange-50/30 transition-all text-center">
                                 {bookings.length > 0 ? (
                                    <div className="flex flex-col gap-1 items-center">
                                       {bookings.map((b: any) => (
                                          <button 
                                            key={b._id}
                                            onClick={() => handleCancel(b._id)}
                                            className={`w-full py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                                              b.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' : 
                                              b.mealType === 'Lunch' ? 'bg-emerald-100 text-emerald-700' : 
                                              b.mealType === 'Both' ? 'bg-orange-600 text-white shadow-orange-100' :
                                              'bg-blue-100 text-blue-700'
                                            }`}
                                          >
                                             {b.mealType === 'Both' ? <Sparkles className="size-3" /> : null}
                                             {b.mealType}
                                          </button>
                                       ))}
                                       <button 
                                          onClick={() => setBookingModal({ user, date: date.date })}
                                          className="size-6 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                                       >
                                          <Plus className="size-3" />
                                       </button>
                                    </div>
                                 ) : (
                                    <button 
                                       onClick={() => setBookingModal({ user, date: date.date })}
                                       className="w-full h-12 dashed border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-500 transition-all opacity-40 hover:opacity-100 group"
                                    >
                                       <Plus className="size-5 group-hover:scale-125 transition-transform" />
                                    </button>
                                 )}
                              </td>
                           );
                        })}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="p-8 border-t border-slate-50 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400">Page {page} of {totalPages}</span>
            <div className="flex gap-4">
               <button 
                 disabled={page <= 1}
                 onClick={() => setPage(page - 1)}
                 className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-orange-500 hover:text-white disabled:opacity-30 transition-all"
               >
                  <ChevronLeft className="size-5" />
               </button>
               <button 
                 disabled={page >= totalPages}
                 onClick={() => setPage(page + 1)}
                 className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-orange-500 hover:text-white disabled:opacity-30 transition-all"
               >
                  <ChevronRight className="size-5" />
               </button>
            </div>
         </div>
      </div>

      {/* Quick Booking Modal */}
      <Modal
        isOpen={!!bookingModal}
        onClose={() => setBookingModal(null)}
        title="Quick Booking"
        footer={
           <button 
              disabled={bookingProcessing}
              onClick={handleBooking}
              className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              {bookingProcessing ? <Loader2 className="animate-spin size-4" /> : <Sparkles className="size-4" />}
              Confirm Booking
           </button>
        }
      >
            <div className="space-y-8">
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                  <p className="text-sm font-black text-slate-800 leading-none">{bookingModal?.user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{bookingModal?.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
               </div>

               {/* Premium Meal Picker */}
               <div className="grid grid-cols-2 gap-4">
                     {[
                        { id: MealType.Breakfast, icon: Coffee, desc: '9 AM - 11 AM' },
                        { id: MealType.Lunch, icon: Sun, desc: '12 PM - 2 PM' },
                        { id: MealType.Dinner, icon: Moon, desc: '7 PM - 9 PM' },
                        { id: MealType.Both, icon: Sparkles, desc: 'Lunch & Dinner' }
                     ].map((meal: any) => (
                        <button 
                          key={meal.id}
                          onClick={() => setSelectedMeal(meal.id)}
                          className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-3 transition-all ${
                             selectedMeal === meal.id 
                             ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100' 
                             : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                           <div className={`size-10 rounded-2xl flex items-center justify-center ${selectedMeal === meal.id ? 'bg-orange-500 text-white animate-bounce-subtle' : 'bg-slate-50 text-slate-500'}`}>
                              <meal.icon className="size-5" />
                           </div>
                           <div className="text-center">
                              <p className={`font-black uppercase tracking-widest text-[10px] ${selectedMeal === meal.id ? 'text-orange-900' : 'text-slate-700'}`}>{meal.id}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">{meal.desc}</p>
                           </div>
                        </button>
                     ))}
               </div>

               {/* Balance Info & Notify */}
               <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <div className="size-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                           <Check className="size-4" />
                        </div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                            {selectedMeal === MealType.Both ? 'Deduct 1 Lunch + 1 Dinner' : `Deduct 1 ${selectedMeal}`}
                        </p>
                     </div>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Notify</span>
                        <div className="relative">
                           <input type="checkbox" className="sr-only" checked={notifyUser} onChange={e => setNotifyUser(e.target.checked)} />
                           <div className={`w-8 h-4 rounded-full transition-colors ${notifyUser ? 'bg-orange-500' : 'bg-slate-200'}`} />
                           <div className={`absolute top-0.5 left-0.5 bg-white size-3 rounded-full transition-transform ${notifyUser ? 'translate-x-4' : ''}`} />
                        </div>
                     </label>
                  </div>
               </div>
            </div>
      </Modal>

      {/* Styled Inline Styles for bounce animation */}
      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
