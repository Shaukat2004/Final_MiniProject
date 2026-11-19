import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Hospital,
  HeartHandshake,
  BookOpen,
  Phone,
  Mail,
  Send,
  UserCheck,
  Stethoscope,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { AuthPanel } from './AuthPanel';

export const LandingHero = () => {
  const { t, setActiveTab, user, setUser, setAuthModalOpen, triggerLoadingWithFact } = useApp();

  // In-page Login/Signup Form State
  const [authMethod, setAuthMethod] = useState('phone');
  const [role, setRole] = useState('patient');
  const [contactValue, setContactValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [ageValue, setAgeValue] = useState('');
  const [doctorCode, setDoctorCode] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentAlert, setOtpSentAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Send OTP via Minimoth Gateway API
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!contactValue.trim()) {
      setErrorMsg('Please enter a valid phone number or email.');
      return;
    }
    setErrorMsg('');
    setLoadingAction(true);

    try {
      const res = await api.auth.sendOtp(contactValue, authMethod === 'phone' ? 'sms' : 'email');
      setLoadingAction(false);
      setOtpSentAlert(true);
      setOtpStep(true);
      setOtpCode('');
    } catch (err) {
      setLoadingAction(false);
      setErrorMsg(err.response?.data?.error || 'We could not send the OTP. Please try again.');
    }
  };

  // Verify OTP via Minimoth API
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    setErrorMsg('');

    try {
      const payload = {
        contact: contactValue,
        otp: otpCode,
        name: nameValue,
        role: role,
        ...(role === 'doctor' ? { doctorCode } : {}),
        ...(ageValue ? { age: parseInt(ageValue, 10) } : {})
      };

      const res = await api.auth.verifyOtp(payload);
      if (!res?.user || !res?.token) throw new Error('The server returned an invalid sign-in response.');
      setLoadingAction(false);

      triggerLoadingWithFact(600, () => {
        const loggedUser = res.user;

        localStorage.setItem('oncolink_token', res.token);
        setUser({ ...loggedUser, isLoggedIn: true });
        setOtpStep(false);
        setActiveTab(role === 'doctor' ? 'doctor_portal' : 'patient_portal');
      });
    } catch (err) {
      setLoadingAction(false);
      setErrorMsg(err.response?.data?.error || 'Invalid OTP. Please request a new code and try again.');
    }
  };

  return (
    <div className="w-full pb-20 bg-slate-50">
      
      {/* Hero Section */}
      <section className="pt-10 pb-16 md:pt-16 md:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Clinically Validated Oral Oncology Triage & Care Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Early Detection <span className="text-emerald-700">Saves Lives.</span>
              <br />
              <span className="text-2xl sm:text-3xl text-slate-700 font-bold">
                From Computer Vision Screening to Hospital Care.
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Upload an oral cavity photo for deep learning classification, receive a calibrated 1-100 risk assessment with Grad-CAM visual heatmaps, connect with leading cancer centers, and access government cashless schemes.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (user?.isLoggedIn) {
                    setActiveTab(user.role === 'doctor' ? 'doctor_portal' : 'patient_portal');
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Go to Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => user?.isLoggedIn ? setActiveTab('hospitals') : setAuthModalOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Hospital className="w-4 h-4 text-emerald-600" />
                <span>Find Cancer Hospitals Map</span>
              </button>
            </div>

            {/* Clinical Evidence Counters */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-2xl font-black text-emerald-700">85%+</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">5-Yr Survival in Stage-I</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-2xl font-black text-blue-700">94.6%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Lesion Saliency Accuracy</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-2xl font-black text-amber-700">₹5 Lakhs</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Cashless PM-JAY / MJPJAY</div>
              </div>
            </div>

          </div>

          {/* Right Hero: Clean Medical Login/Register Card */}
          <div className="lg:col-span-5">
            <AuthPanel compact />
            <div className="hidden">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sign In / Register</h3>
                  <p className="text-xs text-slate-500">Minimoth Verified OTP Gateway</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Secure Access
                </span>
              </div>

              {/* Role Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    role === 'patient' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patient / Caregiver</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    role === 'doctor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                  <span>Doctor / Oncologist</span>
                </button>
              </div>

              {!otpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="flex border-b border-slate-200 pb-2 gap-4 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('phone');
                        setContactValue('');
                      }}
                      className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                        authMethod === 'phone' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone Number</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('email');
                        setContactValue('');
                      }}
                      className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                        authMethod === 'email' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Address</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder={role === 'doctor' ? 'Doctor name' : 'Your name'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className={`grid gap-2 ${role === 'patient' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    <div className={role === 'patient' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {authMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
                      </label>
                      <input
                        type={authMethod === 'phone' ? 'tel' : 'email'}
                        required
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder={authMethod === 'phone' ? '+91 phone number' : 'you@example.com'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {role === 'patient' && <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={ageValue}
                        onChange={(e) => setAgeValue(e.target.value)}
                        placeholder="Age"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>}
                  </div>
                  {role === 'doctor' && <label className="block text-xs font-semibold text-slate-700">Doctor invitation code (required for new accounts)<input value={doctorCode} onChange={(e) => setDoctorCode(e.target.value)} autoComplete="off" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500" /></label>}

                  {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>{loadingAction ? 'Connecting to Minimoth...' : 'Send OTP via Minimoth Gateway'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Minimoth SMS Sent!</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">Dispatched to: {contactValue}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 4-Digit OTP</label>
                    <input
                      type="text"
                        maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                       placeholder="Enter the OTP sent to you"
                      className="w-full text-center tracking-[0.8em] font-mono text-2xl py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                        onClick={() => setOtpCode('')}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                       Clear OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Change Contact
                    </button>
                  </div>

                  {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>{loadingAction ? 'Verifying...' : 'Verify OTP & Enter Portal'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                Currently logged in: <span className="font-bold text-slate-800">{user?.name}</span> ({user?.role})
              </div>
            </div>
            </div>
          </div>

        </div>
      </section>

      {/* What OncoLink Does - Clean Medical Cards */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              The Complete Oral Oncology Care Pathway
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              A synchronized healthcare workflow connecting patients, oncologists, hospitals, and government funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">PyTorch Grad-CAM Diagnostics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Convolutional neural networks compute 1-100 malignancy risk scores and real heatmaps. Automatic mucosal gatekeepers reject non-oral images.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Direct Doctor Referral Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-risk scans are transmitted straight to chief oncologists at Tata Memorial Hospital for immediate biopsy confirmation and prescriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Hospital className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Google Maps Live Hospital Locator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Locate verified apex cancer centers with live GPS distance calculations, bed availability, and 1-click turn-by-turn driving directions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Government Schemes Calculator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Avail up to ₹15 Lakhs in cashless surgical coverage under Ayushman Bharat PM-JAY, Maharashtra MJPJAY, and Rashtriya Arogya Nidhi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Day Care & Oncology Caretakers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book verified oncology nurses for chemo infusion companion care in the hospital or tracheostomy and tube feeding at home.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Diet & Tobacco Cessation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Non-spicy soft dysphagia recipes, jaw-opening rehabilitation tracking, and a guided 3-minute diaphragmatic craving SOS tool.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
