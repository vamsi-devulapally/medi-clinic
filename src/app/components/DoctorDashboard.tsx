import React, { useState } from 'react';
import { Calendar, UserCheck, UserPlus } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentCalendar } from './AppointmentCalendar';
import { useApp } from '../context/AppContext';
import { Patient, Appointment } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DoctorDashboardProps {
  onViewPatient: (patientId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onViewPatient }) => {
  const { appointments, deleteAppointment, updateAppointment, patients } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const todayAppointments = appointments.filter(
    apt => apt.date === new Date().toISOString().split('T')[0] || apt.date === '2026-01-09'
  );

  const newPatientAppointments = todayAppointments.filter(apt => apt.isNewPatient);
  const existingPatientAppointments = todayAppointments.filter(apt => !apt.isNewPatient);

  const handlePatientSelect = (patient: Patient) => {
    onViewPatient(patient.id);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // In a real app, this would open an edit dialog
    console.log('Edit appointment:', appointment);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Doctor's Dashboard</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          View and manage your daily appointments
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBar onPatientSelect={handlePatientSelect} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                Total Appointments Today
              </p>
              <h3 className="mt-2">{todayAppointments.length}</h3>
            </div>
            <div 
              className="p-3"
              style={{
                backgroundColor: 'var(--primary)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <Calendar className="h-6 w-6" style={{ color: 'var(--primary-foreground)' }} />
            </div>
          </div>
        </div>

        <div 
          className="p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                New Patients
              </p>
              <h3 className="mt-2">{newPatientAppointments.length}</h3>
            </div>
            <div 
              className="p-3"
              style={{
                backgroundColor: 'var(--accent)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <UserPlus className="h-6 w-6" style={{ color: 'var(--accent-foreground)' }} />
            </div>
          </div>
        </div>

        <div 
          className="p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                Existing Patients
              </p>
              <h3 className="mt-2">{existingPatientAppointments.length}</h3>
            </div>
            <div 
              className="p-3"
              style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
              }}
            >
              <UserCheck className="h-6 w-6" style={{ color: 'var(--secondary-foreground)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List with Tabs */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Appointments ({todayAppointments.length})</TabsTrigger>
            <TabsTrigger value="new">New Patients ({newPatientAppointments.length})</TabsTrigger>
            <TabsTrigger value="existing">Existing Patients ({existingPatientAppointments.length})</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={handleEditAppointment}
                  onDelete={deleteAppointment}
                  onClick={() => onViewPatient(appointment.patientId)}
                />
              ))
            ) : (
              <div 
                className="p-12 text-center"
                style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <p style={{ color: 'var(--muted-foreground)' }}>No appointments scheduled for today</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            {newPatientAppointments.length > 0 ? (
              newPatientAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={handleEditAppointment}
                  onDelete={deleteAppointment}
                  onClick={() => onViewPatient(appointment.patientId)}
                />
              ))
            ) : (
              <div 
                className="p-12 text-center"
                style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <UserPlus className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <p style={{ color: 'var(--muted-foreground)' }}>No new patients scheduled for today</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="existing" className="space-y-4">
            {existingPatientAppointments.length > 0 ? (
              existingPatientAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={handleEditAppointment}
                  onDelete={deleteAppointment}
                  onClick={() => onViewPatient(appointment.patientId)}
                />
              ))
            ) : (
              <div 
                className="p-12 text-center"
                style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <UserCheck className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <p style={{ color: 'var(--muted-foreground)' }}>No existing patients scheduled for today</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <AppointmentCalendar 
              doctorId="D001" 
              isDoctor={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
