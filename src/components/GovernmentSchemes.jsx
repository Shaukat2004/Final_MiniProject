import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { governmentSchemes } from '../data/governmentSchemes';
import {
  BookOpen,
  CheckCircle2,
  Phone,
  ExternalLink,
  Search,
  CreditCard
} from 'lucide-react';

export const GovernmentSchemes = () => {
  const { t, lang } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Eligibility Calculator
  const [userState, setUserState] = useState('Maharashtra');
  const [userIncome, setUserIncome] = useState('< 2.5 Lakhs');
  const [rationCard, setRationCard] = useState('Yellow / Orange (BPL/Priority)');
  const [calculatedEntitlement, setCalculatedEntitlement] = useState(null);

  const handleCheckEligibility = (e) => {
    e.preventDefault();
    if (rationCard.includes('Yellow') || rationCard.includes('Orange') || userIncome === '< 2.5 Lakhs') {
      setCalculatedEntitlement({
        primaryScheme: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY) & PM-JAY",
        maxCoverage: "₹5,00,000 / year (100% Cashless Surgery + Chemo + Radiation)",
        additionalGrant: "Eligible for Rashtriya Arogya Nidhi (Up to ₹15 Lakhs at Tata Memorial Hospital)",
        trainConcession: "100% Railway Fare Exemption for Patient + 75% for Attendant"
      });
    } else {
      setCalculatedEntitlement({
        primaryScheme: "State & Regional Cancer Centre Discretionary Fund / PMNRF",
        maxCoverage: "Up to ₹3,00,000 Financial Grant + 100% Railway Concession",
        additionalGrant: "Eligible for Indian Cancer Society Rehabilitation Grant",
        trainConcession: "100% Free Travel for Medical Consultations"
      });
    }
  };

  const filteredSchemes = governmentSchemes.filter((scheme) => {
    const schemeName = scheme.name[lang] || scheme.name.en;
    const matchesSearch = schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scheme.benefits[lang]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scheme.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Government Cancer Financial Schemes & Grants
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Avail cashless oncological surgeries, radiotherapy, and targeted medicines up to ₹15 Lakhs.
        </p>
      </div>

      {/* Coverage Calculator */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>Instant Coverage Calculator</span>
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Check Your Free Treatment Entitlement
            </h3>
            <p className="text-xs text-slate-500">
              Select your state and ration card to calculate your total cashless allowance.
            </p>
          </div>

          <form onSubmit={handleCheckEligibility} className="w-full lg:w-auto flex flex-wrap gap-2.5 items-center">
            <select
              value={userState}
              onChange={(e) => setUserState(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
            >
              <option value="Maharashtra">Maharashtra</option>
              <option value="Other States">Other States</option>
            </select>

            <select
              value={rationCard}
              onChange={(e) => setRationCard(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
            >
              <option value="Yellow / Orange (BPL/Priority)">Yellow / Orange (Priority Card)</option>
              <option value="Antyodaya Anna (AAY)">Antyodaya Card (AAY)</option>
              <option value="White / Above Poverty">White Card / General</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
            >
              Calculate Entitlement
            </button>
          </form>
        </div>

        {calculatedEntitlement && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 block">Primary Cashless Scheme</span>
              <p className="font-bold text-slate-900 mt-1">{calculatedEntitlement.primaryScheme}</p>
              <span className="text-[11px] text-emerald-700 block mt-0.5">{calculatedEntitlement.maxCoverage}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="font-bold text-amber-800 block">Specialty Hospital Grant</span>
              <p className="font-bold text-slate-900 mt-1">{calculatedEntitlement.additionalGrant}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
              <span className="font-bold text-blue-800 block">Railway Travel Concession</span>
              <p className="font-bold text-slate-900 mt-1">{calculatedEntitlement.trainConcession}</p>
            </div>
          </div>
        )}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {scheme.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {scheme.name[lang] || scheme.name.en}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-emerald-700">{scheme.coverage}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <strong>Covered Procedures: </strong>
                {scheme.benefits[lang] || scheme.benefits.en}
              </div>

              <div className="text-xs text-slate-600">
                <strong>Eligibility: </strong>
                {scheme.eligibility[lang] || scheme.eligibility.en}
              </div>

              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Required Documents:</span>
                <div className="flex flex-wrap gap-1">
                  {scheme.documents.map((doc, dIdx) => (
                    <span key={dIdx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                      • {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Helpline: <strong>{scheme.helpline}</strong></span>
              </div>

              <a
                href={scheme.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
