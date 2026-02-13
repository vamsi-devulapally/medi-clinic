import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SearchBar } from './SearchBar';
import { useApp } from '../context/AppContext';
import { Patient, Appointment } from '../types';
import { format, addDays, startOfDay } from 'date-fns';

interface BookAppointmentProps {
  onBack: () => void;
  onSuccess: () => void;
  preSelectedPatient?: Patient | null;
  preSelectedDate?: string;
  preSelectedTime?: string;
}

export const BookAppointment: React.FC<BookAppointmentProps> = ({ 
  onBack, 
  onSuccess,
  preSelectedPatient = null,
  preSelectedDate = '',
  preSelectedTime = ''
}) => {
  const { patients, addAppointment, getAvailableTimeSlots, generateTimeSlots, subscribeToAvailabilityUpdates, refreshAvailability } = useApp();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(preSelectedPatient);
  const [selectedDate, setSelectedDate] = useState(preSelectedDate || format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState(preSelectedTime);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  
  const doctorId = 'D001'; // Default doctor

  // Helper functions for date/time validation
  const isDateInPast = (date: string) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return date < todayString;
  };

  const isTimeInPast = (date: string, time: string) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (date > todayString) return false; // Future date
    if (date < todayString) return true;  // Past date
    
    // Same date - check time (only consider past if time has already passed)
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    return time < currentTime; // Changed from <= to <
  };

  // Generate slots when date changes
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(doctorId, selectedDate);
      const slots = getAvailableTimeSlots(doctorId, selectedDate)
        .filter(slot => !isTimeInPast(selectedDate, slot.startTime)); // Filter out past times
      setAvailableSlots(slots);
    }
  }, [selectedDate, doctorId, generateTimeSlots, getAvailableTimeSlots]);

  // Subscribe to real-time availability updates
  useEffect(() => {
    const unsubscribe = subscribeToAvailabilityUpdates((updatedDoctorId, updatedDate) => {
      // Only refresh if this component is viewing the same doctor and date
      if (updatedDoctorId === doctorId && updatedDate === selectedDate) {
        // Refresh available slots when availability changes
        const slots = getAvailableTimeSlots(doctorId, selectedDate)
          .filter(slot => !isTimeInPast(selectedDate, slot.startTime));
        setAvailableSlots(slots);
        refreshAvailability();
      }
    });

    return unsubscribe;
  }, [doctorId, selectedDate, subscribeToAvailabilityUpdates, getAvailableTimeSlots, refreshAvailability]);

  // Generate next 7 days for quick date selection
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE, MMM d'),
      fullDate: date,
    };
  });

  const handleBookAppointment = () => {
    if (!selectedPatient || !selectedDate || !selectedTime) return;

    // Validate date and time are not in the past
    if (isDateInPast(selectedDate)) {
      alert('Cannot book appointments for past dates.');
      return;
    }

    if (isTimeInPast(selectedDate, selectedTime)) {
      alert('Cannot book appointments for times that have already passed.');
      return;
    }

    const newAppointment: Appointment = {
      id: String(Date.now()),
      patientId: selectedPatient.id,
      patientNumber: selectedPatient.patientNumber,
      patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
      date: selectedDate,
      time: selectedTime,
      doctorId: doctorId,
      status: 'Scheduled',
      isNewPatient: selectedPatient.isNew || false,
    };

    addAppointment(newAppointment);
    onSuccess();
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-4"
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="mb-2">Book New Appointment</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Select patient, date and available time slot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div 
                  className="p-4"
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {selectedPatient.name} {selectedPatient.surname}
                      </h3>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                        {selectedPatient.patientNumber}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                        {selectedPatient.phoneNumber}
                      </p>
                      {selectedPatient.isNew && (
                        <Badge variant="secondary" className="mt-2">New Patient</Badge>
                      )}
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
                <SearchBar 
                  onPatientSelect={setSelectedPatient} 
                  placeholder="Search for patient..." 
                />
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Date Selection */}
              <div>
                <h4 className="text-sm font-medium mb-2">Quick Date Selection</h4>
                <div className="grid grid-cols-2 gap-2">
                  {nextSevenDays.map((day) => (
                    <Button
                      key={day.date}
                      variant={selectedDate === day.date ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(day.date)}
                      className="justify-start"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Input */}
              <div>
                <h4 className="text-sm font-medium mb-2">Or Choose Custom Date</h4>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full p-2 border rounded-md"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>

              {/* Available Time Slots */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Available Time Slots for {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.startTime ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(slot.startTime)}
                        className="justify-center"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.startTime}
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4">
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                        No available time slots for this date
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Summary and Actions */}
        {selectedPatient && selectedDate && selectedTime && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <h4 className="font-medium">Patient</h4>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    {selectedPatient.name} {selectedPatient.surname}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                    {selectedPatient.patientNumber}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Date</h4>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Time</h4>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    {selectedTime}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button onClick={handleBookAppointment}>
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};