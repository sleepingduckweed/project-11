'use client';

import Link from 'next/link';
import { Utensils, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-900 font-sans selection:bg-orange-100 p-6 md:p-20">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-600 font-black uppercase text-xs tracking-widest hover:translate-x-1 transition-transform">
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-4">
          <div className="size-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Utensils className="text-white size-7" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-lg text-slate-600 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">1. Service Scope</h2>
            <p>Kiyamaa's Kitchen provides home-cooked tiffin delivery services. Users book meals via WhatsApp in response to our daily prompts.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">2. Cancellation Policy</h2>
            <p>Users must reply "NO" to the morning/evening prompt to cancel their meal for that slot. Once a "YES" is confirmed, the tiffin balance will be deducted.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">3. Wallet & Balance</h2>
            <p>Our system operates on a pre-paid tiffin count basis. Users must recharge their balance (UPI: kiyamax@upi) to continue receiving daily prompts and meals.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">4. Health & Hygiene</h2>
            <p>We maintain strict hygiene standards. However, users are responsible for informing us of any specific food allergies during registration.</p>
          </section>
        </div>

        <footer className="pt-20 border-t border-orange-100 text-sm text-slate-400 font-bold uppercase tracking-widest text-center">
          © 2026 Kiyamaa's Kitchen • Ma Ke Haath Wala Swaad
        </footer>
      </div>
    </div>
  );
}
