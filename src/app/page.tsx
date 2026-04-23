'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Utensils, Heart, Clock, X, MessageCircle, Globe, Camera, MapPin, Phone, AlertCircle, Calendar, Star } from 'lucide-react';

const festivals = [
  { name: 'Vrat Special', desc: 'Sabudana Vada, Sabudana Khichdi, and special Vrat Thali available.', image: '/vrat_thali_1776967337742.png' },
  { name: 'Holi Dhamaka', desc: 'Vibrant colors and traditional Gujiyas for the spring festival.', image: '/holi_special_1776967361820.png' },
  { name: 'Diwali Feast', desc: 'Indulgent festive thalis with homemade sweets and rich curries.', image: '/diwali_thali_1776967382501.png' },
];

const displayFestivals = [...festivals, festivals[0]];

const monthlyPlans = [
  { name: 'Breakfast + Dinner', price: '₹4500' },
  { name: 'Lunch + Dinner', price: '₹5400' },
  { name: 'Only Lunch / Dinner', price: '₹2700' },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [festIndex, setFestIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const whatsappLink = "https://wa.me/918755884929";

  useEffect(() => {
    const timer = setInterval(() => {
      setFestIndex((prev) => {
        if (prev >= festivals.length) return prev;
        return prev + 1;
      });
      setIsTransitioning(true);
    }, 3000);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.05 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (festIndex === festivals.length) {
      const jumpTimer = setTimeout(() => {
        setIsTransitioning(false);
        setFestIndex(0);
      }, 1000);
      return () => clearTimeout(jumpTimer);
    }
  }, [festIndex]);

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '#menu' },
    { name: 'Plans', href: '#plans' },
    { name: 'Policy', href: '#policy' },
    { name: 'Admin', href: '/login' },
  ];

  return (
    <div className={`min-h-screen bg-[#fdfaf6] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden ${isMenuOpen ? 'h-screen overflow-hidden' : ''}`}>

      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(15px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .fest-progress {
          transition: width 2s linear;
        }
      `}</style>

      {/* Side Drawer */}
      <div className={`fixed inset-0 z-[500] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        <div onClick={() => setIsMenuOpen(false)} className={`absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-[#fdfaf6] p-8 flex flex-col justify-between transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="size-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg"><Utensils className="text-white size-6" /></div>
              <button onClick={() => setIsMenuOpen(false)} className="size-12 rounded-full border border-slate-200 flex items-center justify-center"><X className="size-6" /></button>
            </div>
            <div className="flex flex-col space-y-8 pt-6">
              {menuItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-slate-900 hover:text-orange-600 transition-colors uppercase tracking-tighter">{item.name}</Link>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <Link href="/login" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[.4em] text-center block">Admin Access</Link>
            <div className="flex items-center justify-between border-t border-slate-100 pt-8">
              <div className="flex gap-6">
                <Link href="#" className="text-slate-300 hover:text-orange-500"><Camera className="size-6" /></Link>
                <Link href={`${whatsappLink}?text=Hi!%20I'm%20inquiring%20from%20the%20website.`} className="text-slate-300 hover:text-emerald-500"><MessageCircle className="size-6" /></Link>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-200 tracking-widest">v2.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative w-full py-6 md:py-10 z-[100]">
        <div className="max-w-7xl mx-auto px-5 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="size-10 md:size-12 bg-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100">
              <Utensils className="size-6 md:size-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-3xl font-black tracking-tighter text-slate-900 leading-none">Kiymaa’s Home Kitchen</span>
              <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[0.2em] text-orange-600 mt-0.5 flex items-center gap-1"><MapPin className="size-2" /> Sector 104, Noida</span>
            </div>
          </Link>
          <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-end gap-1.5 p-4 -mr-4 rounded-2xl active:bg-slate-100 group relative z-[9999] pointer-events-auto touch-manipulation">
            <div className="w-8 h-[2.5px] bg-slate-900 rounded-full group-hover:bg-orange-600 transition-all pointer-events-none" />
            <div className="w-5 h-[2.5px] bg-slate-900 rounded-full group-hover:w-8 group-hover:bg-orange-600 transition-all pointer-events-none" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-6 pb-12 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative z-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-100/50">
              <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Veg Only Tiffin Service
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Khana <br />
              <span className="text-orange-500 italic pb-1 md:pb-2 inline-block">Ghar Jaisa.</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium italic">
              "Homemade meals, prepared with love and delivered fresh to Noida Sector 104."
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href={`${whatsappLink}?text=Hi!%20I'd%20like%20to%20book%20a%20tiffin%20for%20today.`} className="inline-flex bg-emerald-600 text-white px-8 py-5 rounded-2xl md:rounded-3xl text-base md:text-lg font-black items-center justify-center gap-3 shadow-2xl shadow-emerald-100 transition-all hover:-translate-y-1 border-b-4 border-emerald-800">
                <MessageCircle className="size-6 md:size-7" />
                Book Today's Meal
              </Link>
              <Link href="tel:+918076067686" className="inline-flex bg-white text-slate-900 px-8 py-5 rounded-2xl md:rounded-3xl text-base md:text-lg font-black items-center justify-center gap-3 shadow-xl border border-slate-100 transition-all">
                <Phone className="size-6 md:size-7 text-orange-500" />
                8076067686
              </Link>
            </div>
          </div>
          <div className="relative px-2 md:px-0">
            <div className="absolute -inset-10 bg-orange-500/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse" />
            <div className="relative bg-white p-3 md:p-6 rounded-[3rem] md:rounded-[5rem] shadow-2xl border border-slate-50">
              <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden">
                <Image src="/images/hero.png" alt="Hero" layout="fill" objectFit="cover" className="hover:scale-105 transition-transform duration-[2000ms]" priority unoptimized />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu / Plans Section */}
      <section id="menu" className="py-16 md:py-32 bg-white reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <span className="text-orange-600 font-black uppercase text-[9px] md:text-[10px] tracking-[0.5em]">Tiffin Selection</span>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter">Daily Menu.</h2>
            </div>
            <div className="bg-[#FAF7F2] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-orange-50 max-w-sm">
              <p className="text-slate-500 font-medium italic text-xs md:text-sm">
                "Vrat Food Available: Sabudana Vada, Sabudana Khichdi, Vrat Thali & more."
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
            {/* Daily Meal */}
            <div className="bg-[#FAF7F2] p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-orange-50 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between">
              <div className="space-y-6 md:space-y-8">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Random Meal</h3>
                    <p className="text-orange-600 font-black tracking-[0.3em] uppercase text-[9px] mt-2">Single Order</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">₹130</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">per meal</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 border-y border-orange-100/50 py-6 md:py-8">
                  {['4 Butter Roti', 'Basmati Rice', 'Seasonal Sabzi', 'Dal Fry', 'Salad', 'Mango Pickle'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 md:gap-3 text-slate-800 font-bold uppercase tracking-widest text-[8px] md:text-[9px]">
                      <div className="size-1.5 md:size-2 bg-orange-500 rounded-full" /> {item}
                    </div>
                  ))}
                </div>

                <div className="bg-white/60 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white space-y-2 md:space-y-3 shadow-inner">
                  <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                    <Star className="size-3 fill-orange-500 text-orange-500" /> Sunday Special
                  </h4>
                  <p className="text-xs md:text-sm font-medium text-slate-600">1 Full Meal including a Sweet surprise! 🍬</p>
                </div>
              </div>
              <Link href={`${whatsappLink}?text=Hi!%20I'd%20like%20to%20order%20a%20Random%20Meal%20(₹130).`} className="mt-8 md:mt-10 w-full bg-slate-900 text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest text-center block shadow-2xl hover:bg-orange-600 transition-all">Order Now</Link>
            </div>

            {/* Monthly Plans */}
            <div id="plans" className="bg-slate-900 p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white space-y-8 md:space-y-12 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 size-64 bg-orange-600/10 rounded-full blur-[80px]" />
              <div className="space-y-4 md:space-y-6 relative z-10">
                <span className="text-orange-500 font-black uppercase text-[9px] md:text-[10px] tracking-[0.5em]">Subscription</span>
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">Monthly Plans.</h3>
                <p className="text-slate-400 font-medium italic text-sm md:text-base">Save more with our monthly subscriptions.</p>
              </div>

              <div className="space-y-4 md:space-y-6 relative z-10">
                {monthlyPlans.map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between p-6 md:p-8 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                    <div className="space-y-0.5">
                      <h4 className="text-base md:text-xl font-black tracking-tight group-hover:text-orange-500 transition-colors">{plan.name}</h4>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Plan</p>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-orange-500">{plan.price}</span>
                  </div>
                ))}
              </div>

              <Link href={`${whatsappLink}?text=Hi!%20I'm%20interested%20in%20the%20Monthly%20Plans.%20Please%20share%20details.`} className="w-full bg-white text-slate-900 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest text-center block shadow-xl hover:bg-orange-500 hover:text-white transition-all relative z-10">Join Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Festival Carousel */}
      <section id="festivals" className="py-16 md:py-32 bg-[#FAF7F2] reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <span className="text-orange-600 font-black uppercase text-[9px] md:text-[10px] tracking-[0.5em]">Celebrate</span>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter">Festival Specials.</h2>
            </div>
            <div className="flex gap-2">
              {festivals.map((_, i) => (
                <button key={i} onClick={() => { setFestIndex(i); setIsTransitioning(true); }} className={`h-1.5 rounded-full transition-all ${festIndex % festivals.length === i ? 'w-10 bg-orange-600' : 'w-3 bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl bg-white border border-slate-50 min-h-[450px] md:min-h-[600px]">
            <div className={`flex h-full ${isTransitioning ? 'transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''}`} style={{ transform: `translate3d(-${festIndex * 100}%, 0, 0)` }}>
              {displayFestivals.map((fest, idx) => (
                <div key={idx} className="w-full flex-shrink-0 grid lg:grid-cols-2 items-center gap-6 md:gap-12 p-6 md:p-24 h-full">
                  <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 order-2 lg:order-1">
                    <div className="inline-flex px-4 py-1.5 md:px-6 md:py-2 bg-orange-600 text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">
                      {fest.name}
                    </div>
                    <h3 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">{fest.name}</h3>
                    <p className="text-base md:text-2xl text-slate-500 font-medium leading-relaxed italic opacity-80">"{fest.desc}"</p>
                    <Link href={`${whatsappLink}?text=Hi!%20I'm%20inquiring%20about%20the%20${encodeURIComponent(fest.name)}%20Special.`} className="inline-flex px-8 py-4 md:px-12 md:py-6 bg-slate-900 text-white rounded-xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl hover:bg-orange-600 transition-all">Join Group</Link>
                  </div>
                  <div className="relative aspect-square rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-xl md:shadow-2xl ring-4 md:ring-8 ring-[#fdfaf6] order-1 lg:order-2 w-full max-w-[280px] md:max-w-none mx-auto">
                    <Image src={fest.image} alt={fest.name} layout="fill" objectFit="cover" className="hover:scale-110 transition-transform duration-[3000ms]" priority unoptimized />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
              <div key={festIndex} className="h-full bg-orange-500 fest-progress" style={{ width: '100%', transition: isTransitioning && festIndex < festivals.length ? 'width 2s linear' : 'none' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Policy Section */}
      <section id="policy" className="py-16 md:py-32 bg-white reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-10 md:space-y-12">
              <div className="space-y-4 md:space-y-6">
                <span className="text-orange-600 font-black uppercase text-[9px] md:text-[10px] tracking-[0.5em]">Essential</span>
                <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter">Kitchen Policies.</h2>
              </div>
              <div className="grid gap-6 md:gap-8">
                {[
                  { icon: Calendar, title: 'Meal Skips', desc: 'Max 5 skips allowed/month (No Breakfast skips).' },
                  { icon: Clock, title: 'Cancellation', desc: 'Before 10 AM (Lunch) & 5 PM (Dinner).' },
                  { icon: AlertCircle, title: 'Hours', desc: 'Daily Operations: 8:30 AM – 9:00 PM.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 items-start">
                    <div className="size-12 md:size-14 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><item.icon className="size-5 md:size-6 text-orange-600" /></div>
                    <div className="space-y-1">
                      <h4 className="text-lg md:text-xl font-black tracking-tight">{item.title}</h4>
                      <p className="text-slate-500 font-medium italic text-sm md:text-base leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 text-white space-y-8 md:space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-orange-500/20 rounded-full blur-[50px]" />
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight relative z-10">Direct Contact</h3>
              <div className="space-y-4 md:space-y-6 relative z-10">
                <Link href="tel:+918076067686" className="flex items-center gap-4 md:gap-6 p-5 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="size-10 md:size-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center"><Phone className="size-5 md:size-6 text-orange-500" /></div>
                  <div>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Call Now</p>
                    <p className="text-lg md:text-xl font-black tracking-tight">8076067686</p>
                  </div>
                </Link>
                <Link href={`${whatsappLink}?text=Hi!%20I%20have%20a%20question.`} className="flex items-center gap-4 md:gap-6 p-5 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="size-10 md:size-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center"><MessageCircle className="size-5 md:size-6 text-emerald-500" /></div>
                  <div>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">WhatsApp</p>
                    <p className="text-lg md:text-xl font-black tracking-tight">8755884929</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 md:py-32 bg-slate-900 text-white reveal border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-24 items-start mb-32">
            <div className="space-y-12">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="size-14 bg-orange-600 rounded-3xl flex items-center justify-center transition-transform group-hover:-rotate-12 shadow-2xl">
                  <Utensils className="text-white size-8" />
                </div>
                <span className="text-4xl font-black tracking-tighter">Kiymaa’s Kitchen</span>
              </Link>
              <p className="text-3xl text-slate-300 font-medium leading-relaxed max-w-sm italic">"Khana ghar jaisa, Made with love & delivered fresh."</p>
              <div className="flex gap-8">
                <Link href="#" className="size-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-600 transition-all"><Camera className="size-8" /></Link>
                <Link href="#" className="size-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all"><Globe className="size-8" /></Link>
                <Link href={`${whatsappLink}?text=Hi!`} className="size-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 transition-all"><MessageCircle className="size-8" /></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Explore</h4>
                <div className="flex flex-col gap-5 text-slate-400 font-bold text-xl">
                  <Link href="#menu">Random Meal</Link>
                  <Link href="#plans">Monthly Plans</Link>
                  <Link href="#festivals">Festivals</Link>
                </div>
              </div>
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Legal</h4>
                <div className="flex flex-col gap-5 text-slate-400 font-bold text-xl">
                  <Link href="/privacy">Privacy</Link>
                  <Link href="/terms">Terms</Link>
                  <Link href="/login" className="opacity-20 hover:opacity-100 transition-opacity">Staff Access</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            <p>© 2026 Kiymaa’s Home Kitchen. All rights reserved.</p>
            <div className="flex items-center gap-2">Noida Sector 104 • Veg Only <Heart className="size-4 text-rose-500 fill-rose-500" /></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
