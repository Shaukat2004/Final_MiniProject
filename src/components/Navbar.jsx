import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Globe,
  PhoneCall,
  User,
  Stethoscope,
  HeartPulse,
  Menu,
  X,
  Hospital,
  BookOpen,
  Calendar,
  HeartHandshake,
  LogOut
} from 'lucide-react';

export const Navbar = () => {
  const { lang, setLang, t, activeTab, setActiveTab, user, setAuthModalOpen, setUser, clearUserData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleNavClick = (id) => {
    if (id !== 'home' && !user?.isLoggedIn) {
      setAuthModalOpen(true);
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('oncolink_token');
    setUser({ isLoggedIn: false });
    clearUserData();
    setActiveTab('home');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Clinical Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Onco<span className="text-emerald-600">Link</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  Clinical Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Oral Cancer Early Triage & Integrated Care
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'home' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navHome}
            </button>

            {user?.role === 'patient' ? (
              <button
                onClick={() => handleNavClick('patient_portal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'patient_portal' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Patient Dashboard</span>
              </button>
            ) : user?.role === 'caretaker' ? (
              <button
                onClick={() => handleNavClick('caretaker_portal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'caretaker_portal' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                <span>Caretaker Portal</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('doctor_portal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'doctor_portal' ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>Oncologist Triage Portal</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('hospitals')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'hospitals' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hospital className="w-4 h-4 text-slate-500" />
              <span>Hospitals & Map</span>
            </button>

            <button
              onClick={() => handleNavClick('schemes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'schemes' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Govt Schemes</span>
            </button>
          </nav>

          {/* Utilities & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="uppercase">{lang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50">
                  <button
                    onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${lang === 'en' ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLang('hi'); setLangDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${lang === 'hi' ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    onClick={() => { setLang('mr'); setLangDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${lang === 'mr' ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>

            {/* Emergency SOS Hotline */}
            <a
              href="tel:1800221952"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
              title="National Cancer Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>1800-22-1952</span>
            </a>

            {/* User Profile / Portal Switch */}
            {user?.isLoggedIn ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    user.role === 'doctor'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : user.role === 'caretaker'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {user.role === 'doctor' ? 'Doctor View' : user.role === 'caretaker' ? 'Caretaker View' : 'Patient View'}
                </span>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {t.loginBtn}
              </button>
            )}

          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2">
          <div className="flex gap-2 pb-2 border-b border-slate-100">
            <button onClick={() => setLang('en')} className={`flex-1 py-1 text-xs font-bold rounded-lg border ${lang === 'en' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-slate-200'}`}>EN</button>
            <button onClick={() => setLang('hi')} className={`flex-1 py-1 text-xs font-bold rounded-lg border ${lang === 'hi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-slate-200'}`}>हिंदी</button>
            <button onClick={() => setLang('mr')} className={`flex-1 py-1 text-xs font-bold rounded-lg border ${lang === 'mr' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-slate-200'}`}>मराठी</button>
          </div>

          <button onClick={() => handleNavClick('home')} className="w-full text-left p-2 font-bold text-slate-800 text-xs">Home</button>
          {user?.role === 'patient' ? (
            <button onClick={() => handleNavClick('patient_portal')} className="w-full text-left p-2 font-bold text-emerald-700 text-xs">Patient Dashboard</button>
          ) : user?.role === 'caretaker' ? (
            <button onClick={() => handleNavClick('caretaker_portal')} className="w-full text-left p-2 font-bold text-indigo-700 text-xs">Caretaker Portal</button>
          ) : (
            <button onClick={() => handleNavClick('doctor_portal')} className="w-full text-left p-2 font-bold text-purple-700 text-xs">Doctor Triage Portal</button>
          )}
          <button onClick={() => handleNavClick('hospitals')} className="w-full text-left p-2 font-bold text-slate-800 text-xs">Hospitals & Map</button>
          <button onClick={() => handleNavClick('schemes')} className="w-full text-left p-2 font-bold text-slate-800 text-xs">Government Schemes</button>
        </div>
      )}
    </header>
  );
};
