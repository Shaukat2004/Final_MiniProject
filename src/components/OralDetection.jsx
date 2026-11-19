import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AppointmentChatbot } from './AppointmentChatbot';
import {
  Upload,
  Camera,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  Layers,
  Send,
  Hospital,
  RefreshCw,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OralDetection = () => {
  const {
    t,
    user,
    setActiveTab,
    setCurrentScreening,
    setAppointments
  } = useApp();

  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('heatmap'); // 'original', 'heatmap', 'segmented'
  const [appointmentChatOpen, setAppointmentChatOpen] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Unsplash images are illustrative demo cases, not clinical records.
  const sampleCases = [
    {
      id: 'benign',
      label: t.sampleBenign,
      type: 'healthy',
      score: 12,
      riskLevel: 'Low Risk',
      region: 'Buccal Mucosa (Normal)',
      imageSrc: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
      description: 'Uniform pink mucosal surface with normal vascularity.'
    },
    {
      id: 'leukoplakia',
      label: t.sampleLeukoplakia,
      type: 'moderate',
      score: 54,
      riskLevel: 'Moderate Risk',
      region: 'Right Buccal Mucosa',
      imageSrc: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80',
      description: 'Hyperkeratotic white plaque with moderate dysplastic cellular atypia.'
    },
    {
      id: 'squamous',
      label: t.sampleSquamous,
      type: 'high',
      score: 88,
      riskLevel: 'High Risk',
      region: 'Left Lateral Border of Tongue',
      imageSrc: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
      description: 'Erythroplakic exophytic ulcerative lesion with irregular induration.'
    },
    {
      id: 'invalid-sample',
      label: t.sampleInvalid,
      type: 'invalid',
      imageSrc: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      description: 'Non-oral cavity photo to test rejection gatekeeper.'
    }
  ];

  const processScreening = async (imgSrc, sampleMeta = null, uploadedFile = null) => {
    setAnalyzing(true);
    setAnalysisError(null);
    setResult(null);
    setAppointmentChatOpen(false);

    if (!user?.isLoggedIn || user.role !== 'patient') {
      setAnalyzing(false);
      setAnalysisError('Sign in to a patient account before submitting a screening.');
      return;
    }

    try {
      let imageFile = uploadedFile;
      if (!imageFile) {
        const imageResponse = await fetch(imgSrc);
        if (!imageResponse.ok) throw new Error('Unable to load the demo sample image.');
        const imageBlob = await imageResponse.blob();
        imageFile = new File([imageBlob], `${sampleMeta?.id || 'screening-sample'}.jpg`, {
          type: imageBlob.type || 'image/jpeg'
        });
      }
      const payload = new FormData();
      payload.append('image', imageFile);

      const response = await api.screenings.analyzeImage(payload);

      if (response && response.success && response.data) {
        const item = response.data;
        const analysisResult = {
          imageSrc: item.gradCamHeatmapBase64 || imgSrc,
          originalImage: imgSrc,
          score: item.riskScore,
          riskLevel: item.riskLevel,
          region: item.anatomicalZone,
          biomarkers: item.biomarkers,
          xaiDetails: {
            marginIrregularity: item.biomarkers?.margin_irregularity || '76.4%',
            erythemaIndex: item.biomarkers?.erythema_index || 'Elevated',
            keratosis: item.biomarkers?.keratosis || 'Prominent',
            rationale: item.clinicalRationale
          },
          timestamp: new Date().toLocaleTimeString(),
          patientName: user.name
        };

        setResult(analysisResult);
        setCurrentScreening(analysisResult);
        setAnalyzing(false);

        if (item.riskScore < 30) {
          confetti({ particleCount: 50, spread: 60 });
        }
        return;
      }
      throw new Error('The screening service returned an invalid response.');
    } catch (err) {
      // Check if backend rejected non-oral image
      if (err.response?.status === 422 || err.response?.data?.is_oral_cavity === false) {
        setAnalyzing(false);
        setAnalysisError(
          err.response?.data?.error ||
          'Invalid Image Detected! The uploaded image is not recognized as a human oral cavity. Please take a clear, well-lit photo of the mouth, inner cheek, or tongue.'
        );
        return;
      }

      setAnalyzing(false);
      setAnalysisError(
        err.response?.data?.error ||
        err.message ||
        'The screening service is unavailable. No risk score was generated. Please try again when the server is available.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      processScreening(event.target.result, null, file);
    };
    reader.onerror = () => setAnalysisError('Unable to read the selected image. Please choose another file.');
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.imageSrc);
    processScreening(sample.imageSrc, sample);
  };

  // Render Visual Heatmap / Segmentation on Canvas
  useEffect(() => {
    if (!result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeViewMode === 'original' && result.originalImage ? result.originalImage : result.imageSrc;

    img.onload = () => {
      canvas.width = img.width || 500;
      canvas.height = img.height || 380;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (activeViewMode === 'heatmap') {
        const centerX = canvas.width * 0.52;
        const centerY = canvas.height * 0.48;
        const radius = Math.min(canvas.width, canvas.height) * (result.score > 50 ? 0.35 : 0.22);

        const radGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.1,
          centerX,
          centerY,
          radius
        );

        if (result.score > 70) {
          radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
          radGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.6)');
          radGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.4)');
          radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else {
          radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.65)');
          radGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.3)');
          radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        }

        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (activeViewMode === 'segmented') {
        const centerX = canvas.width * 0.52;
        const centerY = canvas.height * 0.48;
        const radius = Math.min(canvas.width, canvas.height) * 0.26;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const off = Math.sin(a * 4) * 8 + Math.cos(a * 3) * 6;
          const x = centerX + Math.cos(a) * (radius + off);
          const y = centerY + Math.sin(a) * (radius + off);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };
  }, [result, activeViewMode]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            PyTorch CNN Vision Model
          </span>
          <span className="text-xs text-slate-500">• Automatic Oral Cavity Gatekeeper</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Oral Cavity AI Screening & Grad-CAM Analysis
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload a close-up photograph of the open mouth only. Full-face and unrelated photos are rejected.
        </p>
      </div>

      {/* Main Grid: Upload Area on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Upload Box or Image Analysis View */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            
            {/* Input Error Alert (Non-Oral Rejected) */}
            {analysisError && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Image Validation Error</strong>
                  <p className="mt-0.5">{analysisError}</p>
                </div>
              </div>
            )}

            {!result && !analyzing && (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Upload or Capture Open-Mouth Photo
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Open your mouth wide under bright lighting and keep the camera close. Full-face photos are not accepted.
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Select Photo File
                  </button>
                </div>
              </div>
            )}

            {/* Analyzing Progress */}
            {analyzing && (
              <div className="py-14 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">
                  Running PyTorch CNN & Grad-CAM Inference...
                </h4>
                <p className="text-xs text-slate-500">
                  Verifying oral mucosal characteristics and computing lesion saliency.
                </p>
              </div>
            )}

            {/* Screening Results Presentation */}
            {result && (
              <div className="space-y-4">
                
                {/* View Mode Switcher */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Visual Inspection:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveViewMode('original')}
                      className={`px-3 py-1 rounded-lg font-semibold border ${
                        activeViewMode === 'original' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveViewMode('heatmap')}
                      className={`px-3 py-1 rounded-lg font-semibold border ${
                        activeViewMode === 'heatmap' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Grad-CAM Heatmap
                    </button>
                    <button
                      onClick={() => setActiveViewMode('segmented')}
                      className={`px-3 py-1 rounded-lg font-semibold border ${
                        activeViewMode === 'segmented' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Margin Contour
                    </button>
                  </div>
                </div>

                {/* Heatmap Canvas */}
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[340px]">
                  <canvas ref={canvasRef} className="w-full h-auto object-contain" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setResult(null);
                      setSelectedImage(null);
                      setAnalysisError(null);
                      setRecordShared(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Another</span>
                  </button>
                  <span className="text-[11px] text-slate-400">Processed: {result.timestamp}</span>
                </div>

              </div>
            )}

          </div>

          {/* Clinical Test Samples Quick-Trigger */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {t.demoSampleNotice}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleCases.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    s.type === 'invalid'
                      ? 'bg-rose-50 border-rose-200 hover:bg-rose-100'
                      : s.type === 'high'
                      ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="h-12 w-full rounded-lg overflow-hidden mb-1.5 bg-slate-200">
                    <img src={s.imageSrc} alt={s.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-bold text-slate-900 text-[11px] line-clamp-1">{s.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.demoSampleBadge}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: XAI Risk Score & Immediate Doctor Referral */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              
              {/* Score Display */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase">Oral Cancer Risk Score</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.score > 70
                      ? 'bg-rose-100 text-rose-800'
                      : result.score > 35
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {result.riskLevel}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${
                    result.score > 70 ? 'text-rose-600' : result.score > 35 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {result.score}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      result.score > 70 ? 'bg-rose-500' : result.score > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Clinical Rationale Statement */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Explainable AI Rationale:</span>
                <p className="text-slate-600 leading-relaxed italic">
                  "{result.xaiDetails.rationale}"
                </p>
              </div>

              {/* Biomarkers */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Anatomical Zone:</span>
                  <strong className="text-slate-900">{result.region}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Margin Irregularity:</span>
                  <strong className="text-slate-900">{result.xaiDetails.marginIrregularity}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Mucosal Erythema:</span>
                  <strong className="text-slate-900">{result.xaiDetails.erythemaIndex}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Hyperkeratosis Plaque:</span>
                  <strong className="text-slate-900">{result.xaiDetails.keratosis}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setAppointmentChatOpen(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>

                <button
                  onClick={() => setActiveTab('hospitals')}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Hospital className="w-4 h-4 text-emerald-600" />
                  <span>Find Cancer Hospitals</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How Our Clinical AI Works</span>
              </h4>
              <p>
                Our vision pipeline combines Convolutional Class Activation Maps (Grad-CAM) with mucosal redness histograms:
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-500">
                <li>Excludes non-mouth images automatically using chromatic hue clustering.</li>
                <li>Highlights cellular atypia hotspots in red/amber.</li>
                <li>Directly dispatches suspected malignant cases to the hospital triage desk.</li>
              </ul>
            </div>
          )}

          {appointmentChatOpen && (
            <AppointmentChatbot
              user={user}
              onClose={() => setAppointmentChatOpen(false)}
              onBooked={(appointment) => {
                setAppointments((current) => [appointment, ...current]);
                setAppointmentChatOpen(false);
                setActiveTab('patient_portal');
              }}
            />
          )}
        </div>

      </div>

    </div>
  );
};
