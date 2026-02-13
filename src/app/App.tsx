import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { RoleSelector } from './components/RoleSelector';
import { ReceptionistDashboard } from './components/ReceptionistDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AddPatient } from './components/AddPatient';
import { BookAppointment } from './components/BookAppointment';
import { PatientDetails } from './components/PatientDetails';
import { UserRole } from './types';
import { Button } from './components/ui/button';
import { LogOut } from 'lucide-react';

type View = 'login' | 'roleSelector' | 'dashboard' | 'addPatient' | 'bookAppointment' | 'patientDetails';

function AppContent() {
  const { currentRole, setCurrentRole, clearUserData } = useApp();
  const [currentView, setCurrentView] = useState<View>('login');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });
  
  // Set initial view based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, [isAuthenticated]);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentView('dashboard');
  };

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('login');
    clearUserData();
  };

  const handleAddPatient = () => {
    setCurrentView('addPatient');
  };

  const handleBookAppointment = () => {
    setCurrentView('bookAppointment');
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('patientDetails');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedPatientId(null);
  };

  const handlePatientSaved = () => {
    setCurrentView('dashboard');
  };

  const handleAppointmentBooked = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="relative">
      {/* Logout Button - Only show when authenticated and not on login screen */}
      {isAuthenticated && currentView !== 'login' && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleLogout}
            variant="outline"
            style={{
              borderRadius: 'var(--radius-button)',
              backgroundColor: 'var(--card)',
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {currentView === 'roleSelector' && (
        <RoleSelector onSelectRole={handleSelectRole} />
      )}

      {currentView === 'dashboard' && currentRole === 'receptionist' && (
        <ReceptionistDashboard
          onAddPatient={handleAddPatient}
          onViewPatient={handleViewPatient}
          onBookAppointment={handleBookAppointment}
        />
      )}

      {currentView === 'dashboard' && currentRole === 'doctor' && (
        <DoctorDashboard onViewPatient={handleViewPatient} />
      )}

      {currentView === 'addPatient' && (
        <AddPatient
          onBack={handleBackToDashboard}
          onSave={handlePatientSaved}
        />
      )}

      {currentView === 'bookAppointment' && (
        <BookAppointment
          onBack={handleBackToDashboard}
          onSuccess={handleAppointmentBooked}
        />
      )}

      {currentView === 'patientDetails' && selectedPatientId && (
        <PatientDetails
          patientId={selectedPatientId}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}