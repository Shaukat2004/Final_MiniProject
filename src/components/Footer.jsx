import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Phone,
  ShieldCheck,
  Globe,
  ExternalLink
} from 'lucide-react';

export const Footer = () => {
  const { lang, setLang, setActiveTab, user, setAuthModalOpen } = useApp();
  const navigateProtected = (tab) => {
    if (!user?.isLoggedIn) return setAuthModalOpen(true);
    setActiveTab(tab);
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-500 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900">
                Onco<span className="text-emerald-600">Link</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              India's integrated oral cancer early diagnosis ecosystem: PyTorch Grad-CAM screening, direct oncologist referral sharing, and cashless subsidies.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical Portals</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><button onClick={() => navigateProtected('patient_portal')} className="hover:text-emerald-700 transition-colors">Patient Health Dashboard</button></li>
              <li><button onClick={() => navigateProtected('doctor_portal')} className="hover:text-emerald-700 transition-colors">Oncologist Triage Portal</button></li>
              <li><button onClick={() => navigateProtected('hospitals')} className="hover:text-emerald-700 transition-colors">Cancer Hospitals & Map</button></li>
              <li><button onClick={() => navigateProtected('schemes')} className="hover:text-emerald-700 transition-colors">PM-JAY & MJPJAY Grants</button></li>
              <li><button onClick={() => navigateProtected('daycare')} className="hover:text-emerald-700 transition-colors">Oncology Caretakers</button></li>
            </ul>
          </div>

          {/* Helplines */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">National Helplines</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-700 font-bold block">National Cancer Helpline:</span>
                <a href="tel:1800221952" className="text-emerald-700 font-mono font-bold hover:underline">1800-22-1952 (Toll Free)</a>
              </div>
              <div>
                <span className="text-slate-700 font-bold block">National Tobacco Quitline:</span>
                <a href="tel:1800112356" className="text-rose-700 font-mono font-bold hover:underline">1800-11-2356</a>
              </div>
              <div>
                <span className="text-slate-700 font-bold block">Ayushman Bharat PM-JAY:</span>
                <span className="text-amber-800 font-mono font-bold">14555 / 1800-111-565</span>
              </div>
            </div>
          </div>

          {/* Languages & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Language Access</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${lang === 'en' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${lang === 'hi' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('mr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${lang === 'mr' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
              >
                मराठी
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
              Clinical Disclaimer: OncoLink is an AI decision-support system. It assists in prioritization and does not replace histopathological tissue biopsy by a licensed pathologist.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 OncoLink Oncology Healthcare Systems. Production Release v2.4.</span>
          <span className="text-emerald-700 font-semibold">VESIT Healthcare Engineering Project</span>
        </div>
      </div>
    </footer>
  );
};
