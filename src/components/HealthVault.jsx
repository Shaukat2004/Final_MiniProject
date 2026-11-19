import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { formatDateTime, toIsoDateTime, toLocalDateTimeInput } from '../utils/dateTime';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Bell,
  Plus,
  Trash2,
  Activity,
  FileText,
  AlertCircle,
  TrendingUp,
  Stethoscope,
  Hospital,
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HealthVault = () => {
  const {
    t,
    user,
    medicines,
    setMedicines,
    appointments,
    setAppointments,
    trismusLogs,
    setTrismusLogs,
    currentScreening,
    referrals,
    workspaceLoading
  } = useApp();

  const [activeTab, setActiveTab] = useState('medicines'); // 'medicines', 'appointments', 'tracker', 'records'

  // Add Medicine Form
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTiming, setNewMedTiming] = useState('Morning (8:00 AM)');

  // Trismus Log Form
  const [newOpeningMm, setNewOpeningMm] = useState('38');
  const [newPainScore, setNewPainScore] = useState('2');

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDateSlot, setNewDateSlot] = useState(() => toLocalDateTimeInput());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const toggleMedicineTaken = async (id) => {
    setActionLoading(true);
    setActionError('');
    try {
      const { medicine } = await api.patient.toggleMedicine(id);
      setMedicines((current) => current.map((item) => String(item.id) === String(id) ? medicine : item));
      if (medicine.taken) confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to update this medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setActionLoading(true);
    setActionError('');
    try {
      const response = await api.patient.addMedicine({
        patientId: user.id,
        name: newMedName,
        dosage: newMedDosage || '1 dose',
        timing: newMedTiming
      });
      setMedicines((current) => [...current, response.medicine]);
      setNewMedName('');
      setNewMedDosage('');
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to save this medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.patient.deleteMedicine(id);
      setMedicines((current) => current.filter((medicine) => String(medicine.id) !== String(id)));
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to remove this medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTrismusLog = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      const response = await api.patient.logTrismus({
        patientId: user.id,
        date: new Date().toLocaleDateString(),
        openingMm: parseInt(newOpeningMm, 10),
        pain: parseInt(newPainScore, 10)
      });
      setTrismusLogs((current) => [...current, response.log]);
      confetti({ particleCount: 50, spread: 60 });
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to save this measurement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget) return;
    setActionLoading(true);
    setActionError('');
    try {
      const response = await api.appointments.reschedule(rescheduleTarget.id, toIsoDateTime(newDateSlot));
      setAppointments((current) => current.map((appointment) => appointment.id === response.appointment.id ? response.appointment : appointment));
      setRescheduleTarget(null);
      confetti({ particleCount: 40, spread: 50 });
    } catch (error) {
      setActionError(error.response?.data?.error || error.message || 'Unable to reschedule this appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {workspaceLoading && <p role="status" className="mb-4 text-center text-xs text-emerald-300">{t.apiLoading}</p>}
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{actionError}</p>}
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
          <Calendar className="w-4 h-4" />
          <span>Patient Health Vault & Smart Reminders</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.recordsTitle}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2">
          {t.recordsSubtitle}
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'medicines'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t.medicineTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'appointments'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.appointmentsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'tracker'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.symptomTrackerTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'records'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Clinical Documents</span>
        </button>
      </div>

      {/* SUB-TAB 1: MEDICINE REMINDERS */}
      {activeTab === 'medicines' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Today's Prescribed Regimen</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {medicines.filter((m) => m.taken).length} / {medicines.length} Taken
                </span>
              </div>

              <div className="space-y-3">
                {workspaceLoading && medicines.length === 0 && <p className="text-xs text-slate-400">{t.apiLoading}</p>}
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      med.taken
                        ? 'bg-emerald-950/20 border-emerald-500/40 opacity-80'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMedicineTaken(med.id)}
                        disabled={actionLoading}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          med.taken
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-600 hover:border-emerald-400'
                        }`}
                      >
                        {med.taken && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <h4 className={`text-sm font-bold ${med.taken ? 'line-through text-slate-400' : 'text-white'}`}>
                          {med.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{med.dosage}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">{med.timing}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMedicine(med.id)}
                      disabled={actionLoading}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Medicine Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleAddMedicine} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{t.addMedicineBtn}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Chlorhexidine Mouthwash"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dosage & Instructions</label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g. 10ml rinse for 60s"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Timing</label>
                <select
                  value={newMedTiming}
                  onChange={(e) => setNewMedTiming(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                >
                  <option value="Morning (8:00 AM)" className="bg-slate-900">Morning (8:00 AM)</option>
                  <option value="Afternoon (1:00 PM)" className="bg-slate-900">Afternoon (1:00 PM)</option>
                  <option value="Evening (5:00 PM)" className="bg-slate-900">Evening (5:00 PM)</option>
                  <option value="Night (9:00 PM)" className="bg-slate-900">Night (9:00 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{actionLoading ? t.appointmentLoading : 'Save Reminder'}</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: APPOINTMENTS & RESCHEDULING */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {apt.status}
                      </span>
                      <h4 className="text-lg font-black text-white mt-2">{apt.hospitalName}</h4>
                      <p className="text-xs text-emerald-400 font-semibold">{apt.doctorName} • {apt.specialty}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{apt.id}</span>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{formatDateTime(apt.date)}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Reason: {apt.type} | Booked via: {apt.bookedVia}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setRescheduleTarget(apt);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reschedule Slot</span>
                  </button>

                  <a
                    href="tel:1800221952"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40"
                  >
                    Call Hospital Desk
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Reschedule Modal */}
          {rescheduleTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <h3 className="text-base font-black text-white">Reschedule Appointment</h3>
                <p className="text-xs text-slate-400">
                  Select a new available consultation window for {rescheduleTarget.doctorName} at {rescheduleTarget.hospitalName}.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select New OPD Slot</label>
                  <input
                    type="datetime-local"
                    value={newDateSlot}
                    onChange={(e) => setNewDateSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleConfirmReschedule}
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                  >
                    {actionLoading ? t.appointmentLoading : 'Confirm New Time'}
                  </button>
                  <button
                    onClick={() => setRescheduleTarget(null)}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: TRISMUS & SYMPTOM HEALTH TRACKER */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>{t.mouthOpeningTracker}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trismus (restricted jaw opening) is a key indicator of Oral Submucous Fibrosis (OSF) and post-radiation fibrotic progression. Normal opening is 35–45 mm (3 finger-breadths).
                </p>
              </div>

              {/* Progress Bar Trend Visualizer */}
              <div className="space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400">7-Day Mouth Opening Trajectory</span>
                
                <div className="space-y-3 pt-2">
                  {trismusLogs.slice(-6).map((log, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">{log.date}</span>
                        <span className="font-mono font-bold text-emerald-400">{log.openingMm} mm (Pain: {log.pain}/10)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((log.openingMm / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Record Daily Measurement Form */}
          <div className="lg:col-span-4">
            <form onSubmit={handleAddTrismusLog} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Log Today's Measurements</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mouth Opening (mm or ruler scale)
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  required
                  value={newOpeningMm}
                  onChange={(e) => setNewOpeningMm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Healthy target: 35mm - 45mm</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Oral Pain Level (1 to 10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newPainScore}
                  onChange={(e) => setNewPainScore(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>0 (No Pain)</span>
                  <span className="font-bold text-white">Score: {newPainScore}/10</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md transition-all"
              >
                {actionLoading ? t.appointmentLoading : 'Save Daily Log'}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: CLINICAL DOCUMENTS */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Diagnostic Reports & Doctor Prescriptions</span>
            </h3>

            <div className="space-y-3">
              {workspaceLoading && referrals.length === 0 && <p className="text-xs text-slate-400">{t.apiLoading}</p>}
              {!workspaceLoading && referrals.length === 0 && <p className="text-xs text-slate-400">{t.patientReviewEmpty}</p>}
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{ref.hospitalName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {ref.status}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400">Assigned Oncologist: {ref.doctorName}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      <strong>Clinical notes:</strong> {ref.notes || t.patientReviewEmpty}
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      <strong>Prescription:</strong> {ref.doctorPrescription || 'Awaiting prescription.'}
                    </p>
                    <span className="text-[11px] text-slate-500 block">Logged: {ref.timestamp}</span>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Downloading PDF Clinical Slip for ${ref.id}...\nIncludes original mouth photo, Grad-CAM heatmap, and Doctor notes.`);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Clinical PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
