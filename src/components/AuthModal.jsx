import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthPanel } from './AuthPanel';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen } = useApp();
  if (!authModalOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md">
        <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800" aria-label="Close sign in">
          <X className="w-5 h-5" />
        </button>
        <AuthPanel />
      </div>
    </div>
  );
};
