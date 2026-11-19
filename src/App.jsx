import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { CancerHospitalsMap } from './components/CancerHospitalsMap';
import { OralDetection } from './components/OralDetection';
import { GovernmentSchemes } from './components/GovernmentSchemes';
import { DayCareCaretaker } from './components/DayCareCaretaker';
import { DietAndCessation } from './components/DietAndCessation';
import { HealthVault } from './components/HealthVault';
import { AuthModal } from './components/AuthModal';
import { LoaderModal } from './components/LoaderModal';
import { Footer } from './components/Footer';
import { PatientCareAssistant } from './components/PatientCareAssistant';
import { CaretakerDashboard } from './components/CaretakerDashboard';

const AppContent = () => {
  const { activeTab, user, workspaceLoading, workspaceError, t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Cancer Awareness Facts Dynamic Circular Loader */}
      <LoaderModal />

      {/* Clinical Hospital Navigation Bar */}
      <Navbar />

      {/* Dynamic View Area */}
      <main className="flex-1">
        {user?.isLoggedIn && workspaceLoading && (
          <p role="status" className="mx-auto max-w-7xl px-4 pt-4 text-xs text-slate-500">{t.apiLoading}</p>
        )}
        {user?.isLoggedIn && activeTab !== 'caretaker_portal' && workspaceError && (
          <p role="alert" className="mx-auto max-w-7xl px-4 pt-4 text-xs font-medium text-rose-700">
            {workspaceError || t.apiRetryError}
          </p>
        )}
        {activeTab === 'home' && <LandingHero />}
        {activeTab === 'patient_portal' && user?.role === 'patient' && <PatientDashboard />}
        {activeTab === 'patient_portal' && user?.role === 'doctor' && <DoctorDashboard />}
        {activeTab === 'doctor_portal' && user?.role === 'doctor' && <DoctorDashboard />}
        {activeTab === 'doctor_portal' && user?.role === 'patient' && <PatientDashboard />}
        {activeTab === 'caretaker_portal' && user?.role === 'caretaker' && <CaretakerDashboard />}
        {activeTab === 'hospitals' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Nearby Apex Cancer Hospitals & Google Maps Locator</h2>
            <CancerHospitalsMap />
          </div>
        )}
        {activeTab === 'schemes' && <GovernmentSchemes />}
        {activeTab === 'detect' && <OralDetection />}
        {activeTab === 'daycare' && <DayCareCaretaker />}
        {activeTab === 'diet' && <DietAndCessation />}
        {activeTab === 'vault' && <HealthVault />}
        {activeTab === 'doctor' && <DoctorDashboard />}
      </main>

      {/* Minimoth Authentication Modal */}
      <AuthModal />

      {/* Guided patient workflows and service shortcuts */}
      <PatientCareAssistant />

      {/* Hospital Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
