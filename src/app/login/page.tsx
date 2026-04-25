'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Loader2, Utensils, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error('Login error:', result.error);
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#fdfaf6] selection:bg-orange-100 selection:text-orange-900 p-6">
      
      <div className="w-full max-w-md mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600 transition-colors">
          <ArrowLeft className="size-4" /> Back to Website
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full space-y-8 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-orange-50 animate-in fade-in zoom-in duration-700">
        <div className="text-center flex flex-col items-center">
          <div className="size-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 mb-6">
            <Utensils className="size-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Kiymaa's Kitchen</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-widest">Admin Access</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-100 text-rose-700 p-4 rounded-2xl text-sm text-center font-bold border border-rose-200">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  placeholder="admin@tiffin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-5 bg-slate-900 text-white hover:bg-orange-600 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 mt-8 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
