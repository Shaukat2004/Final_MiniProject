import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  MapPin,
  Navigation,
  Phone,
  Star,
  Hospital,
  Search,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Compass,
  ArrowRight,
  Layers
} from 'lucide-react';

export const CancerHospitalsMap = ({ onBookHospital }) => {
  const { t } = useApp();
  const [hospitals, setHospitals] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalError, setHospitalError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapType, setMapType] = useState('m'); // 'm' for standard roadmap, 'k' for satellite

  // Fetch Hospitals with Live GPS Coordinates
  const fetchHospitals = async (lat = null, lng = null, query = '') => {
    setLoadingHospitals(true);
    setHospitalError('');
    try {
      const data = await api.hospitals.getNearby(lat, lng, query);
      if (data?.hospitals) {
        setHospitals(data.hospitals);
        if (!selectedHospital && data.hospitals.length > 0) {
          setSelectedHospital(data.hospitals[0]);
        }
      }
    } catch (error) {
      setHospitalError(error.response?.data?.error || 'Unable to load hospitals. Please try again.');
    } finally {
      setLoadingHospitals(false);
    }
  };

  // Live Browser GPS Geolocation
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingCoords(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLoadingCoords(false);
        fetchHospitals(latitude, longitude, searchQuery);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLoadingCoords(false);
        fetchHospitals(19.0044, 72.8428, searchQuery);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    // Prefer the user's current browser location; only use Mumbai as a non-sensitive fallback when permission is denied.
    handleGetLiveLocation();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals(userCoords?.lat, userCoords?.lng, searchQuery);
  };

  // Construct Real Google Maps Embed URL
  const getGoogleMapsEmbedUrl = () => {
    if (selectedHospital) {
      const query = encodeURIComponent(`${selectedHospital.name}, ${selectedHospital.address}`);
      return `https://maps.google.com/maps?q=${query}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    const defaultQuery = encodeURIComponent('Tata Memorial Hospital Parel Mumbai cancer hospitals');
    return `https://maps.google.com/maps?q=${defaultQuery}&t=${mapType}&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & GPS Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cancer hospital, city or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </form>

        {/* GPS Geolocation Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleGetLiveLocation}
            disabled={loadingCoords || loadingHospitals}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Compass className={`w-4 h-4 text-emerald-600 ${loadingCoords ? 'animate-spin' : ''}`} />
            <span>{loadingCoords ? 'Detecting GPS...' : loadingHospitals ? t.apiLoading : 'Use My Live GPS Location'}</span>
          </button>

          {userCoords && (
            <span className="text-[11px] text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
              GPS Active
            </span>
          )}
        </div>
        {hospitalError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">{hospitalError}</p>}

      </div>

      {/* Real Google Maps & Hospital List Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Google Maps Embed */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Real Google Maps Cancer Hospital Satellite / Street View</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMapType('m')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  mapType === 'm' ? 'bg-white text-emerald-700 border-slate-300 shadow-xs' : 'text-slate-500 border-transparent'
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setMapType('k')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  mapType === 'k' ? 'bg-white text-emerald-700 border-slate-300 shadow-xs' : 'text-slate-500 border-transparent'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          <div className="w-full h-[440px] bg-slate-100 relative">
            <iframe
              title="Google Maps Cancer Hospitals"
              src={getGoogleMapsEmbedUrl()}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>

        {/* Hospital Card Details */}
        <div className="lg:col-span-5 space-y-4">
          {selectedHospital ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedHospital.distance}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedHospital.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedHospital.address}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-700 text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>{selectedHospital.rating}</span>
                </div>
              </div>

              {/* Doctors & Bed Availability */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="text-slate-700 font-semibold">Specialists:</div>
                {selectedHospital.doctors?.map((d, i) => (
                  <div key={i} className="text-slate-600">
                    • <strong>{d.name}</strong> ({d.role}) — <span className="text-emerald-600">{d.available}</span>
                  </div>
                ))}
                <div className="pt-1 text-[11px] text-slate-500">
                  Available Surgical Beds: <strong className="text-emerald-700">{selectedHospital.bedsAvailable}</strong>
                </div>
              </div>

              {/* Empanelled Schemes */}
              <div className="flex flex-wrap gap-1">
                {selectedHospital.governmentEmpanelled?.map((scheme, sIdx) => (
                  <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {scheme}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={selectedHospital.googleMapsNavigationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {onBookHospital && (
                  <button
                    onClick={() => onBookHospital(selectedHospital)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              Select a hospital to view route directions and oncologists.
            </div>
          )}

          {/* Quick Hospital List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Empanelled Cancer Centers
            </span>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {loadingHospitals && <p role="status" className="text-xs text-slate-500">{t.apiLoading}</p>}
              {!loadingHospitals && hospitals.length === 0 && !hospitalError && <p className="text-xs text-slate-500">{t.apiRetryError}</p>}
              {hospitals.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedHospital(h)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedHospital?.id === h.id
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{h.name}</h5>
                    <span className="text-slate-500 text-[11px]">{h.city}</span>
                  </div>
                  <span className="font-semibold text-emerald-700 text-[11px] shrink-0">
                    {h.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
