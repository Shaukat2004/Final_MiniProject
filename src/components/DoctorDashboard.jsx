import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Eye,
  FileText,
  Calendar,
  Send,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  TrendingUp,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DoctorDashboard = () => {
  const { t, referrals, setReferrals, user } = useApp();

  const [selectedCase, setSelectedCase] = useState(referrals[0] || null);
  const [activeImageView, setActiveImageView] = useState('heatmap'); // 'original', 'heatmap'
  const [doctorNote, setDoctorNote] = useState('');
  const [prescription, setPrescription] = useState('');
  const [biopsySlotDate, setBiopsySlotDate] = useState('Tomorrow, 9:00 AM (Minor OT-3)');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchPatient, setSearchPatient] = useState('');
  const [savedAlert, setSavedAlert] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', email: '', phone: '', designation: '' });
  const [doctorMessage, setDoctorMessage] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState(false);
  const [caseImage, setCaseImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (!selectedCase && referrals.length) setSelectedCase(referrals[0]);
  }, [referrals, selectedCase]);

  const handleAddDoctor = async (event) => {
    event.preventDefault();
    setDoctorMessage('');
    setDoctorError(false);
    setDoctorLoading(true);
    try {
      await api.auth.addDoctor({ ...newDoctor, doctorCode: inviteCode });
      setDoctorMessage('Doctor invitation created successfully.');
      setNewDoctor({ name: '', email: '', phone: '', designation: '' });
      setInviteCode('');
    } catch (error) {
      setDoctorError(true);
      setDoctorMessage(error.response?.data?.error || 'Unable to add doctor.');
    } finally {
      setDoctorLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCase) {
      setDoctorNote(selectedCase.notes || '');
      setPrescription(selectedCase.doctorPrescription || '');
    }
  }, [selectedCase]);

  useEffect(() => {
    let active = true;
    let objectUrl;
    const source = selectedCase?.imageSrc;
    setCaseImage('');
    setImageError('');
    setImageLoading(false);
    if (!source) return () => { active = false; };

    const imageId = source.match(/\/api\/screenings\/image\/([^/?]+)/)?.[1];
    if (!imageId) {
      setCaseImage(source);
      return () => { active = false; };
    }

    setImageLoading(true);
    api.screenings.getImage(imageId).then((blob) => {
      if (active) {
        objectUrl = URL.createObjectURL(blob);
        setCaseImage(objectUrl);
      }
    }).catch((error) => {
      if (active) setImageError(error.response?.data?.error || 'Unable to load the authorized screening image.');
    }).finally(() => {
      if (active) setImageLoading(false);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedCase?.id, selectedCase?.imageSrc]);

  const handleSelectCase = (caseItem) => {
    setSelectedCase(caseItem);
    setDoctorNote(caseItem.notes || '');
    setPrescription(caseItem.doctorPrescription || '');
    setSavedAlert(false);
  };

  const handleApproveAndPrescribe = async (newStatus = 'Biopsy & OPD Confirmed') => {
    if (!selectedCase) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const response = await api.referrals.review(selectedCase.id, {
        status: newStatus,
        notes: doctorNote,
        doctorPrescription: prescription
      });
      const savedReferral = response.referral;
      setReferrals(referrals.map((referral) => referral.id === savedReferral.id ? savedReferral : referral));
      setSelectedCase(savedReferral);
      setSavedAlert(true);
      confetti({ particleCount: 40, spread: 50 });
      setTimeout(() => setSavedAlert(false), 4000);
    } catch (error) {
      setReviewError(error.response?.data?.error || t.doctorReviewError);
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    const matchesPriority = filterPriority === 'ALL' || r.triagePriority === filterPriority;
    const matchesSearch = r.patientName.toLowerCase().includes(searchPatient.toLowerCase()) ||
                          r.anatomicalRegion?.toLowerCase().includes(searchPatient.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Doctor & Hospital Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-bold text-xl">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{user?.name || t.doctorTitle}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {user?.designation || t.navDoctorPortal}
                </span>
              </div>
              {(user?.hospital || user?.specialty) && <p className="text-xs text-slate-600 mt-1">
                {[user.specialty, user.hospital].filter(Boolean).join(' • ')}
              </p>}
            </div>
          </div>

          {/* Department Triage KPIs */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[90px]">
              <span className="text-xl font-black text-slate-900">{referrals.length}</span>
              <span className="text-[10px] text-slate-500 block">Total In Queue</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center min-w-[90px]">
              <span className="text-xl font-black text-rose-700">
                {referrals.filter(r => r.riskScore > 70).length}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold block">Critical Biopsies</span>
            </div>
          </div>

        </div>
        <div className="mt-5 pt-5 border-t border-slate-100">
          <button onClick={() => setShowAddDoctor(!showAddDoctor)} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">{showAddDoctor ? 'Close doctor form' : 'Add doctor'}</button>
          {showAddDoctor && <form onSubmit={handleAddDoctor} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input required placeholder="Doctor name" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-xs" />
            <input required type="email" placeholder="Email" value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-xs" />
            <input placeholder="Phone" value={newDoctor.phone} onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-xs" />
            <input required type="password" placeholder="Doctor invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs" />
            <button type="submit" disabled={doctorLoading} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold disabled:opacity-50">{doctorLoading ? 'Creating...' : 'Create invitation'}</button>
            {doctorMessage && <p role={doctorError ? 'alert' : 'status'} className={`md:col-span-4 text-xs ${doctorError ? 'text-rose-700' : 'text-emerald-700'}`}>{doctorMessage}</p>}
          </form>}
        </div>
      </div>

      {/* Main Grid: Incoming Triage Queue (Left) & Clinical Inspection Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Incoming Referrals List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Incoming Triage Queue</span>
              </h3>
              <span className="text-xs text-slate-500">{filteredReferrals.length} Cases</span>
            </div>

            {/* Filter & Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  placeholder="Filter by patient name or region..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-1 text-[11px] font-semibold">
                {['ALL', 'URGENT', 'MODERATE', 'ROUTINE'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1 rounded-lg border transition-colors ${
                      filterPriority === p
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Cards Queue */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredReferrals.map((r) => {
                const isSelected = selectedCase?.id === r.id;
                const isCritical = r.riskScore > 70;
                const isModerate = r.riskScore > 35 && r.riskScore <= 70;

                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectCase(r)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-sm">{r.patientName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : isModerate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Score: {r.riskScore}/100
                      </span>
                    </div>

                    <div className="text-slate-600 space-y-0.5 text-[11px]">
                      <div>Location: <strong className="text-slate-800">{r.anatomicalRegion}</strong></div>
                      <div>Contact: {r.contact} • Age: {r.patientAge || 48}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">{r.id}</span>
                      <span className="font-semibold text-emerald-700">{r.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right: Detailed Clinical Inspection & Action Suite */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCase ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span>{selectedCase.patientName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Case: <strong>{selectedCase.id}</strong> • Ph: {selectedCase.contact} • Age: {selectedCase.patientAge || 48}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    selectedCase.riskScore > 70
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    AI Score: {selectedCase.riskScore}/100 ({selectedCase.riskLevel})
                  </span>
                </div>
              </div>

              {/* Clinical Image & PyTorch Grad-CAM Viewer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>Clinical Saliency Inspection</span>
                  </span>

                  <div className="flex gap-1 text-xs">
                    <button
                      onClick={() => setActiveImageView('original')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors border ${
                        activeImageView === 'original'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveImageView('heatmap')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors border ${
                        activeImageView === 'heatmap'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      PyTorch Grad-CAM Saliency
                    </button>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[320px]">
                  {imageLoading && <p role="status" className="p-6 text-xs text-white">{t.apiLoading}</p>}
                  {!imageLoading && caseImage && <img src={caseImage} alt="Patient screening" className="w-full h-[300px] object-cover" />}
                  {imageError && <p role="alert" className="p-6 text-xs text-rose-300">{imageError}</p>}
                  {activeImageView === 'heatmap' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/35 to-yellow-400/30 mix-blend-multiply pointer-events-none" />
                  )}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-800 font-semibold shadow-sm">
                    Anatomical Site: {selectedCase.anatomicalRegion}
                  </div>
                </div>
              </div>

              {/* Quantitative Biomarker Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 block">Margin Irregularity</span>
                  <span className="font-bold text-slate-900">76.4% (Indurated)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 block">Mucosal Erythema</span>
                  <span className="font-bold text-rose-700">Hypervascular</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 block">Hyperkeratosis</span>
                  <span className="font-bold text-amber-700">Prominent Plaque</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 block">Lesion Density</span>
                  <span className="font-bold text-slate-900">420 mm²</span>
                </div>
              </div>

              {/* Doctor's Action Console: Notes & Prescription */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Oncologist Clinical Impression & Suspected Staging
                  </label>
                  <textarea
                    rows={2}
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    placeholder="Enter clinical observations (e.g. Indurated ulcerative plaque T1N0 along left lateral tongue border)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Digital Prescription & Care Protocol
                  </label>
                  <textarea
                    rows={2}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="e.g. Chlorhexidine 0.2% oral rinse 10ml twice daily; Vitamin B-Complex; Avoid spicy foods..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Biopsy Approval Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Biopsy / OPD Slot</label>
                    <select
                      value={biopsySlotDate}
                      onChange={(e) => setBiopsySlotDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="Tomorrow, 9:00 AM (Minor OT-3)">Tomorrow, 9:00 AM (Minor OT-3)</option>
                      <option value="Thursday, 10:30 AM (OPD Clinic)">Thursday, 10:30 AM (OPD Clinic)</option>
                      <option value="Friday, 2:00 PM (Biopsy Room 4)">Friday, 2:00 PM (Biopsy Room 4)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleApproveAndPrescribe('Chairside Biopsy Approved')}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Biopsy & Send to Patient</span>
                    </button>
                  </div>
                </div>

                {savedAlert && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Clinical report, biopsy confirmation, and prescription synchronized with patient's portal!</span>
                  </div>
                )}
                {reviewError && <p role="alert" className="text-xs font-semibold text-rose-700">{reviewError}</p>}
                <button
                  type="button"
                  disabled={reviewLoading}
                  onClick={() => handleApproveAndPrescribe(selectedCase.status || 'Doctor Reviewing')}
                  className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-700 disabled:opacity-50 font-bold text-xs"
                >
                  {reviewLoading ? t.doctorReviewSaving : 'Save clinical review'}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
              Select a patient from the triage queue to inspect clinical image and issue prescription.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
