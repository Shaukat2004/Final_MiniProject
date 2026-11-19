import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Mail, Phone, Send, ArrowRight, CheckCircle2, Stethoscope, UserCheck, HeartHandshake } from 'lucide-react';

export const AuthPanel = ({ compact = false }) => {
  const { user, setUser, setAuthModalOpen, setActiveTab, triggerLoadingWithFact } = useApp();
  const [role, setRole] = useState('patient');
  const [method, setMethod] = useState('phone');
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorCode, setDoctorCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const finishLogin = (result) => {
    localStorage.setItem('oncolink_token', result.token);
    setUser({ ...result.user, isLoggedIn: true });
    setAuthModalOpen(false);
    setOtpStep(false);
    const portalByRole = {
      patient: 'patient_portal',
      doctor: 'doctor_portal',
      caretaker: 'caretaker_portal'
    };
    setActiveTab(portalByRole[result.user.role] || 'home');
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setMessage('');
    if (registering && password !== confirmPassword) return setMessage('Passwords do not match.');
    setBusy(true);
    try {
      const result = registering
        ? await api.auth.registerPatient({ name, email: contact, password, phone })
        : await api.auth.loginPassword({ email: contact, password, role });
      finishLogin(result);
    } catch (error) {
      setMessage(error.response?.data?.error || (error.code === 'ERR_NETWORK'
        ? 'The care server is offline. Start the backend on port 5000 and try again.'
        : error.message || 'Unable to continue. Please try again.'));
    } finally { setBusy(false); }
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      await api.auth.sendOtp(contact, 'sms');
      setOtpStep(true);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to send OTP. Please try again.');
    } finally { setBusy(false); }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const result = await api.auth.verifyOtp({
        contact,
        otp,
        name: name || undefined,
        role,
        ...(role === 'doctor' ? { doctorCode } : {})
      });
      finishLogin(result);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally { setBusy(false); }
  };

  const changeRole = (nextRole) => {
    setRole(nextRole);
    if (nextRole !== 'patient') setRegistering(false);
    if (nextRole === 'caretaker') {
      setMethod('email');
      setOtpStep(false);
    }
    setDoctorCode('');
    setMessage('');
  };

  return (
    <div className={compact ? 'w-full' : 'relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800'}>
      <div className="mb-5 text-center">
        <h3 className="text-xl font-black text-slate-900">{registering ? 'Create patient account' : 'Sign in'}</h3>
        <p className="text-xs text-slate-500 mt-1">Choose how you want to access your care portal.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
        <button type="button" onClick={() => changeRole('patient')} className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${role === 'patient' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}><UserCheck className="w-3.5 h-3.5 text-emerald-600" />Patient</button>
        <button type="button" onClick={() => changeRole('doctor')} className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${role === 'doctor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}><Stethoscope className="w-3.5 h-3.5 text-purple-600" />Doctor</button>
        <button type="button" onClick={() => changeRole('caretaker')} className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${role === 'caretaker' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}><HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />Caretaker</button>
      </div>

      {role === 'patient' && (
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="text-slate-500">New patient?</span>
          <button type="button" onClick={() => { setRegistering(!registering); setMethod('email'); setMessage(''); }} className="font-bold text-emerald-700 hover:underline">{registering ? 'Back to sign in' : 'Register here'}</button>
        </div>
      )}

      {role === 'caretaker' && (
        <p className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-800">
          Caretaker accounts are invitation-only. Contact your administrator for sign-in details.
        </p>
      )}

      {!registering && role !== 'caretaker' && (
        <div className="flex border-b border-slate-200 pb-2 gap-4 text-xs font-semibold mb-4">
          <button type="button" onClick={() => { setMethod('phone'); setOtpStep(false); setMessage(''); }} className={`flex items-center gap-1.5 pb-1 border-b-2 ${method === 'phone' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}><Phone className="w-3.5 h-3.5" />Phone number</button>
          <button type="button" onClick={() => { setMethod('email'); setOtpStep(false); setMessage(''); }} className={`flex items-center gap-1.5 pb-1 border-b-2 ${method === 'email' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}><Mail className="w-3.5 h-3.5" />Email and password</button>
        </div>
      )}

      {method === 'phone' && !registering ? (
        otpStep ? (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>OTP sent to {contact}.</span></div>
            {role === 'doctor' && <label className="block text-xs font-semibold text-slate-700">Doctor invitation code (required for new accounts)<input value={doctorCode} onChange={(e) => setDoctorCode(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" autoComplete="off" /></label>}
            <input required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Enter OTP" className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl border border-slate-200" />
            <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs">{busy ? 'Verifying...' : 'Verify OTP'}</button>
            <button type="button" onClick={() => setOtpStep(false)} className="w-full text-xs text-slate-500">Change phone number</button>
          </form>
        ) : (
          <form onSubmit={sendOtp} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">Phone number</label>
            <input required type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" />
            <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2"><span>{busy ? 'Sending...' : 'Send OTP using Minimoth'}</span><Send className="w-3.5 h-3.5" /></button>
          </form>
        )
      ) : (
        <form onSubmit={submitPassword} className="space-y-4">
          {registering && <><label className="block text-xs font-semibold text-slate-700">Full name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" /></label></>}
          <label className="block text-xs font-semibold text-slate-700">Email address<input required type="email" value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" /></label>
          {registering && <label className="block text-xs font-semibold text-slate-700">Phone number<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" /></label>}
          <label className="block text-xs font-semibold text-slate-700">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" /></label>
          {registering && <label className="block text-xs font-semibold text-slate-700">Confirm password<input required minLength={8} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" /></label>}
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2">{busy ? 'Please wait...' : registering ? 'Create patient account' : 'Sign in'}<ArrowRight className="w-3.5 h-3.5" /></button>
        </form>
      )}
      {message && <p className="mt-3 text-xs text-rose-600 font-medium">{message}</p>}
      {user?.isLoggedIn && <p className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-center text-slate-500">Currently logged in: {user.name}</p>}
    </div>
  );
};
