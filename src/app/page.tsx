'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Utensils, Heart, Clock, Smartphone, CheckCircle2, Star, X, ArrowRight, MessageCircle, Globe, Camera } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 100ms; }
        .reveal-delay-2 { transition-delay: 200ms; }
        .reveal-delay-3 { transition-delay: 300ms; }
      `}</style>

      {/* Classy Side Drawer Menu */}
      <div
        className={`fixed inset-0 z-[300] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Drawer Content */}
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#fdfaf6] shadow-[-20px_0_80px_rgba(0,0,0,0.1)] transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] p-8 md:p-16 flex flex-col justify-between ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="size-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
                <Utensils className="text-white size-6" />
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="size-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all active:scale-90"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="flex flex-col space-y-6 pt-10">
              {menuItems.map((item, i) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ transitionDelay: `${i * 50 + 300}ms` }}
                  className={`text-4xl font-black tracking-tight text-slate-900 hover:text-orange-600 transition-all transform ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={`space-y-10 transition-all duration-1000 delay-500 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] text-center block hover:bg-orange-600 transition-all shadow-xl active:scale-95"
            >
              Admin Access
            </Link>

            <div className="flex items-center justify-between border-t border-slate-100 pt-10">
              <div className="flex gap-6">
                <Link href="#" className="text-slate-300 hover:text-orange-500 transition-colors"><Camera className="size-6" /></Link>
                <Link href="#" className="text-slate-300 hover:text-orange-600 transition-colors"><Globe className="size-6" /></Link>
                <Link href="https://wa.me/918340632956" className="text-slate-300 hover:text-emerald-500 transition-colors"><MessageCircle className="size-6" /></Link>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">v1.2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[200] transition-all duration-700 ${scrolled ? 'bg-[#fdfaf6]/90 backdrop-blur-xl border-b border-orange-50 shadow-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100 transition-all group-hover:bg-slate-900 group-hover:-rotate-12">
              <Utensils className="size-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-orange-600 transition-all">
              Kiyamaa's Kitchen
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-12 font-bold">
            {menuItems.slice(0, 3).map(item => (
              <Link key={item.name} href={item.href} className="text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-[0.4em] relative group">
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
            <div className="w-8 h-[2.5px] bg-slate-900 rounded-full transition-all group-hover:w-10 group-hover:bg-orange-600" />
            <div className="w-5 h-[2.5px] bg-slate-900 rounded-full transition-all group-hover:w-10 group-hover:bg-orange-600" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10 space-y-12 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-3 bg-orange-50 text-orange-700 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-sm border border-orange-100/50">
              <Heart className="size-3 fill-orange-700 animate-pulse" />
              Kitchen Excellence
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Ghar Ka <br />
              <span className="text-orange-500 italic pb-2 inline-block">Khana.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium italic">
              "Authentic home-style meals, prepared daily with premium ingredients and a mother's touch."
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Link href="https://wa.me/918340632956" className="bg-emerald-600 text-white hover:bg-emerald-700 px-12 py-6 rounded-[2.5rem] text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-emerald-100 transition-all hover:-translate-y-2 active:scale-95 border-b-4 border-emerald-800">
                <MessageCircle className="size-6" />
                Book on WhatsApp
              </Link>
              <Link href="#menu" className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 px-12 py-6 rounded-[2.5rem] text-lg font-black flex items-center justify-center gap-3 shadow-sm transition-all hover:border-orange-500 group">
                Check Today's Menu
                <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform text-orange-500" />
              </Link>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute -inset-10 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="relative bg-white p-5 rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 transition-transform duration-1000 hover:scale-[1.02]">
              <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden">
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
            <div className="absolute -right-6 top-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 animate-bounce delay-700 z-20">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Star className="size-6 text-orange-500 fill-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">4.9/5</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Rated</p>
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
              <span className="text-orange-600 font-black uppercase text-[10px] tracking-[0.6em]">Premium Thali</span>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Daily Menu.</h2>
            </div>
            <p className="max-w-md text-slate-500 font-medium text-xl italic reveal reveal-delay-2 border-l-4 border-orange-500 pl-8 py-2">
              "Simple ingredients, extraordinary taste. Just like your mother makes."
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative reveal reveal-delay-1 group">
              <div className="absolute inset-0 bg-slate-900/5 rounded-[5rem] transition-all group-hover:rotate-3" />
              <div className="relative bg-white p-5 rounded-[5rem] shadow-2xl border border-slate-50 transition-all group-hover:-rotate-2">
                <div className="relative aspect-square rounded-[4rem] overflow-hidden">
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
              <div className="bg-[#FAF7F2] p-12 md:p-16 rounded-[5rem] border border-orange-50 space-y-12 hover:shadow-2xl transition-all duration-700">
                <div className="space-y-3">
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Standard Tiffin</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-10 bg-orange-500 rounded-full" />
                    <p className="text-orange-600 font-black tracking-[0.3em] uppercase text-[10px]">Balanced Nutrition</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  {[
                    '4 Butter Roti',
                    'Basmati Steam Rice',
                    'Seasonal Sabzi',
                    'Dal Fry / Tadka',
                    'Fresh Green Salad',
                    'Mango Pickle'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-700 font-black uppercase tracking-[0.1em] text-[10px]">
                      <div className="size-1.5 bg-orange-500 rounded-full" /> {item}
                    </div>
                  ))}
                </div>

                <div className="pt-10 flex items-center justify-between border-t border-orange-100/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing starts at</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">₹90 <span className="text-sm text-slate-400 font-medium">/ meal</span></p>
                  </div>
                  <Link href="https://wa.me/918340632956" className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 shadow-2xl">Book Now</Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {['Low GI Diet', 'Zero Preservatives', 'Eco-Packaging'].map((tag, i) => (
                  <span key={i} className="px-8 py-3.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-slate-100 shadow-sm transition-all hover:border-orange-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-[#FAF7F2] reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-24 space-y-6 reveal reveal-delay-1">
            <span className="text-orange-600 font-black uppercase text-[10px] tracking-[0.5em]">Our Promise</span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">Why Kiyamaa's <br /> Kitchen?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Heart, color: 'orange', title: 'Home Recipes', desc: 'Every meal follows traditional family recipes passed down through generations for that perfect taste.' },
              { icon: Utensils, color: 'orange', title: 'Top Quality', desc: 'We handpick fresh vegetables every morning from local organic markets to ensure top-notch health.' },
              { icon: Clock, color: 'orange', title: 'Express Delivery', desc: 'Our dedicated delivery network ensures your meal arrives fresh and hot at your doorstep.' }
            ].map((f, i) => (
              <div key={i} className={`p-12 md:p-16 rounded-[5rem] bg-white border border-slate-50 hover:border-orange-500 transition-all hover:shadow-2xl hover:-translate-y-4 group reveal reveal-delay-${i + 1}`}>
                <div className={`size-20 mb-10 bg-orange-50 rounded-[2rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12`}>
                  <f.icon className="size-10 text-orange-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-slate-900 relative overflow-hidden reveal">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[150px] opacity-10 -mr-[250px] -mt-[250px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600 rounded-full blur-[150px] opacity-10 -ml-[250px] -mb-[250px]" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-white">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter reveal reveal-delay-1">WhatsApp <br /> <span className="text-orange-500 italic">Booking.</span></h2>
              <p className="text-xl text-slate-400 leading-relaxed font-medium reveal reveal-delay-2">Zero complexity. No apps. Just reply to our daily prompt and your meal is booked.</p>
              <div className="space-y-10">
                {[
                  { step: '01', title: 'Daily Prompts', desc: 'Receive a prompt every morning & evening to confirm your meal.' },
                  { step: '02', title: 'Quick Reply', desc: 'Simply reply with YES or NO. No login or forms required.' },
                  { step: '03', title: 'Fresh Delivery', desc: 'Your hot meal arrives at your door. Simple as that.' }
                ].map((s, idx) => (
                  <div key={idx} className={`flex gap-8 group reveal reveal-delay-${idx + 1}`}>
                    <div className="text-3xl font-black text-white/10 group-hover:text-orange-500 transition-colors duration-500 pt-2">{s.step}</div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black tracking-tight">{s.title}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 md:p-16 rounded-[5rem] shadow-2xl relative reveal reveal-delay-3 hover:scale-[1.02] transition-transform duration-1000">
              <div className="flex flex-col gap-10">
                <div className="bg-white self-start p-8 rounded-[2.5rem] rounded-tl-none shadow-xl max-w-[90%] border border-white/10">
                  <p className="text-[10px] font-black text-orange-600 mb-2 tracking-[0.4em] uppercase">Kiyamaa's Kitchen</p>
                  <p className="text-slate-800 font-bold text-xl leading-snug">Need tiffin for Dinner? 🍱<br /><br />Reply with: YES or NO</p>
                  <p className="text-[10px] text-slate-400 text-right mt-4 font-black uppercase tracking-widest">09:30 AM</p>
                </div>
                <div className="bg-emerald-600 self-end p-8 rounded-[2.5rem] rounded-tr-none shadow-2xl max-w-[60%] animate-pulse group">
                  <p className="text-white font-black text-3xl tracking-tighter transition-transform group-hover:scale-110">YES! 🚀</p>
                  <p className="text-[10px] text-emerald-100 text-right mt-3 font-black uppercase tracking-[0.2em]">Confirmed</p>
                </div>
                <div className="bg-white self-start p-8 rounded-[2.5rem] rounded-tl-none shadow-xl max-w-[90%]">
                  <p className="text-slate-800 font-bold text-xl leading-snug flex items-center gap-3">
                    <span className="text-2xl">✅</span> Confirmed! Dinner booked. Enjoy your meal! 🍱
                  </p>
                  <p className="text-[10px] text-slate-400 text-right mt-4 font-black uppercase tracking-widest">10:05 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-40 bg-slate-900 text-white reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-32 items-start mb-40">
            <div className="space-y-12">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="size-14 bg-orange-600 rounded-3xl flex items-center justify-center transition-transform group-hover:-rotate-12 shadow-2xl shadow-orange-600/20">
                  <Utensils className="text-white size-8" />
                </div>
                <span className="text-4xl font-black tracking-tighter">Kiyamaa's Kitchen</span>
              </Link>
              <p className="text-3xl text-slate-400 font-medium leading-relaxed max-w-md italic">
                "Ma Ke Haath Wala Swaad, <br /> Delivered with Love."
              </p>
              <div className="flex gap-8">
                <Link href="#" className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-600 transition-all hover:-translate-y-2 active:scale-90"><Camera className="size-8" /></Link>
                <Link href="#" className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all hover:-translate-y-2 active:scale-90"><Globe className="size-8" /></Link>
                <Link href="https://wa.me/918340632956" className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 transition-all hover:-translate-y-2 active:scale-90"><MessageCircle className="size-8" /></Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-24">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Navigation</h4>
                <div className="flex flex-col gap-5 text-slate-400 font-bold text-xl">
                  <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                  <Link href="#menu" className="hover:text-white transition-colors">Our Menu</Link>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                </div>
              </div>
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Links</h4>
                <div className="flex flex-col gap-5 text-slate-400 font-bold text-xl">
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/login" className="hover:text-white transition-colors">Staff Login</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            <p>© 2026 Kiyamaa's Kitchen. All rights reserved.</p>
            <div className="flex items-center gap-3">
              Handcrafted with <Heart className="size-4 text-rose-500 fill-rose-500" /> in India.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
