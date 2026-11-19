import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Hospital,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Upload,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { toIsoDateTime, toLocalDateTimeInput } from '../utils/dateTime';

const initialMessages = [{
  id: 1,
  role: 'assistant',
  text: 'Hi! I can guide you through an oral image screening, help book a consultation, or take you to another patient service.',
  actions: ['screening', 'appointment', 'services']
}];

const serviceActions = [
  { id: 'patient-dashboard', label: 'Patient dashboard' },
  { id: 'hospitals', label: 'Hospitals & map' },
  { id: 'vault', label: 'Health records' },
  { id: 'daycare', label: 'Caretaker support' },
  { id: 'schemes', label: 'Government schemes' },
  { id: 'diet', label: 'Diet & cessation' }
];

const actionLabels = {
  screening: 'Upload an oral image',
  appointment: 'Book an appointment',
  services: 'Explore patient services',
  'sign-in': 'Sign in',
  'book-another': 'Book another appointment',
  'patient-dashboard': 'Open patient dashboard',
  hospitals: 'Open hospitals & map',
  vault: 'Open health records',
  daycare: 'Open caretaker support',
  schemes: 'Open government schemes',
  diet: 'Open diet & cessation',
  'start-over': 'Start over'
};

export const PatientCareAssistant = () => {
  const {
    user,
    setAuthModalOpen,
    setActiveTab,
    setAppointments,
    setCurrentScreening
  } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [flow, setFlow] = useState('menu');
  const [appointmentStep, setAppointmentStep] = useState('hospital');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(() =>
    toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [screeningResult, setScreeningResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, flow, appointmentStep, busy, error]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => {
    if (user?.isLoggedIn && user.role === 'patient') {
      setMessages(initialMessages);
      setFlow('menu');
      setAppointmentStep('hospital');
      setHospitals([]);
      setSelectedHospital(null);
      setSelectedFile(null);
      setImagePreview('');
      setScreeningResult(null);
      setError('');
      setOpen(true);
      return;
    }

    setOpen(false);
    setMessages(initialMessages);
    setFlow('menu');
    setAppointmentStep('hospital');
    setHospitals([]);
    setSelectedHospital(null);
    setSelectedFile(null);
    setImagePreview('');
    setScreeningResult(null);
    setError('');
  }, [user?.isLoggedIn, user?.role]);

  if (!user?.isLoggedIn || user.role !== 'patient') return null;

  const appendMessage = (role, text, actions = []) => {
    setMessages((current) => [...current, {
      id: `${Date.now()}-${Math.random()}`,
      role,
      text,
      actions
    }]);
  };

  const resetFlow = () => {
    setFlow('menu');
    setSelectedHospital(null);
    setSelectedFile(null);
    setImagePreview('');
    setScreeningResult(null);
    setAppointmentStep('hospital');
    setError('');
  };

  const requirePatient = () => {
    if (user?.isLoggedIn && user.role === 'patient') return true;
    appendMessage('assistant', 'Please sign in to a patient account to use screening and appointment services.', ['sign-in']);
    return false;
  };

  const startScreening = () => {
    if (!requirePatient()) return;
    setError('');
    setFlow('screening');
    setSelectedFile(null);
    setImagePreview('');
    setScreeningResult(null);
    appendMessage('user', 'I want to check an oral image.');
    appendMessage('assistant', 'Choose a clear, well-lit close-up of the mouth, tongue, gums, or inner cheek. You can review it before choosing Analyze.');
  };

  const startAppointment = async () => {
    if (!requirePatient()) return;
    setError('');
    setFlow('appointment');
    setAppointmentStep('hospital');
    setSelectedHospital(null);
    setHospitals([]);
    setLoadingHospitals(true);
    appendMessage('user', 'Help me book an appointment.');
    appendMessage('assistant', 'I’ll show available hospitals. Choose one to continue.');
    try {
      const response = await api.hospitals.getNearby();
      setHospitals((response.hospitals || []).slice(0, 5));
      if (!response.hospitals?.length) setError('No hospitals are available right now. You can use Hospitals & map to explore.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load hospitals right now.');
    } finally {
      setLoadingHospitals(false);
    }
  };

  const openServices = () => {
    setError('');
    setFlow('services');
    appendMessage('user', 'Show me other patient services.');
    appendMessage('assistant', 'Choose a section and I’ll take you there.');
  };

  const navigateToService = (action) => {
    if (!user?.isLoggedIn || user.role !== 'patient') {
      requirePatient();
      return;
    }
    const tabByAction = {
      'patient-dashboard': 'patient_portal',
      hospitals: 'hospitals',
      vault: 'vault',
      daycare: 'daycare',
      schemes: 'schemes',
      diet: 'diet'
    };
    const tab = tabByAction[action];
    if (!tab) return;
    appendMessage('assistant', `Opening ${actionLabels[action].replace(/^Open /, '').toLowerCase()}.`);
    setOpen(false);
    setActiveTab(tab);
  };

  const handleAction = (action) => {
    if (action === 'screening') return startScreening();
    if (action === 'appointment' || action === 'book-another') return startAppointment();
    if (action === 'services') return openServices();
    if (action === 'sign-in') {
      setOpen(false);
      setAuthModalOpen(true);
      return;
    }
    if (action === 'start-over') {
      resetFlow();
      appendMessage('assistant', 'What would you like help with?', ['screening', 'appointment', 'services']);
      return;
    }
    navigateToService(action);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file to continue.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('The image must be smaller than 15 MB.');
      return;
    }
    setError('');
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const analyzeImage = async () => {
    if (!selectedFile || !requirePatient()) return;
    setBusy(true);
    setError('');
    appendMessage('user', 'Analyze the selected oral image.');
    appendMessage('assistant', 'Analyzing your image. This can take a little while.');
    try {
      const payload = new FormData();
      payload.append('image', selectedFile);
      const response = await api.screenings.analyzeImage(payload);
      const item = response?.data;
      const score = Number(item?.riskScore);
      if (!response?.success || !item || !Number.isFinite(score)) {
        throw new Error('The screening service returned an invalid result. Please try again.');
      }

      const result = {
        score,
        riskLevel: item.riskLevel || 'Review recommended',
        region: item.anatomicalZone || 'Not specified',
        biomarkers: item.biomarkers || {},
        timestamp: new Date().toLocaleString(),
        patientName: user.name,
        imageSrc: item.gradCamHeatmapBase64 || ''
      };
      setScreeningResult(result);
      setCurrentScreening(result);
      setFlow('screening-result');
      appendMessage('assistant', 'Your screening result is ready. This is not a diagnosis; please have a qualified clinician assess any concerning result.', ['services']);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        requestError.message ||
        'The screening could not be completed. Please try again.'
      );
      appendMessage('assistant', 'I could not complete that screening. You can choose another image and try again.');
    } finally {
      setBusy(false);
    }
  };

  const chooseHospital = (hospital) => {
    setSelectedHospital(hospital);
    setAppointmentStep('date');
    setError('');
    appendMessage('user', `Continue with ${hospital.name}.`);
    appendMessage('assistant', `Choose a consultation date and time at ${hospital.name}.`);
  };

  const continueToConfirmation = () => {
    if (!appointmentDate || new Date(appointmentDate).getTime() <= Date.now()) {
      setError('Choose a future date and time.');
      return;
    }
    setError('');
    setAppointmentStep('confirm');
    appendMessage('user', `Review my appointment at ${selectedHospital?.name}.`);
    appendMessage('assistant', 'Please review the details and confirm only if they are correct.');
  };

  const confirmAppointment = async () => {
    if (!selectedHospital || !user?.id) return;
    setBusy(true);
    setError('');
    try {
      const doctor = selectedHospital.doctors?.[0];
      const response = await api.appointments.book({
        patientId: user.id,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        doctorName: doctor?.name || 'Hospital oncology appointment desk',
        specialty: doctor?.role || selectedHospital.specialties?.[0] || 'Oncology consultation',
        date: toIsoDateTime(appointmentDate),
        type: 'Oncology consultation',
        bookedVia: 'Patient Care Assistant'
      });
      setAppointments((current) => [response.appointment, ...current]);
      setAppointmentStep('done');
      appendMessage('assistant', 'Your appointment has been booked and added to your patient records.', ['patient-dashboard', 'book-another', 'services']);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to book this appointment. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <section
          aria-label="Patient care assistant"
          className="fixed bottom-24 right-4 z-50 flex h-[min(42rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6"
        >
          <header className="flex items-center justify-between bg-emerald-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Bot className="h-5 w-5" /></span>
              <div>
                <h2 className="text-sm font-bold">Patient Care Assistant</h2>
                <p className="text-[11px] text-emerald-100">Guided help with care services</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-lg p-2 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" role="log" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed ${
                  message.role === 'user'
                    ? 'rounded-br-md bg-emerald-700 text-white'
                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                }`}>
                  <p>{message.text}</p>
                  {!!message.actions?.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handleAction(action)}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          {actionLabels[action] || action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {flow === 'screening' && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5">
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Selected oral image preview" className="h-16 w-16 rounded-xl border border-slate-200 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">{selectedFile?.name}</p>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-1 text-[11px] font-bold text-emerald-700">Choose a different image</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 py-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
                    <Upload className="h-4 w-4" /> Choose oral image
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <p className="flex gap-2 text-[10px] leading-relaxed text-slate-500">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  Your image is sent to the configured screening service for analysis. Proceeding is your choice. This screening is not a diagnosis.
                </p>
                <button type="button" onClick={analyzeImage} disabled={!selectedFile || busy} className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? 'Analyzing image…' : 'Analyze image'}
                </button>
              </div>
            )}

            {flow === 'screening-result' && screeningResult && (
              <div className="rounded-2xl border border-emerald-200 bg-white p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Screening result · not a diagnosis</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{screeningResult.riskLevel}</p>
                <p className="mt-1 text-xs text-slate-600">Screening score: {screeningResult.score}/100</p>
                <p className="mt-1 text-xs text-slate-600">Area noted: {screeningResult.region}</p>
                <button type="button" onClick={() => handleAction('appointment')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white">
                  <CalendarDays className="h-4 w-4" />Book a clinician consultation
                </button>
              </div>
            )}

            {flow === 'appointment' && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5">
                {appointmentStep === 'hospital' && (
                  <>
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-700"><Hospital className="h-4 w-4 text-emerald-700" />Choose a hospital</p>
                    {loadingHospitals && <p role="status" className="text-xs text-slate-500">Loading hospitals…</p>}
                    {!loadingHospitals && hospitals.map((hospital) => (
                      <button key={hospital.id} type="button" onClick={() => chooseHospital(hospital)} className="flex w-full items-start gap-2 rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-400">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        <span><strong className="block text-xs text-slate-800">{hospital.name}</strong><span className="text-[11px] text-slate-500">{hospital.address || hospital.city}</span></span>
                      </button>
                    ))}
                  </>
                )}

                {appointmentStep === 'date' && (
                  <>
                    <p className="text-xs text-slate-600">Select a future consultation time at <strong>{selectedHospital?.name}</strong>.</p>
                    <label className="block text-xs font-semibold text-slate-700">
                      Date and time
                      <input type="datetime-local" value={appointmentDate} min={toLocalDateTimeInput()} onChange={(event) => setAppointmentDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900" />
                    </label>
                    <button type="button" onClick={continueToConfirmation} className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white">Review appointment</button>
                  </>
                )}

                {appointmentStep === 'confirm' && (
                  <>
                    <p className="text-xs font-bold text-slate-800">Confirm appointment details</p>
                    <p className="text-xs text-slate-600">{selectedHospital?.name}</p>
                    <p className="text-xs text-slate-600">{new Date(appointmentDate).toLocaleString()}</p>
                    <button type="button" disabled={busy} onClick={confirmAppointment} className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Booking…' : 'Confirm booking'}</button>
                  </>
                )}

                {appointmentStep === 'done' && <p className="flex items-center gap-2 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Appointment confirmed.</p>}
              </div>
            )}

            {flow === 'services' && (
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                {serviceActions.map(({ id, label }) => (
                  <button key={id} type="button" onClick={() => handleAction(id)} className="flex min-h-11 items-center justify-between gap-1 rounded-xl bg-slate-50 px-2.5 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">
                    {label}<ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5">
            <p className="text-[10px] text-slate-500">For care guidance—not a medical diagnosis.</p>
            <button type="button" onClick={() => handleAction('start-over')} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-emerald-700">
              <RotateCcw className="h-3 w-3" />Start over
            </button>
          </footer>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close patient care assistant' : 'Open patient care assistant'}
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-xl transition hover:bg-emerald-800 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span>{open ? 'Close assistant' : 'Care assistant'}</span>
      </button>
    </>
  );
};
