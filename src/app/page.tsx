'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Utensils, Heart, Clock, Smartphone, CheckCircle2, Star, X, ArrowRight, MessageCircle, Globe, Camera } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Our Menu', href: '#menu' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  return (
    <div className={`min-h-screen bg-[#fdfaf6] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden ${isMenuOpen ? 'h-screen overflow-hidden' : ''}`}>
      
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 100ms; }
        .reveal-delay-2 { transition-delay: 200ms; }
        .reveal-delay-3 { transition-delay: 300ms; }
        
        .menu-item-reveal {
          transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1), opacity 1s ease;
        }
      `}</style>

      {/* Classy Elegant Menu Overlay */}
      <div className={`fixed inset-0 z-[200] transition-all duration-1000 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
         {/* Background Split - Elegant Slide */}
         <div className={`absolute inset-0 bg-white/95 backdrop-blur-2xl transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`} />
         
         <div className="relative h-full flex flex-col items-start justify-center p-8 md:p-24 max-w-7xl mx-auto w-full z-10">
            <div className="flex flex-col space-y-4 md:space-y-6 w-full">
               {menuItems.map((item, i) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ transitionDelay: `${i * 80 + 400}ms` }}
                    className={`group text-5xl md:text-8xl font-black text-slate-900 hover:text-orange-500 transition-all transform tracking-tighter w-fit overflow-hidden ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  >
                    <span className="inline-block transition-transform duration-700 group-hover:-translate-y-2">{item.name}</span>
                    <div className="h-2 w-0 bg-orange-500 transition-all duration-500 group-hover:w-full" />
                  </Link>
               ))}
            </div>

            <div 
               style={{ transitionDelay: '900ms' }}
               className={`mt-20 flex flex-col md:flex-row items-start md:items-center gap-10 transition-all duration-1000 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
               <Link 
                 href="/login"
                 onClick={() => setIsMenuOpen(false)}
                 className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 transition-all shadow-2xl active:scale-95"
               >
                 Admin Access
               </Link>
               
               <div className="flex gap-6">
                  <Link href="#" className="text-slate-400 hover:text-orange-500 transition-colors"><Camera className="size-6" /></Link>
                  <Link href="#" className="text-slate-400 hover:text-orange-500 transition-colors"><Globe className="size-6" /></Link>
                  <Link href="#" className="text-slate-400 hover:text-emerald-500 transition-colors"><MessageCircle className="size-6" /></Link>
               </div>
            </div>
         </div>

         {/* Fixed Close Button for Menu */}
         <button 
           onClick={() => setIsMenuOpen(false)}
           className={`absolute top-8 right-8 size-14 flex items-center justify-center bg-slate-900 text-white rounded-full transition-all duration-700 hover:rotate-90 active:scale-90 ${isMenuOpen ? 'translate-y-0 scale-100' : 'translate-y-[-100px] scale-0'}`}
         >
           <X className="size-6" />
         </button>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[150] transition-all duration-700 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-orange-50 shadow-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100 transition-all group-hover:bg-slate-900 group-hover:-rotate-12">
              <Utensils className="size-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-400 transition-all">
              Kiyamaa's Kitchen
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-12 font-bold">
            {menuItems.slice(0,3).map(item => (
              <Link key={item.name} href={item.href} className="text-slate-400 hover:text-orange-600 transition-all uppercase text-[10px] font-black tracking-[0.4em] relative group">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
              </Link>
            ))}
            <Link href="/login" className="px-8 py-3 bg-slate-900 text-white hover:bg-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl shadow-slate-100 border border-slate-900">
              Admin Login
            </Link>
          </div>

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-end gap-1.5 group p-2 hover:translate-x-1 transition-transform"
          >
            <div className="w-8 h-[2px] bg-slate-900 rounded-full transition-all group-hover:w-10" />
            <div className="w-5 h-[2px] bg-slate-900 rounded-full transition-all group-hover:w-10" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-3 bg-orange-50 text-orange-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm border border-orange-100/50">
              <Heart className="size-3 fill-orange-700 animate-pulse" />
              Kitchen Excellence
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Ghar Ka <br/>
              <span className="text-orange-500 italic pb-2 inline-block">Khana.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium">
              Authentic home-style meals, prepared daily with premium ingredients and a mother's touch.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Link href="https://wa.me/918340632956" className="bg-emerald-600 text-white hover:bg-emerald-700 px-12 py-6 rounded-[2rem] text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-emerald-100 transition-all hover:-translate-y-2 active:scale-95 border-b-4 border-emerald-800">
                <MessageCircle className="size-6" />
                Book via WhatsApp
              </Link>
              <Link href="#menu" className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 px-12 py-6 rounded-[2rem] text-lg font-black flex items-center justify-center gap-3 shadow-sm transition-all hover:border-orange-500 group">
                Today's Menu
                <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute -inset-10 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="relative bg-white p-5 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 transition-transform duration-1000 hover:scale-[1.02]">
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden">
                <Image 
                  src="/images/hero.png" 
                  alt="Delicious Indian Tiffin" 
                  layout="fill" 
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-[2000ms]"
                />
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -right-10 top-20 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 animate-bounce delay-700 z-20">
               <div className="flex items-center gap-3">
                  <div className="size-10 bg-orange-100 rounded-xl flex items-center justify-center">
                     <Star className="size-5 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900">4.9/5</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Rating</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-32 bg-white reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
           <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="space-y-6 reveal reveal-delay-1">
                 <span className="text-orange-600 font-black uppercase text-[10px] tracking-[0.5em]">Daily Specials</span>
                 <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Kitchen Menu.</h2>
              </div>
              <p className="max-w-md text-slate-500 font-medium text-xl italic reveal reveal-delay-2 border-l-4 border-orange-500 pl-8 py-2">
                "Experience the warmth of home-style meals, delivered fresh to your doorstep."
              </p>
           </div>

           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative reveal reveal-delay-1 group">
                 <div className="absolute inset-0 bg-slate-900/5 rounded-[4rem] transition-all group-hover:rotate-3" />
                 <div className="relative bg-white p-4 rounded-[4rem] shadow-2xl border border-slate-50 transition-all group-hover:-rotate-2">
                    <div className="relative aspect-square rounded-[3.5rem] overflow-hidden">
                       <Image 
                         src="/images/thali.png"
                         alt="Punjabi Thali"
                         layout="fill"
                         objectFit="cover"
                         className="transition-transform duration-[3000ms] group-hover:scale-110"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-12 reveal reveal-delay-2">
                 <div className="bg-[#FAF7F2] p-10 md:p-16 rounded-[4rem] border border-orange-50 space-y-10 hover:shadow-2xl transition-all duration-700">
                    <div className="space-y-2">
                       <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Standard Tiffin</h3>
                       <p className="text-orange-600 font-bold tracking-[0.2em] uppercase text-[10px]">Lunch & Dinner Special</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-8">
                       {[
                         '4 Butter Roti',
                         'Premium Basmati Rice',
                         'Seasonal Veg Sabzi',
                         'Dal Fry Tadka',
                         'Fresh Green Salad',
                         'Mango Pickle'
                       ].map((item, idx) => (
                         <div key={idx} className="flex items-center gap-4 text-slate-700 font-black uppercase tracking-widest text-[9px]">
                            <div className="size-2 bg-emerald-500 rounded-full" /> {item}
                         </div>
                       ))}
                    </div>

                    <div className="pt-10 flex items-center justify-between border-t border-orange-100/50">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing starts at</p>
                          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹90 <span className="text-sm text-slate-400">/ meal</span></p>
                       </div>
                       <Link href="https://wa.me/918340632956" className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 shadow-2xl">Book Now</Link>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4">
                    <span className="px-6 py-3 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Low Cholesterol</span>
                    <span className="px-6 py-3 bg-rose-50 text-rose-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">Eco-Friendly Packaging</span>
                    <span className="px-6 py-3 bg-amber-50 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">Daily Fresh Prep</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-[#FAF7F2] reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-24 space-y-6 reveal reveal-delay-1">
            <span className="text-orange-600 font-black uppercase text-[10px] tracking-[0.5em]">The Difference</span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Why Choose <br/> Our Kitchen?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Heart, color: 'rose', title: 'Home Recipes', desc: 'Every meal follows traditional family recipes passed down through generations.' },
              { icon: Utensils, color: 'amber', title: 'Local Sourcing', desc: 'We handpick fresh vegetables every morning from local organic markets.' },
              { icon: Clock, color: 'emerald', title: 'Always On Time', desc: 'Our reliable delivery network ensures your meal arrives fresh and hot.' }
            ].map((f, i) => (
              <div key={i} className={`p-12 rounded-[4rem] bg-white border border-slate-50 hover:border-orange-500 transition-all hover:shadow-2xl hover:-translate-y-3 group reveal reveal-delay-${i+1}`}>
                <div className={`size-20 mb-10 bg-${f.color}-50 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12`}>
                  <f.icon className={`size-10 text-${f.color}-600`} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-32 bg-slate-900 text-white reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
           <div className="grid lg:grid-cols-2 gap-20 items-start mb-32">
              <div className="space-y-10">
                 <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-12 bg-orange-600 rounded-2xl flex items-center justify-center transition-transform group-hover:-rotate-12">
                       <Utensils className="text-white size-7" />
                    </div>
                    <span className="text-4xl font-black tracking-tighter">Kiyamaa's Kitchen</span>
                 </Link>
                 <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-md">
                   "Ma Ke Haath Wala Swaad, Dil Se Delivered Daily."
                 </p>
                 <div className="flex gap-6">
                    <Link href="#" className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-600 transition-all hover:-translate-y-2"><Camera className="size-6" /></Link>
                    <Link href="#" className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all hover:-translate-y-2"><Globe className="size-6" /></Link>
                    <Link href="https://wa.me/918340632956" className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 transition-all hover:-translate-y-2"><MessageCircle className="size-6" /></Link>
                 </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-20">
                 <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Navigation</h4>
                    <div className="flex flex-col gap-4 text-slate-400 font-bold text-lg">
                       <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                       <Link href="#menu" className="hover:text-white transition-colors">Our Menu</Link>
                       <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Company</h4>
                    <div className="flex flex-col gap-4 text-slate-400 font-bold text-lg">
                       <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                       <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                       <Link href="/login" className="hover:text-white transition-colors">Staff Portal</Link>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
              <p>© 2026 Kiyamaa's Kitchen. All rights reserved.</p>
              <div className="flex items-center gap-2">
                 Cooked with <Heart className="size-4 text-rose-500 fill-rose-500" /> for you.
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
