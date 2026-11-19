import React, { useEffect, useState } from 'react';
import { Bot, Calendar, CheckCircle2, Hospital, X } from 'lucide-react';
import { api } from '../services/api';
import { toIsoDateTime, toLocalDateTimeInput } from '../utils/dateTime';
import { useApp } from '../context/AppContext';

export const AppointmentChatbot = ({ user, onClose, onBooked }) => {
  const { t } = useApp();
  const [hospitals, setHospitals] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [date, setDate] = useState(() => toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [step, setStep] = useState('hospital');
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.hospitals.getNearby().then((response) => {
      if (active) setHospitals((response.hospitals || []).slice(0, 5));
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.error || 'Unable to load cancer hospitals right now. Please use the map instead.');
    }).finally(() => {
      if (active) setLoadingHospitals(false);
    });
    return () => { active = false; };
  }, []);

  const chooseHospital = (selected) => {
    setHospital(selected);
    setStep('date');
    setError('');
  };

  const continueWithDate = () => {
    if (!date) {
      setError('Choose an appointment date and time.');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const confirmBooking = async () => {
    if (!hospital || !date || !user?.id) return;
    setBusy(true);
    setError('');
    try {
      const doctor = hospital.doctors?.[0];
      const response = await api.appointments.book({
        patientId: user.id,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        doctorName: doctor?.name || 'Hospital oncology appointment desk',
        specialty: doctor?.role || hospital.specialties?.[0] || 'Oncology consultation',
        date: toIsoDateTime(date),
        type: 'Oncology consultation',
        bookedVia: 'AI Chatbot'
      });
      onBooked(response.appointment);
    } catch (bookingError) {
      setError(bookingError.response?.data?.error || 'Unable to book this appointment. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-emerald-700 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div><h3 className="text-sm font-bold">Appointment Assistant</h3><p className="text-[11px] text-emerald-100">Book a hospital consultation</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close appointment assistant"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-900">
            {step === 'hospital' && 'I can help you book an oncology consultation. First, choose a hospital.'}
            {step === 'date' && `Good choice. Select an available consultation time at ${hospital?.name}.`}
            {step === 'confirm' && 'Please confirm these appointment details.'}
            {step === 'done' && 'Your appointment has been confirmed and saved to your account.'}
          </div>

          {step === 'hospital' && (
            <div className="space-y-2">
                  {loadingHospitals && <p role="status" className="text-xs text-slate-500">{t.apiLoading}</p>}
                  {!loadingHospitals && hospitals.length === 0 && !error && <p className="text-xs text-slate-500">No hospitals are available right now.</p>}
                  {hospitals.map((item) => (
                <button type="button" key={item.id} onClick={() => chooseHospital(item)} className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-400">
                  <Hospital className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span><strong className="block text-xs text-slate-900">{item.name}</strong><span className="text-[11px] text-slate-500">{item.address || item.city}</span></span>
                </button>
              ))}
            </div>
          )}

          {step === 'date' && <div className="space-y-3"><label className="block text-xs font-semibold text-slate-700">{t.appointmentDateTime}<input required type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900" /></label><button type="button" onClick={continueWithDate} className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white">Continue</button></div>}

          {step === 'confirm' && <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs"><div><span className="text-slate-500">Hospital</span><strong className="block text-slate-900">{hospital?.name}</strong></div><div><span className="text-slate-500">Consultation</span><strong className="block text-slate-900">{new Date(date).toLocaleString()}</strong></div><button type="button" disabled={busy} onClick={confirmBooking} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white">{busy ? t.appointmentLoading : 'Confirm appointment'}</button></div>}

          {step === 'done' && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-5 w-5" />Appointment confirmed successfully.</div>}
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          {step === 'done' && <button type="button" onClick={onClose} className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700">Close</button>}
        </div>
      </div>
    </div>
  );
};
