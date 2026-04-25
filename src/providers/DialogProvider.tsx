'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { AlertCircle, CheckCircle2, HelpCircle, Info } from 'lucide-react';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'success' | 'error';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  alert: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
  confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const alert = useCallback((title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setOptions({
      title,
      message,
      type: type === 'info' ? 'alert' : type,
      onConfirm: () => setIsOpen(false),
    });
    setIsOpen(true);
  }, []);

  const confirm = useCallback((title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setOptions({
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        setIsOpen(false);
      },
      onCancel: () => {
        onCancel?.();
        setIsOpen(false);
      },
    });
    setIsOpen(true);
  }, []);

  const Icon = () => {
    if (!options) return null;
    switch (options.type) {
      case 'success': return <CheckCircle2 className="size-12 text-emerald-500" />;
      case 'error': return <AlertCircle className="size-12 text-red-500" />;
      case 'confirm': return <HelpCircle className="size-12 text-orange-500" />;
      default: return <Info className="size-12 text-blue-500" />;
    }
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Modal 
        isOpen={isOpen} 
        onClose={() => {
            options?.onCancel?.();
            setIsOpen(false);
        }} 
        title={options?.title || ''}
        footer={
          <div className="flex gap-3 w-full">
            {options?.type === 'confirm' && (
              <button 
                onClick={() => { options.onCancel?.(); setIsOpen(false); }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={options?.onConfirm}
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all font-sans ${
                options?.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                options?.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {options?.type === 'confirm' ? 'Confirm' : 'Okay'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center gap-6">
            <div className="size-20 rounded-3xl bg-slate-50 flex items-center justify-center shadow-inner border border-slate-100">
                <Icon />
            </div>
            <div className="space-y-2">
                <p className="text-slate-500 font-medium italic leading-relaxed">{options?.message}</p>
            </div>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within a DialogProvider');
  return context;
}
