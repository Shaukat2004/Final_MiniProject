import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { getRandomFact } from '../data/cancerFacts';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('oncolink_lang') || 'en');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState(() => getRandomFact('en'));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState({ isLoggedIn: false });
  const [currentScreening, setCurrentScreening] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [assignedCaretakerBookings, setAssignedCaretakerBookings] = useState([]);
  const [trismusLogs, setTrismusLogs] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');

  useEffect(() => {
    localStorage.setItem('oncolink_lang', lang);
  }, [lang]);

  useEffect(() => {
    [
      'oncolink_user',
      'oncolink_referrals',
      'oncolink_appointments',
      'oncolink_medicines',
      'oncolink_caretakers',
      'oncolink_trismus'
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  const clearUserData = () => {
    setCurrentScreening(null);
    setReferrals([]);
    setAppointments([]);
    setMedicines([]);
    setCaretakers([]);
    setAssignedCaretakerBookings([]);
    setTrismusLogs([]);
    setWorkspaceError('');
    setWorkspaceLoading(false);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('oncolink_token');
      setUser({ isLoggedIn: false });
      setActiveTab('home');
      clearUserData();
    };
    window.addEventListener('oncolink:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('oncolink:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!user?.isLoggedIn || !user.id) {
      clearUserData();
      return undefined;
    }

    let active = true;
    const loadWorkspace = async () => {
      setWorkspaceLoading(true);
      setWorkspaceError('');
      try {
        if (user.role === 'doctor') {
          const response = await api.referrals.getAll();
          if (active) setReferrals(response.referrals || []);
        } else if (user.role === 'caretaker') {
          const response = await api.patient.getAssignedCaretakerBookings();
          if (active) setAssignedCaretakerBookings(response.bookings || []);
        } else {
          const [referralResponse, appointmentResponse, medicineResponse, trismusResponse, caretakerResponse] = await Promise.all([
            api.referrals.getMine(),
            api.appointments.getAll(user.id),
            api.patient.getMedicines(user.id),
            api.patient.getTrismus(user.id),
            api.patient.getCaretakers(user.id)
          ]);
          if (!active) return;
          setReferrals(referralResponse.referrals || []);
          setAppointments(appointmentResponse.appointments || []);
          setMedicines(medicineResponse.medicines || []);
          setTrismusLogs(trismusResponse.logs || []);
          setCaretakers(caretakerResponse.bookings || []);
        }
      } catch (error) {
        if (active) setWorkspaceError(error.response?.data?.error || 'Unable to load your records. Please try again.');
      } finally {
        if (active) setWorkspaceLoading(false);
      }
    };
    loadWorkspace();

    return () => {
      active = false;
    };
  }, [user?.isLoggedIn, user?.id, user?.role]);

  const triggerLoadingWithFact = (duration = 1000, onComplete) => {
    setCurrentFact(getRandomFact(lang));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onComplete) onComplete();
    }, duration);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    triggerLoadingWithFact(600);
  };

  const navigateTo = (tab) => {
    if (tab === activeTab) return;
    triggerLoadingWithFact(700, () => {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const t = translations[lang] || translations.en;

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang: changeLanguage,
        t,
        activeTab,
        setActiveTab: navigateTo,
        loading,
        currentFact,
        triggerLoadingWithFact,
        user,
        setUser,
        clearUserData,
        workspaceLoading,
        workspaceError,
        authModalOpen,
        setAuthModalOpen,
        currentScreening,
        setCurrentScreening,
        referrals,
        setReferrals,
        appointments,
        setAppointments,
        medicines,
        setMedicines,
        caretakers,
        setCaretakers,
        assignedCaretakerBookings,
        trismusLogs,
        setTrismusLogs
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
