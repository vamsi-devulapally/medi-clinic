import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users } from 'lucide-react';
import { Button } from './ui/button';
import { SearchBar } from './SearchBar';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentCalendar } from './AppointmentCalendar';
import { useApp } from '../context/AppContext';
import { Patient, Appointment } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ReceptionistDashboardProps {
  onAddPatient: () => void;
  onViewPatient: (patientId: string) => void;
  onBookAppointment?: () => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ 
  onAddPatient, 
  onViewPatient,
  onBookAppointment 
}) => {
  const { appointments, deleteAppointment, updateAppointment, addAppointment, patients, getDoctorAvailability, generateTimeSlots, subscribeToAvailabilityUpdates, refreshAvailability } = useApp();
  const [activeTab, setActiveTab] = useState('appointments');
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // Subscribe to real-time availability updates
  useEffect(() => {
    const unsubscribe = subscribeToAvailabilityUpdates((doctorId, date) => {
      // Force refresh of availability data and UI when any doctor's availability changes
      refreshAvailability();
      
      // If we're currently viewing the schedule tab and the same date, force regeneration
      if (activeTab === 'schedule' && selectedCalendarDate) {
        const selectedDateString = `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`;
        if (date === selectedDateString) {
          generateTimeSlots(doctorId, date);
        }
      }
    });

    return unsubscribe;
  }, [activeTab, selectedCalendarDate, subscribeToAvailabilityUpdates, refreshAvailability, generateTimeSlots]);

  const todayAppointments = appointments.filter(
    apt => {
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return apt.date === todayString || apt.date === '2026-01-09';
    }
  );

  // Helper functions for date/time validation
  const isDateInPast = (date: string) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return date < todayString;
  };

  const isTimeInPast = (date: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (date > today) return false; // Future date
    if (date < today) return true;  // Past date
    
    // Same date - check time (only consider past if time has already passed)
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    return time < currentTime; // Changed from <= to <
  };

  const handlePatientSelect = (patient: Patient) => {
    onViewPatient(patient.id);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentDate(appointment.date);
    setAppointmentTime(appointment.time);
    const patient = patients.find(p => p.id === appointment.patientId);
    if (patient) setSelectedPatient(patient);
    setShowAppointmentDialog(true);
  };

  const handleBookAppointment = () => {
    setEditingAppointment(null);
    setSelectedPatient(null);
    // Use selectedCalendarDate if available, otherwise use current date
    const dateToUse = selectedCalendarDate 
      ? `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`
      : (() => {
          const today = new Date();
          return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        })();
    setAppointmentDate(dateToUse);
    setAppointmentTime('');
    setShowAppointmentDialog(true);
  };

  const handleSaveAppointment = () => {
    if (!selectedPatient || !appointmentTime || !appointmentDate) return;

    // Validate date and time are not in the past
    if (isDateInPast(appointmentDate)) {
      alert('Cannot book appointments for past dates.');
      return;
    }

    if (isTimeInPast(appointmentDate, appointmentTime)) {
      alert('Cannot book appointments for times that have already passed.');
      return;
    }

    if (editingAppointment) {
      // Update existing appointment
      updateAppointment({
        ...editingAppointment,
        date: appointmentDate,
        time: appointmentTime,
      });
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: String(Date.now()),
        patientId: selectedPatient.id,
        patientNumber: selectedPatient.patientNumber,
        patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
        date: appointmentDate,
        time: appointmentTime,
        doctorId: 'D001',
        status: 'Scheduled',
        isNewPatient: selectedPatient.isNew || false,
      };
      addAppointment(newAppointment);
    }
    
    setShowAppointmentDialog(false);
    setSelectedPatient(null);
    setEditingAppointment(null);
    setAppointmentTime('');
    setAppointmentDate('');
  };

  const handleDateSelect = (date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setAppointmentDate(dateString);
    setActiveTab('appointments');
    setShowAppointmentDialog(true);
  };

  const handleTimeSlotSelect = (timeSlot: string, date: string) => {
    setAppointmentTime(timeSlot);
    setAppointmentDate(date);
    setActiveTab('appointments');
    setShowAppointmentDialog(true);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    // Force generation of time slots for the selected date
    generateTimeSlots('D001', dateString);
    // Switch to schedule tab to show the selected date
    setActiveTab('schedule');
    
    // Force a re-render by updating a timestamp or counter if needed
    // This ensures the schedule tab shows the latest data
    setTimeout(() => {
      // Small delay to ensure state updates have been processed
      getDoctorAvailability('D001', dateString);
    }, 100);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Receptionist Dashboard</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Manage appointments and patient registrations
        </p>
      </div>

      {/* Search and Actions */}
      <div className="mb-8 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <SearchBar onPatientSelect={handlePatientSelect} />
        </div>
        <Button 
          onClick={onAddPatient}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
        <Button 
          onClick={onBookAppointment || handleBookAppointment}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
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
                Today's Appointments
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
                Total Patients
              </p>
              <h3 className="mt-2">{patients.length}</h3>
            </div>
            <div 
              className="p-3"
              style={{
                backgroundColor: 'var(--accent)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <Users className="h-6 w-6" style={{ color: 'var(--accent-foreground)' }} />
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
                New Patients Today
              </p>
              <h3 className="mt-2">
                {todayAppointments.filter(apt => apt.isNewPatient).length}
              </h3>
            </div>
            <div 
              className="p-3"
              style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <Users className="h-6 w-6" style={{ color: 'var(--secondary-foreground)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">
            {selectedCalendarDate ? `Schedule - ${selectedCalendarDate.toLocaleDateString()}` : 'Daily Schedule'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div>
            <h2 className="mb-4">Today's Appointments</h2>
            <div className="space-y-4">
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar 
            doctorId="D001" 
            isDoctor={false}
            onDateSelect={handleCalendarDateSelect}
            onTimeSlotSelect={handleTimeSlotSelect}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {selectedCalendarDate ? (
            (() => {
              const dateString = `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`;              
              const dayAppointments = appointments.filter(
                apt => apt.date === dateString && apt.doctorId === 'D001'
              );
              const availability = getDoctorAvailability('D001', dateString);
              const timeSlots = availability?.timeSlots || [];

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2>Schedule for {selectedCalendarDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAppointmentDate(dateString);
                          setShowAppointmentDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Time Slots Schedule */}
                    <div 
                      className="p-6"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderRadius: 'var(--radius-card)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <h3 className="text-lg font-medium mb-4">Time Slots Schedule</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {timeSlots.length === 0 ? (
                          <p style={{ color: 'var(--muted-foreground)' }}>
                            No time slots available for this date
                          </p>
                        ) : (
                          timeSlots.map((slot) => {
                            const appointment = dayAppointments.find(apt => apt.time === slot.startTime);
                            const isPastTime = isTimeInPast(dateString, slot.startTime);
                            
                            return (
                              <div
                                key={slot.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  slot.isBooked
                                    ? 'bg-red-50 border-red-200'
                                    : slot.isBlocked
                                    ? 'bg-gray-50 border-gray-200'
                                    : isPastTime
                                    ? 'bg-gray-50 border-gray-300 opacity-50'
                                    : 'bg-green-50 border-green-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  {slot.isBooked && appointment && (
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{appointment.patientName}</span>
                                      <span className="text-xs text-muted-foreground">{appointment.patientNumber}</span>
                                    </div>
                                  )}
                                  {slot.isBlocked && (
                                    <span className="text-sm text-muted-foreground">
                                      Blocked{slot.blockReason && `: ${slot.blockReason}`}
                                    </span>
                                  )}
                                  {!slot.isBooked && !slot.isBlocked && !isPastTime && (
                                    <span className="text-sm text-green-600">Available</span>
                                  )}
                                  {!slot.isBooked && !slot.isBlocked && isPastTime && (
                                    <span className="text-sm text-gray-500">Past Time</span>
                                  )}
                                </div>
                                
                                {!slot.isBooked && !slot.isBlocked && !isPastTime && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setAppointmentDate(dateString);
                                      setAppointmentTime(slot.startTime);
                                      setShowAppointmentDialog(true);
                                    }}
                                  >
                                    Book
                                  </Button>
                                )}
                                {!slot.isBooked && !slot.isBlocked && isPastTime && (
                                  <span className="text-xs text-gray-500">Past</span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Appointments Summary */}
                    <div 
                      className="p-6"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderRadius: 'var(--radius-card)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <h3 className="text-lg font-medium mb-4">Scheduled Appointments</h3>
                      <div className="space-y-4">
                        {dayAppointments.length === 0 ? (
                          <p style={{ color: 'var(--muted-foreground)' }}>
                            No appointments scheduled for this date
                          </p>
                        ) : (
                          dayAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="p-3 border rounded-lg"
                              style={{
                                backgroundColor: 'var(--muted)',
                                borderColor: 'var(--border)',
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{appointment.patientName}</h4>
                                  <p className="text-sm text-muted-foreground">{appointment.patientNumber}</p>
                                  <p className="text-sm font-medium">{appointment.time}</p>
                                  {appointment.isNewPatient && (
                                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                      New Patient
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditAppointment(appointment)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewPatient(appointment.patientId)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Summary Stats */}
                      <div className="mt-6 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Slots:</span>
                            <span className="ml-2 font-medium">{timeSlots.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Booked:</span>
                            <span className="ml-2 font-medium">{dayAppointments.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Available:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {timeSlots.filter(slot => !slot.isBooked && !slot.isBlocked).length}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Blocked:</span>
                            <span className="ml-2 font-medium text-gray-600">
                              {timeSlots.filter(slot => slot.isBlocked).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Select a date from the calendar to view its schedule
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Select Patient</Label>
              {selectedPatient ? (
                <div className="mt-2 p-3" style={{
                  backgroundColor: 'var(--muted)',
                  borderRadius: 'var(--radius)',
                }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {selectedPatient.name} {selectedPatient.surname}
                      </p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        {selectedPatient.patientNumber}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <SearchBar onPatientSelect={setSelectedPatient} placeholder="Search for patient..." />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={(() => {
                    const today = new Date();
                    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  })()}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                {appointmentDate ? (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {(() => {
                      const { getAvailableTimeSlots } = useApp();
                      const availableSlots = getAvailableTimeSlots('D001', appointmentDate)
                        .filter(slot => !isTimeInPast(appointmentDate, slot.startTime)); // Filter out past times
                      
                      return availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={appointmentTime === slot.startTime ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAppointmentTime(slot.startTime)}
                            className="w-full justify-start"
                          >
                            {slot.startTime} - {slot.endTime}
                          </Button>
                        ))
                      ) : (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          No available time slots for this date
                        </p>
                      );
                    })()}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                    Select a date to see available time slots
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAppointmentDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAppointment}
                disabled={!selectedPatient || !appointmentTime || !appointmentDate}
              >
                {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};