'use client';

import Link from 'next/link';
import { Utensils, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-lg text-slate-600 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">1. Information We Collect</h2>
            <p>At Kiyamaa's Kitchen, we primarily collect information through WhatsApp to provide you with delicious home-cooked meals. This includes your name, delivery address, and phone number.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">2. How We Use Information</h2>
            <p>We use your data solely to manage your tiffin bookings, process transaction credits, and ensure timely delivery. We do not sell your personal data to third parties.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">3. WhatsApp Data</h2>
            <p>Our system integrates with the WhatsApp Business API. Your interactions (YES/NO replies) are processed by our automated system to manage your meal preferences.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">4. Security</h2>
            <p>We implement industry-standard security measures to protect your information stored in our MongoDB database.</p>
          </section>
        </div>

        <footer className="pt-20 border-t border-orange-100 text-sm text-slate-400 font-bold uppercase tracking-widest text-center">
          © 2026 Kiyamaa's Kitchen • Ma Ke Haath Wala Swaad
        </footer>
      </div>
    </div>
  );
}
