import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { toIsoDateTime, toLocalDateTimeInput } from '../utils/dateTime';
import {
  HeartHandshake,
  Hospital,
  Home,
  CheckCircle2,
  Star,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DayCareCaretaker = () => {
  const { t, user, caretakers, setCaretakers } = useApp();

  const [serviceType, setServiceType] = useState('hospital'); // 'hospital' or 'home'
  const [selectedShift, setSelectedShift] = useState('8h');
  const [specialNeed, setSpecialNeed] = useState("Ryle's Feeding Tube & Oral Care");
  const [startAt, setStartAt] = useState(() => toLocalDateTimeInput());
  const [locationAddress, setLocationAddress] = useState(
    serviceType === 'hospital' ? 'Tata Memorial Hospital, Parel' : 'Dadar West, Mumbai'
  );
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const caretakersRoster = [
    {
      id: 'CT-1',
      name: 'Sunita Patil, GNM',
      role: 'Certified Oncology Nurse',
      experience: '9 years at Tata Memorial & Kokilaben',
      rating: 4.9,
      reviews: 148,
      languages: ['Marathi', 'Hindi', 'English'],
      skills: ['Ryle\'s Feeding Tube', 'Tracheostomy Care', 'Wound Dressing', 'Vitals'],
      basePrice: 950,
      verified: true
    },
    {
      id: 'CT-2',
      name: 'Rajesh Solanki',
      role: 'Senior Hospital Patient Attendant',
      experience: '7 years specialized oncology companion care',
      rating: 4.8,
      reviews: 92,
      languages: ['Hindi', 'Marathi', 'Gujarati'],
      skills: ['Chemotherapy Companion', 'Wheelchair Transfer', 'Oral Hygiene'],
      basePrice: 800,
      verified: true
    },
    {
      id: 'CT-3',
      name: 'Anjali Waghmare, ANM',
      role: 'Home Palliative & Post-Op Specialist',
      experience: '11 years home care for oral cancer patients',
      rating: 5.0,
      reviews: 210,
      languages: ['Marathi', 'Hindi'],
      skills: ['Jaw Therapy Aid', 'Medication Management', 'Tube Nutrition'],
      basePrice: 1100,
      verified: true
    }
  ];

  const getPrice = (caretaker) => caretaker.basePrice * (selectedShift === '24h' ? 3 : selectedShift === '12h' ? 1.5 : 1);

  const handleBookCaretaker = async (caretaker) => {
    if (!user?.id) {
      setBookingError(t.caretakerSignInRequired);
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const response = await api.patient.bookCaretaker({
        patientId: user.id,
        caretakerProfileId: caretaker.id,
        caretakerName: caretaker.name,
        role: caretaker.role,
        serviceType: serviceType === 'hospital' ? 'In-Hospital Bedside Care' : 'At-Home Palliative Care',
        location: locationAddress,
        shift: selectedShift === '24h' ? '24 Hours Full Day' : selectedShift === '12h' ? '12 Hours Day/Night' : '8 Hours Day Shift',
        startAt: toIsoDateTime(startAt),
        estimatedPrice: getPrice(caretaker),
        specialNeed
      });
      setCaretakers([response.booking, ...caretakers]);
      setBookingConfirmed(true);
      confetti({ particleCount: 40, spread: 50 });
      setTimeout(() => setBookingConfirmed(false), 5000);
    } catch (error) {
      setBookingError(error.response?.data?.error || error.message || t.caretakerBookingError);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <HeartHandshake className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t.caretakerTitle}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {t.caretakerSubtitle}
        </p>
      </div>

      {/* Choice: Hospital vs Home */}
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => {
            setServiceType('hospital');
            setLocationAddress('Tata Memorial Hospital, Parel');
          }}
          className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
            serviceType === 'hospital'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Hospital className="w-4 h-4 text-emerald-600" />
          <span>{t.inHospitalTab}</span>
        </button>

        <button
          onClick={() => {
            setServiceType('home');
            setLocationAddress('Dadar West, Mumbai');
          }}
          className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
            serviceType === 'home'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4 text-indigo-600" />
          <span>{t.atHomeTab}</span>
        </button>
      </div>

      {/* Booking Form Config */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {t.caretakerConfigure}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {serviceType === 'hospital' ? t.caretakerHospitalAddress : t.caretakerHomeAddress}
            </label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">{t.caretakerShiftDuration}</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
            >
              <option value="8h">{t.caretakerShift8}</option>
              <option value="12h">{t.caretakerShift12}</option>
              <option value="24h">{t.caretakerShift24}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">{t.caretakerSpecialNeed}</label>
            <select
              value={specialNeed}
              onChange={(e) => setSpecialNeed(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
            >
              <option value="Ryle's Feeding Tube & Oral Care">{t.caretakerNeedFeeding}</option>
              <option value="Tracheostomy Suctioning & Hygiene">{t.caretakerNeedTracheostomy}</option>
              <option value="Post-Chemotherapy Companion">{t.caretakerNeedChemo}</option>
              <option value="General Bedside & Mobility">{t.caretakerNeedGeneral}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">{t.caretakerStartDateTime}</label>
            <input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none" />
          </div>
        </div>

        {bookingConfirmed && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t.caretakerBookedMessage}</span>
          </div>
        )}
        {bookingError && <p role="alert" className="text-xs font-semibold text-rose-700">{bookingError}</p>}
      </div>

      {/* Roster Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{t.caretakerDemoRoster}</h3>
          <p className="text-xs text-slate-500">{t.caretakerDemoRosterNote}</p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caretakersRoster.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                  <span className="text-xs text-indigo-700 font-semibold">{c.role}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold text-amber-700 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>{c.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">{c.experience}</p>

              <div className="text-[11px] text-slate-600">
                <strong>Languages: </strong>{c.languages.join(', ')}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Core Oncology Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {c.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                      • {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{t.caretakerEstimatedPrice}: ₹{getPrice(c).toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-400">{t.caretakerDemoPricing}</span>
              </div>

              <button
                onClick={() => handleBookCaretaker(c)}
                disabled={bookingLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors"
              >
                {bookingLoading ? t.caretakerBooking : t.bookCaretakerBtn}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
    </div>
  );
};
