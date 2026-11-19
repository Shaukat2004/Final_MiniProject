import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';

export const LoaderModal = () => {
  const { loading, currentFact, t } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-all duration-300">
      <div className="relative max-w-md w-full mx-4 p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col items-center text-center">
        
        {/* Animated Circular Loader */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-slate-100"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="text-emerald-600 transition-all duration-300 ease-out"
              strokeWidth="6"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center icon / percentage */}
          <div className="absolute flex flex-col items-center justify-center">
            <Activity className="w-7 h-7 text-emerald-600 animate-pulse mb-0.5" />
            <span className="text-xs font-bold text-slate-800">{progress}%</span>
          </div>
        </div>

        {/* Fact Box */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.didYouKnow || "Cancer Awareness Fact"}</span>
          </div>

          <p className="text-slate-800 text-xs sm:text-sm leading-relaxed italic font-medium min-h-[50px] flex items-center justify-center">
            "{currentFact?.text}"
          </p>

          {currentFact?.source && (
            <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Source: {currentFact.source}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Synchronizing OncoLink healthcare records...</span>
        </div>
      </div>
    </div>
  );
};
