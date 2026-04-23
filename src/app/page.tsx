'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Utensils, Heart, Clock, Smartphone, CheckCircle2, Star, Menu, X } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Utensils className="text-white size-6" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent tracking-tight">Kiyamaa's Kitchen</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-slate-500">
            <Link href="#features" className="hover:text-orange-500 transition-colors uppercase text-sm tracking-widest">Features</Link>
            <Link href="#menu" className="hover:text-orange-500 transition-colors uppercase text-sm tracking-widest">Our Menu</Link>
            <Link href="#how-it-works" className="hover:text-orange-500 transition-colors uppercase text-sm tracking-widest">How it Works</Link>
            <Link href="/login" className="btn bg-orange-600 text-white hover:bg-orange-700 px-6 py-2 rounded-full font-bold active:scale-95 transition-all shadow-lg shadow-orange-200">
              Admin Login
            </Link>
          </div>
          <button className="md:hidden text-orange-600"><Menu className="size-8" /></button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
              <Heart className="size-3 fill-orange-700" />
              Cooked with Love
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
              Ghar Ka Khana, <br/>
              <span className="text-orange-500 italic">Dil Se.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              Maa Ke Haath Wala Swaad, Kiyamaa's Kitchen Ke Saath. Experience the warmth of home-style meals, delivered fresh to your doorstep daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="https://wa.me/918340632956" className="bg-emerald-600 text-white hover:bg-emerald-700 px-10 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all hover:-translate-y-2 active:scale-95">
                <Smartphone className="size-6" />
                Order on WhatsApp
              </Link>
              <Link href="#menu" className="bg-white border-2 border-slate-100 text-slate-800 hover:bg-slate-50 px-10 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-sm transition-all hover:border-orange-200">
                View Today's Menu
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="size-12 rounded-full border-4 border-white overflow-hidden bg-slate-100">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Joined by 500+ happy foodies</p>
                <div className="flex text-orange-400">
                   {[1,2,3,4,5].map(i => <Star key={i} className="size-4 fill-current" />)}
                </div>
              </div>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute -inset-4 bg-orange-500/10 rounded-[3rem] blur-3xl rotate-12" />
            <div className="relative bg-white p-4 rounded-[3.5rem] shadow-2xl shadow-orange-200 overflow-hidden border border-orange-100">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden">
                <Image 
                  src="/images/hero.png" 
                  alt="Delicious Indian Tiffin" 
                  layout="fill" 
                  objectFit="cover"
                  className="hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -right-8 top-1/4 bg-white p-5 rounded-2xl shadow-xl animate-bounce space-y-1 z-20">
              <p className="text-2xl font-black text-orange-500">90/-</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Starts from</p>
            </div>
            <div className="absolute -left-12 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-pulse z-20">
              <div className="size-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600 size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 tracking-tight">Eco-friendly Packaging</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Healthier Meals, <br/><span className="text-orange-500">Happier You.</span></h2>
            <p className="text-slate-500 text-lg font-medium">We bring you the perfect balance of nutrition, taste, and hygiene, just like mom makes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-10 rounded-[3rem] bg-rose-50 border border-transparent hover:border-orange-200 transition-all hover:shadow-xl hover:-translate-y-2 group cursor-default`}>
              <div className="size-16 mb-8 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                <Heart className="size-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Ghar Ka Swaad</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Authentic recipes passed down through generations. No preservatives, just love.</p>
            </div>
            <div className={`p-10 rounded-[3rem] bg-amber-50 border border-transparent hover:border-orange-200 transition-all hover:shadow-xl hover:-translate-y-2 group cursor-default`}>
              <div className="size-16 mb-8 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                 <Utensils className="size-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Fresh Ingredients</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Handpicked vegetables and premium oils used daily to ensure the highest quality.</p>
            </div>
            <div className={`p-10 rounded-[3rem] bg-blue-50 border border-transparent hover:border-orange-200 transition-all hover:shadow-xl hover:-translate-y-2 group cursor-default`}>
              <div className="size-16 mb-8 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                 <Clock className="size-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">On-Time Delivery</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Reliable doorstep delivery in eco-friendly tiffins, exactly when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-orange-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-[100px] opacity-50 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600 rounded-full blur-[100px] opacity-30 -ml-48 -mb-48" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-white">
           <div className="grid md:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">Everything Hosted on <br/> <span className="text-orange-200">WhatsApp.</span></h2>
                 <p className="text-xl text-orange-50 opacity-90 leading-relaxed font-medium">No apps, no complex websites. Just a simple "Yes" on WhatsApp to get your meal booked daily.</p>
                 <div className="space-y-8">
                    <div className="flex gap-6 group">
                      <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black flex-shrink-0 group-hover:bg-orange-200 group-hover:text-orange-700 transition-colors font-mono">1</div>
                      <div className="space-y-1 pt-2">
                        <h4 className="text-xl font-black tracking-tight">Get Daily Prompts</h4>
                        <p className="text-orange-100 text-base opacity-80 leading-relaxed font-medium">We send you a prompt every morning & evening to ask if you need a tiffin.</p>
                      </div>
                    </div>
                    <div className="flex gap-6 group">
                      <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black flex-shrink-0 group-hover:bg-orange-200 group-hover:text-orange-700 transition-colors font-mono">2</div>
                      <div className="space-y-1 pt-2">
                        <h4 className="text-xl font-black tracking-tight">Reply with YES/NO</h4>
                        <p className="text-orange-100 text-base opacity-80 leading-relaxed font-medium">Just reply to the message. No need to open any app or website.</p>
                      </div>
                    </div>
                    <div className="flex gap-6 group">
                      <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black flex-shrink-0 group-hover:bg-orange-200 group-hover:text-orange-700 transition-colors font-mono">3</div>
                      <div className="space-y-1 pt-2">
                        <h4 className="text-xl font-black tracking-tight">Enjoy Home Food</h4>
                        <p className="text-orange-100 text-base opacity-80 leading-relaxed font-medium">Your fresh meal arrives at your door. Simple, healthy, and jhakaas!</p>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl relative animate-in zoom-in duration-700">
                  <div className="flex flex-col gap-4">
                     <div className="bg-white self-start p-4 rounded-2xl rounded-tl-none shadow-md max-w-[80%] border border-slate-100">
                        <p className="text-sm font-bold text-orange-600 mb-1 tracking-widest uppercase text-[10px]">Kiyamaa's Kitchen</p>
                        <p className="text-slate-800 font-medium tracking-tight">Need tiffin for Today Dinner? 🍱<br/><br/>Reply with: YES or NO</p>
                        <p className="text-[10px] text-slate-400 text-right mt-2 font-bold">09:30 AM</p>
                     </div>
                     <div className="bg-emerald-500 self-end p-4 rounded-2xl rounded-tr-none shadow-lg max-w-[50%] animate-in slide-in-from-right duration-1000 delay-500">
                        <p className="text-white font-black text-lg">YES!</p>
                        <p className="text-[10px] text-emerald-100 text-right mt-1 font-bold">10:05 AM</p>
                     </div>
                     <div className="bg-white self-start p-4 rounded-2xl rounded-tl-none shadow-md max-w-[80%] animate-in slide-in-from-left duration-1000 delay-1000">
                        <p className="text-slate-800 font-medium tracking-tight">✅ *Confirmed!* Dinner booked for today. Enjoy your meal! 🍱</p>
                        <p className="text-[10px] text-slate-400 text-right mt-2 font-bold">10:05 AM</p>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
             <div className="flex items-center justify-center gap-3">
                <Utensils className="text-orange-500 size-8" />
                <span className="text-3xl font-black tracking-tight">Kiyamaa's Kitchen</span>
             </div>
             <p className="text-slate-400 text-lg font-medium">Ghar Ki Rasoi Se, Aapki Thali Tak.</p>
          </div>
          <div className="flex justify-center gap-6 text-slate-500 uppercase text-xs font-black tracking-[0.4em]">
             <Link href="#" className="hover:text-orange-500 transition-colors">Instagram</Link>
             <Link href="#" className="hover:text-orange-500 transition-colors">WhatsApp</Link>
             <Link href="#" className="hover:text-orange-500 transition-colors">Contact</Link>
          </div>
          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
             <p>© 2026 Kiyamaa's Kitchen. All rights reserved.</p>
             <div className="flex gap-8">
                <Link href="#" className="hover:text-white transition-colors underline underline-offset-4 decoration-orange-500/30">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors underline underline-offset-4 decoration-orange-500/30">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
