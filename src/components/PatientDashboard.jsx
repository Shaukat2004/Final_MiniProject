import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  User,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Hospital,
  MapPin,
  Bell,
  Utensils,
  BookOpen,
  HeartHandshake,
  TrendingUp,
  FileText,
  Phone,
  Flame,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import { CancerHospitalsMap } from './CancerHospitalsMap';
import { OralDetection } from './OralDetection';
import { GovernmentSchemes } from './GovernmentSchemes';
import { DayCareCaretaker } from './DayCareCaretaker';
import { DietAndCessation } from './DietAndCessation';
import { formatDateTime, toIsoDateTime, toLocalDateTimeInput } from '../utils/dateTime';
import confetti from 'canvas-confetti';

export const PatientDashboard = () => {
  const {
    t,
    user,
    currentScreening,
    appointments,
    setAppointments,
    referrals,
    medicines,
    setMedicines,
    trismusLogs,
    setTrismusLogs,
    workspaceLoading
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview', 'screening', 'hospitals', 'appointments', 'medicines', 'trismus', 'schemes', 'caretakers', 'diet'
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [newSlot, setNewSlot] = useState(() => toLocalDateTimeInput());
  const [bookingHospital, setBookingHospital] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [bookingMessage, setBookingMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Add Medicine Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTiming, setMedTiming] = useState('Morning (8:00 AM)');

  // Trismus Form
  const [openingMm, setOpeningMm] = useState('37');
  const [painLevel, setPainLevel] = useState('2');
  const latestReferral = referrals[0];

  const toggleMedicine = async (id) => {
    setActionLoading(true);
    setApiError('');
    try {
      const { medicine } = await api.patient.toggleMedicine(id);
      setMedicines((current) => current.map((item) => String(item.id) === String(id) ? medicine : item));
      if (medicine.taken) confetti({ particleCount: 30, spread: 45 });
    } catch (error) {
      setApiError(error.response?.data?.error || 'Unable to update this medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!medName.trim()) return;
    setActionLoading(true);
    setApiError('');
    try {
      const response = await api.patient.addMedicine({
        patientId: user.id,
        name: medName,
        dosage: medDosage || '1 dose',
        timing: medTiming
      });
      setMedicines((current) => [...current, response.medicine]);
      setMedName('');
      setMedDosage('');
    } catch (error) {
      setApiError(error.response?.data?.error || 'Unable to save this medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogTrismus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setApiError('');
    try {
      const response = await api.patient.logTrismus({
        patientId: user.id,
        date: new Date().toLocaleDateString(),
        openingMm: parseInt(openingMm, 10),
        pain: parseInt(painLevel, 10)
      });
      setTrismusLogs((current) => [...current, response.log]);
      confetti({ particleCount: 40, spread: 50 });
    } catch (error) {
      setApiError(error.response?.data?.error || 'Unable to save this measurement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleApt) return;
    setActionLoading(true);
    setApiError('');
    try {
      const response = await api.appointments.reschedule(rescheduleApt.id, toIsoDateTime(newSlot));
      setAppointments((current) => current.map((appointment) => appointment.id === response.appointment.id ? response.appointment : appointment));
      setRescheduleApt(null);
      confetti({ particleCount: 45, spread: 50 });
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || 'Unable to reschedule this appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookAppointment = async (event) => {
    event.preventDefault();
    if (!bookingHospital) return;
    setBookingMessage('');
    setActionLoading(true);
    setApiError('');
    try {
      const result = await api.appointments.book({
        patientId: user.id,
        hospitalId: bookingHospital.id,
        hospitalName: bookingHospital.name,
        doctorName: bookingHospital.doctors?.[0]?.name || 'Oncology specialist',
        specialty: 'Head & Neck Oncology',
        date: toIsoDateTime(bookingDate),
        type: 'Oncology consultation'
      });
      setAppointments((current) => [result.appointment, ...current]);
      setBookingHospital(null);
      setBookingMessage('Appointment confirmed and saved to your patient record.');
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || 'Unable to book the appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {workspaceLoading && <p role="status" className="mb-4 text-xs text-slate-500">{t.apiLoading}</p>}
      {apiError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{apiError}</p>}
      
      {/* Patient Clinical Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xl">
              {user.name?.split(' ').map(n => n[0]).join('') || 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Patient Portal
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                {user.abhaId && <><span>ABHA ID: <strong className="text-slate-800">{user.abhaId}</strong></span><span>•</span></>}
                {user.age && <><span>Age: <strong className="text-slate-800">{user.age} Yrs</strong></span><span>•</span></>}
                {user.bloodGroup && <><span>Blood: <strong className="text-slate-800">{user.bloodGroup}</strong></span><span>•</span></>}
                <span>Location: <strong className="text-slate-800">{user.location || 'Mumbai, MH'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubTab('screening')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>New Oral Scan</span>
            </button>
            <button
              onClick={() => setActiveSubTab('hospitals')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Hospital className="w-4 h-4 text-emerald-600" />
              <span>Find Cancer Hospitals</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Patient Overview', icon: User },
          { id: 'screening', label: 'AI Oral Screening', icon: Activity },
          { id: 'hospitals', label: 'Hospitals & Live Map', icon: Hospital },
          { id: 'appointments', label: 'My Appointments', icon: Calendar },
          { id: 'medicines', label: 'Medicine Reminders', icon: Bell },
          { id: 'trismus', label: 'Jaw Opening Tracker', icon: TrendingUp },
          { id: 'schemes', label: 'Government Grants', icon: BookOpen },
          { id: 'caretakers', label: 'Caretaker Booking', icon: HeartHandshake },
          { id: 'diet', label: 'Diet & Habit Cessation', icon: Utensils }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB: PATIENT OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Latest server-saved clinical review */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {latestReferral ? <>Latest review: <span className="text-amber-700">{latestReferral.riskLevel} (Score: {latestReferral.riskScore}/100)</span></> : 'Your latest clinical updates'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {latestReferral ? <>Location: <strong>{latestReferral.anatomicalRegion}</strong>. Assigned oncologist: <strong>{latestReferral.doctorName}</strong>.</> : 'Your screenings and care-team updates will appear here after they are saved.'}
                </p>
                {latestReferral?.notes && <div className="mt-2 text-xs text-emerald-800 font-semibold bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200 inline-block">{latestReferral.notes}</div>}
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {appointments.length > 0 && <button
                onClick={() => setActiveSubTab('appointments')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                View Appointment
              </button>}
              {currentScreening && <button
                onClick={() => setActiveSubTab('screening')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-amber-300"
              >
                View Heatmap
              </button>}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Today's Medicines */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>Today's Medicines</span>
                </h4>
                <span className="text-xs text-slate-500">
                  {medicines.filter(m => m.taken).length}/{medicines.length} Taken
                </span>
              </div>

              <div className="space-y-2">
                {medicines.slice(0, 3).map((med) => (
                  <div
                    key={med.id}
                    onClick={() => toggleMedicine(med.id)}
                    aria-disabled={actionLoading}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${med.taken ? 'bg-emerald-600' : 'border border-slate-300'}`}>
                        {med.taken && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={med.taken ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                        {med.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{med.timing.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveSubTab('medicines')}
                className="w-full text-center text-xs font-bold text-emerald-700 hover:underline pt-1"
              >
                Manage All Prescriptions →
              </button>
            </div>

            {/* Upcoming Consultations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Upcoming Consultations</span>
                </h4>
                <span className="text-xs text-blue-700 font-bold">Confirmed</span>
              </div>

              {appointments.slice(0, 1).map((apt) => (
                <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{apt.hospitalName}</div>
                  <div className="text-slate-600">{apt.doctorName} ({apt.specialty})</div>
                  <div className="text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(apt.date)}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setActiveSubTab('appointments')}
                className="w-full text-center text-xs font-bold text-blue-700 hover:underline pt-1"
              >
                View / Reschedule Slot →
              </button>
            </div>

            {/* Jaw Opening (Trismus) Progress */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Jaw Opening Recovery</span>
                </h4>
                <span className="text-xs font-bold text-purple-700">37 mm</span>
              </div>

              <p className="text-xs text-slate-500">
                Target: 40 mm. Your mouth opening improved from 32 mm to 37 mm over the last 6 days.
              </p>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
              </div>

              <button
                onClick={() => setActiveSubTab('trismus')}
                className="w-full text-center text-xs font-bold text-purple-700 hover:underline pt-1"
              >
                Log Today's Measurement →
              </button>
            </div>

          </div>

          {/* Quick Shortcuts to Ecosystem Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <button
              onClick={() => setActiveSubTab('schemes')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 text-left transition-colors"
            >
              <BookOpen className="w-5 h-5 text-amber-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Govt Grants</div>
              <div className="text-[11px] text-slate-500">Check PM-JAY & MJPJAY</div>
            </button>

            <button
              onClick={() => setActiveSubTab('caretakers')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 text-left transition-colors"
            >
              <HeartHandshake className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Day Care</div>
              <div className="text-[11px] text-slate-500">Hospital or Home Nurse</div>
            </button>

            <button
              onClick={() => setActiveSubTab('diet')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 text-left transition-colors"
            >
              <Utensils className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Soft Diets</div>
              <div className="text-[11px] text-slate-500">Dysphagia Safe Meals</div>
            </button>

            <button
              onClick={() => setActiveSubTab('diet')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 text-left transition-colors"
            >
              <Flame className="w-5 h-5 text-rose-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Quit Tobacco</div>
              <div className="text-[11px] text-slate-500">Craving SOS & Tracker</div>
            </button>
          </div>

        </div>
      )}

      {/* SUB-TAB: AI ORAL SCREENING */}
      {activeSubTab === 'screening' && (
        <OralDetection />
      )}

      {/* SUB-TAB: CANCER HOSPITALS & LIVE MAP */}
      {activeSubTab === 'hospitals' && (
          <CancerHospitalsMap
            onBookHospital={(hosp) => {
            setBookingHospital(hosp);
            setActiveSubTab('appointments');
            }}
          />
      )}

      {/* SUB-TAB: MY APPOINTMENTS */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">My Oncology Consultations</h3>
            <button
              onClick={() => setActiveSubTab('hospitals')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              + Book New Hospital Slot
            </button>
          </div>

          {bookingHospital && <form onSubmit={handleBookAppointment} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div>
              <h4 className="font-bold text-emerald-900">Book at {bookingHospital.name}</h4>
              <p className="text-xs text-emerald-800 mt-1">Select a requested slot. The booking will be saved to your patient account.</p>
            </div>
            <label className="block text-xs font-semibold text-emerald-900">{t.appointmentDateTime}<input required type="datetime-local" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-sm" /></label>
            <div className="flex gap-2"><button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-xl bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold">{actionLoading ? t.appointmentLoading : 'Confirm appointment'}</button><button type="button" onClick={() => setBookingHospital(null)} className="px-4 py-2 rounded-xl bg-white text-slate-700 text-xs font-bold border border-slate-200">Cancel</button></div>
          </form>}
          {bookingMessage && <p role="status" className="text-xs font-semibold text-emerald-700">{bookingMessage}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {apt.status}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">{apt.hospitalName}</h4>
                    <p className="text-xs text-emerald-700 font-semibold">{apt.doctorName} • {apt.specialty}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{apt.id}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{formatDateTime(apt.date)}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">Type: {apt.type}</div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setRescheduleApt(apt)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reschedule Slot</span>
                  </button>

                  <a
                    href="tel:1800221952"
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200"
                  >
                    Call Desk
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Reschedule Modal */}
          {rescheduleApt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 border border-slate-200">
                <h4 className="text-base font-bold text-slate-900">Reschedule Consultation</h4>
                <p className="text-xs text-slate-500">
                  Select a new available consultation window for {rescheduleApt.doctorName} at {rescheduleApt.hospitalName}.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select New OPD Slot</label>
                  <input
                    type="datetime-local"
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleConfirmReschedule}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs"
                  >
                    {actionLoading ? t.appointmentLoading : 'Confirm Time'}
                  </button>
                  <button
                    onClick={() => setRescheduleApt(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: MEDICINE REMINDERS */}
      {activeSubTab === 'medicines' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Active Prescriptions</h4>
            <div className="space-y-3">
              {medicines.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                    m.taken ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMedicine(m.id)}
                      disabled={actionLoading}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        m.taken ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                      }`}
                    >
                      {m.taken && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <h5 className={`text-sm font-bold ${m.taken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {m.name}
                      </h5>
                      <span className="text-xs text-slate-500">{m.dosage} • {m.timing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Add Custom Reminder</h4>
            <form onSubmit={handleAddMedicine} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Chlorhexidine Mouthwash"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="e.g. 10ml rinse"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Timing</label>
                <select
                  value={medTiming}
                  onChange={(e) => setMedTiming(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="Morning (8:00 AM)">Morning (8:00 AM)</option>
                  <option value="Afternoon (1:00 PM)">Afternoon (1:00 PM)</option>
                  <option value="Evening (5:00 PM)">Evening (5:00 PM)</option>
                  <option value="Night (9:00 PM)">Night (9:00 PM)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs"
              >
                {actionLoading ? t.appointmentLoading : 'Save Reminder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB: JAW OPENING TRACKER */}
      {activeSubTab === 'trismus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">7-Day Jaw Opening (Trismus) Progress</h4>
            <p className="text-xs text-slate-500">
              Inter-incisal opening distance in millimeters. Normal adult opening is 35-45 mm (3 finger-breadths).
            </p>

            <div className="space-y-3 pt-2">
              {trismusLogs.map((log, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{log.date}</span>
                    <span className="font-bold text-emerald-700">{log.openingMm} mm (Pain: {log.pain}/10)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min((log.openingMm / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Log Today's Measurement</h4>
            <form onSubmit={handleLogTrismus} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mouth Opening (mm)</label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  required
                  value={openingMm}
                  onChange={(e) => setOpeningMm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pain Level (0 to 10): {painLevel}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(e.target.value)}
                  className="w-full accent-emerald-600"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs"
              >
                {actionLoading ? t.appointmentLoading : 'Save Measurement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TABS FOR SCHEMES, CARETAKERS, DIET */}
      {activeSubTab === 'schemes' && <GovernmentSchemes />}
      {activeSubTab === 'caretakers' && <DayCareCaretaker />}
      {activeSubTab === 'diet' && <DietAndCessation />}

    </div>
  );
};
