import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { oralCancerDiets } from '../data/dietPlans';
import { cessationTips } from '../data/cessationTips';
import {
  Utensils,
  Flame,
  AlertTriangle,
  Phone,
  CheckCircle2,
  X,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DietAndCessation = () => {
  const { lang, currentScreening } = useApp();

  const [activeMainTab, setActiveMainTab] = useState('diet');
  const [selectedStage, setSelectedStage] = useState(
    currentScreening?.score > 70 ? 'stageHigh' : currentScreening?.score > 35 ? 'stageModerate' : 'stageLow'
  );

  // Tobacco Cessation
  const [cleanDays, setCleanDays] = useState(14);
  const [dailyPouchCost, setDailyPouchCost] = useState(50);
  const [showSosModal, setShowSosModal] = useState(false);
  const [breathingStep, setBreathingStep] = useState('Inhale Slowly (4s)');
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  useEffect(() => {
    let interval;
    if (showSosModal) {
      interval = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            setBreathingStep((s) =>
              s.includes('Inhale') ? 'Hold Breath (4s)' : s.includes('Hold') ? 'Exhale Gently (6s)' : 'Inhale Slowly (4s)'
            );
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSosModal]);

  const activeDiet = oralCancerDiets[selectedStage] || oralCancerDiets.stageLow;
  const totalSaved = cleanDays * dailyPouchCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Utensils className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Clinical Nutrition & Tobacco Cessation
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Soft, non-spicy dysphagia-safe meals and evidence-based gutkha/smoking de-addiction system.
        </p>
      </div>

      {/* Switcher */}
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveMainTab('diet')}
          className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
            activeMainTab === 'diet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-4 h-4 text-emerald-600" />
          <span>Clinical Diet Plans</span>
        </button>

        <button
          onClick={() => setActiveMainTab('cessation')}
          className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
            activeMainTab === 'cessation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-600" />
          <span>Quit Tobacco & Gutkha</span>
        </button>
      </div>

      {activeMainTab === 'diet' ? (
        <div className="space-y-6">
          {/* Stage Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedStage('stageLow')}
              className={`p-5 rounded-2xl border text-left transition-colors ${
                selectedStage === 'stageLow' ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                Low Risk / Prevention
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Mucosal Cell Repair</h4>
              <p className="text-xs text-slate-500 mt-1">Antioxidants, Lycopene, Green tea polyphenols.</p>
            </button>

            <button
              onClick={() => setSelectedStage('stageModerate')}
              className={`p-5 rounded-2xl border text-left transition-colors ${
                selectedStage === 'stageModerate' ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                Moderate / Leukoplakia
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Soothing & Non-Spicy</h4>
              <p className="text-xs text-slate-500 mt-1">Soft khichdi, curds, coconut water.</p>
            </button>

            <button
              onClick={() => setSelectedStage('stageHigh')}
              className={`p-5 rounded-2xl border text-left transition-colors ${
                selectedStage === 'stageHigh' ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                High Risk / Radiation / Surgery
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">Pureed & Dysphagia Care</h4>
              <p className="text-xs text-slate-500 mt-1">High-protein shakes, purees, xerostomia sprays.</p>
            </button>
          </div>

          {/* Active Diet Details */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-700 uppercase">{activeDiet.badge}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{activeDiet.category}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeDiet.summary[lang] || activeDiet.summary.en}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDiet.recommendations.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</h5>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.timing}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.why}</p>
                </div>
              ))}
            </div>

            {/* Forbidden foods */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Strictly Prohibited Foods for Oral Mucosa:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeDiet.foodsToAvoid.map((food, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TOBACCO CESSATION */
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Tobacco & Gutkha Free Journey
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                You Have Been Clean for <span className="text-emerald-700">{cleanDays} Days</span>!
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Every gutkha/smoke-free day allows mucosal epithelial cells to regenerate and reduces oral cancer transformation risk.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowSosModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>Craving SOS: Calm My Urge</span>
                </button>
                <a
                  href="tel:1800112356"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quitline: 1800-11-2356</span>
                </a>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 min-w-[200px]">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Financial Savings</span>
              </span>
              <div className="text-2xl font-black text-amber-700">₹{totalSaved} Saved</div>
              <p className="text-[11px] text-slate-500">Based on ₹{dailyPouchCost}/day saved.</p>
              <button
                onClick={() => setCleanDays(cleanDays + 1)}
                className="w-full py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs"
              >
                +1 Day Clean Milestone
              </button>
            </div>
          </div>

          {/* 4-D Urge Defeating Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">The Evidence-Based 4-D Urge Technique</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cessationTips.fourDs.map((d, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h5 className="font-bold text-emerald-700 text-xs">{d.title}</h5>
                  <p className="text-xs text-slate-600">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative space-y-4 border border-slate-200">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold uppercase text-rose-700">Craving SOS: 3-Minute Calm</span>
            <h3 className="text-lg font-bold text-slate-900">Breathe Through the Urge</h3>

            <div className="w-32 h-32 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">{breathingStep}</span>
              <span className="text-2xl font-black text-emerald-700 mt-1">{breathingSeconds}s</span>
            </div>

            <p className="text-xs text-slate-600">
              "Nicotine cravings crest and fade within 3-5 minutes. Take deep diaphragmatic breaths."
            </p>

            <button
              onClick={() => {
                setShowSosModal(false);
                confetti({ particleCount: 40, spread: 50 });
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Urge Passed! I Won
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
