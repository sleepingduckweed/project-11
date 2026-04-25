'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-10">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
        {footer && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
