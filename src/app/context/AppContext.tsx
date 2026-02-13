import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, Appointment, Visit, CaseSheet, UserRole, DoctorAvailability, TimeSlot, Doctor } from '../types';

interface AppContextType {
  patients: Patient[];
  appointments: Appointment[];
  visits: Visit[];
  caseSheets: CaseSheet[];
  doctorAvailability: DoctorAvailability[];
  doctors: Doctor[];
  currentRole: UserRole;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addVisit: (visit: Visit) => void;
  addCaseSheet: (caseSheet: CaseSheet) => void;
  setCurrentRole: (role: UserRole) => void;
  clearUserData: () => void;
  searchPatients: (query: string) => Patient[];
  getDoctorAvailability: (doctorId: string, date: string) => DoctorAvailability | null;
  updateDoctorAvailability: (availability: DoctorAvailability) => void;
  blockTimeSlot: (doctorId: string, date: string, startTime: string, endTime: string, reason?: string) => void;
  unblockTimeSlot: (doctorId: string, date: string, slotId: string) => void;
  getAvailableTimeSlots: (doctorId: string, date: string) => TimeSlot[];
  generateTimeSlots: (doctorId: string, date: string) => void;
  refreshAvailability: () => void;
  // Real-time update functions
  subscribeToAvailabilityUpdates: (callback: (doctorId: string, date: string) => void) => () => void;
  broadcastAvailabilityUpdate: (doctorId: string, date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock initial data
const initialPatients: Patient[] = [
  {
    id: '1',
    patientNumber: 'P001',
    surname: 'Smith',
    name: 'John',
    gender: 'Male',
    age: 45,
    address: '123 Main St, New York, NY 10001',
    phoneNumber: '+1-555-0101',
    registrationDate: '2024-01-15',
  },
  {
    id: '2',
    patientNumber: 'P002',
    surname: 'Johnson',
    name: 'Emily',
    gender: 'Female',
    age: 32,
    address: '456 Oak Ave, Brooklyn, NY 11201',
    phoneNumber: '+1-555-0102',
    registrationDate: '2024-02-20',
  },
  {
    id: '3',
    patientNumber: 'P003',
    surname: 'Williams',
    name: 'Michael',
    gender: 'Male',
    age: 58,
    address: '789 Pine Rd, Queens, NY 11354',
    phoneNumber: '+1-555-0103',
    registrationDate: '2024-03-10',
  },
];

const initialAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientNumber: 'P001',
    patientName: 'John Smith',
    date: '2026-01-09',
    time: '09:00',
    doctorId: 'D001',
    status: 'Scheduled',
    isNewPatient: false,
  },
  {
    id: '2',
    patientId: '2',
    patientNumber: 'P002',
    patientName: 'Emily Johnson',
    date: '2026-01-09',
    time: '10:30',
    doctorId: 'D001',
    status: 'Scheduled',
    isNewPatient: false,
  },
  {
    id: '3',
    patientId: '3',
    patientNumber: 'P003',
    patientName: 'Michael Williams',
    date: '2026-01-09',
    time: '14:00',
    doctorId: 'D001',
    status: 'Scheduled',
    isNewPatient: false,
  },
];

const initialVisits: Visit[] = [
  {
    id: '1',
    patientId: '1',
    visitDate: '2025-12-15',
    doctorName: 'Dr. Anderson',
    diagnosis: 'Hypertension',
    prescription: 'Lisinopril 10mg once daily',
    notes: 'Blood pressure: 145/90. Follow-up in 3 months.',
  },
  {
    id: '2',
    patientId: '2',
    visitDate: '2025-11-20',
    doctorName: 'Dr. Anderson',
    diagnosis: 'Seasonal Allergies',
    prescription: 'Cetirizine 10mg as needed',
    notes: 'Mild symptoms, recommend antihistamines.',
  },
];

const initialCaseSheets: CaseSheet[] = [
  {
    id: '1',
    patientId: '1',
    uploadDate: '2025-12-15',
    fileName: 'case-sheet-dec-2025.pdf',
    fileUrl: '#',
    uploadedBy: 'Dr. Anderson',
  },
];

const initialDoctors: Doctor[] = [
  {
    id: 'D001',
    name: 'Dr. Anderson',
    specialization: 'General Medicine',
    workingHours: {
      start: '09:00',
      end: '17:00',
      slotDuration: 30,
    },
  },
];

const initialDoctorAvailability: DoctorAvailability[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [caseSheets, setCaseSheets] = useState<CaseSheet[]>(initialCaseSheets);
  const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailability[]>(initialDoctorAvailability);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  
  // Subscription system for real-time updates
  const [availabilitySubscribers, setAvailabilitySubscribers] = useState<Set<(doctorId: string, date: string) => void>>(new Set());
  
  // Initialize currentRole from localStorage or default to receptionist
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('currentRole');
    return (savedRole as UserRole) || 'receptionist';
  });

  // Custom setCurrentRole function that persists to localStorage
  const handleSetCurrentRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('currentRole', role);
  };

  // Clear user data function for logout
  const clearUserData = () => {
    localStorage.removeItem('currentRole');
    localStorage.removeItem('isAuthenticated');
    setCurrentRole('receptionist');
  };

  const addPatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
    // Update doctor availability to mark slot as booked
    const availability = getDoctorAvailability(appointment.doctorId, appointment.date);
    if (availability) {
      const updatedSlots = availability.timeSlots.map(slot => {
        if (slot.startTime === appointment.time) {
          return { ...slot, isBooked: true, appointmentId: appointment.id };
        }
        return slot;
      });
      updateDoctorAvailability({ ...availability, timeSlots: updatedSlots });
    }
  };

  const updateAppointment = (updatedAppointment: Appointment) => {
    const oldAppointment = appointments.find(a => a.id === updatedAppointment.id);
    setAppointments(appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
    
    // Update availability for old slot
    if (oldAppointment) {
      const oldAvailability = getDoctorAvailability(oldAppointment.doctorId, oldAppointment.date);
      if (oldAvailability) {
        const updatedOldSlots = oldAvailability.timeSlots.map(slot => {
          if (slot.startTime === oldAppointment.time) {
            return { ...slot, isBooked: false, appointmentId: undefined };
          }
          return slot;
        });
        updateDoctorAvailability({ ...oldAvailability, timeSlots: updatedOldSlots });
      }
    }
    
    // Update availability for new slot
    const newAvailability = getDoctorAvailability(updatedAppointment.doctorId, updatedAppointment.date);
    if (newAvailability) {
      const updatedNewSlots = newAvailability.timeSlots.map(slot => {
        if (slot.startTime === updatedAppointment.time) {
          return { ...slot, isBooked: true, appointmentId: updatedAppointment.id };
        }
        return slot;
      });
      updateDoctorAvailability({ ...newAvailability, timeSlots: updatedNewSlots });
    }
  };

  const deleteAppointment = (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    setAppointments(appointments.filter(a => a.id !== id));
    
    // Update doctor availability to mark slot as available
    if (appointment) {
      const availability = getDoctorAvailability(appointment.doctorId, appointment.date);
      if (availability) {
        const updatedSlots = availability.timeSlots.map(slot => {
          if (slot.startTime === appointment.time) {
            return { ...slot, isBooked: false, appointmentId: undefined };
          }
          return slot;
        });
        updateDoctorAvailability({ ...availability, timeSlots: updatedSlots });
      }
    }
  };

  const addVisit = (visit: Visit) => {
    setVisits([...visits, visit]);
  };

  const addCaseSheet = (caseSheet: CaseSheet) => {
    setCaseSheets([...caseSheets, caseSheet]);
  };

  const searchPatients = (query: string): Patient[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];
    
    return patients.filter(patient => 
      patient.patientNumber.toLowerCase().includes(lowerQuery) ||
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.surname.toLowerCase().includes(lowerQuery) ||
      `${patient.name} ${patient.surname}`.toLowerCase().includes(lowerQuery) ||
      patient.phoneNumber.includes(lowerQuery)
    );
  };

  const generateTimeSlots = (doctorId: string, date: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const startTime = doctor.workingHours.start;
    const endTime = doctor.workingHours.end;
    const slotDuration = doctor.workingHours.slotDuration;

    const slots: TimeSlot[] = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    // Get existing availability to preserve blocked slots
    const existingAvailability = doctorAvailability.find(
      da => da.doctorId === doctorId && da.date === date
    );
    
    while (start < end) {
      const slotStart = start.toTimeString().slice(0, 5);
      start.setMinutes(start.getMinutes() + slotDuration);
      const slotEnd = start.toTimeString().slice(0, 5);
      
      const existingAppointment = appointments.find(
        apt => apt.doctorId === doctorId && apt.date === date && apt.time === slotStart
      );

      // Check if this slot was previously blocked
      const existingSlot = existingAvailability?.timeSlots.find(
        slot => slot.startTime === slotStart
      );

      slots.push({
        id: `${date}_${slotStart}`,
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: !!existingAppointment,
        appointmentId: existingAppointment?.id,
        isBlocked: existingSlot?.isBlocked || false,
        blockReason: existingSlot?.blockReason,
      });
    }

    if (existingAvailability) {
      setDoctorAvailability(prev => 
        prev.map(da => 
          da.id === existingAvailability.id 
            ? { ...da, timeSlots: slots }
            : da
        )
      );
    } else {
      const newAvailability: DoctorAvailability = {
        id: `${doctorId}_${date}`,
        doctorId,
        date,
        timeSlots: slots,
      };
      setDoctorAvailability(prev => [...prev, newAvailability]);
    }
  };

  const getDoctorAvailability = (doctorId: string, date: string): DoctorAvailability | null => {
    let availability = doctorAvailability.find(da => da.doctorId === doctorId && da.date === date);
    if (!availability) {
      // Generate slots immediately and return the new availability
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) return null;

      const startTime = doctor.workingHours.start;
      const endTime = doctor.workingHours.end;
      const slotDuration = doctor.workingHours.slotDuration;

      const slots: TimeSlot[] = [];
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      
      while (start < end) {
        const slotStart = start.toTimeString().slice(0, 5);
        start.setMinutes(start.getMinutes() + slotDuration);
        const slotEnd = start.toTimeString().slice(0, 5);
        
        const existingAppointment = appointments.find(
          apt => apt.doctorId === doctorId && apt.date === date && apt.time === slotStart
        );

        slots.push({
          id: `${date}_${slotStart}`,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: !!existingAppointment,
          appointmentId: existingAppointment?.id,
          isBlocked: false, // New slots start as unblocked
          blockReason: undefined,
        });
      }

      const newAvailability: DoctorAvailability = {
        id: `${doctorId}_${date}`,
        doctorId,
        date,
        timeSlots: slots,
      };

      // Update state asynchronously but return immediately
      setDoctorAvailability(prev => [...prev, newAvailability]);
      return newAvailability;
    }
    return availability;
  };

  const updateDoctorAvailability = (availability: DoctorAvailability) => {
    setDoctorAvailability(prev => 
      prev.map(da => da.id === availability.id ? availability : da)
    );
  };

  const blockTimeSlot = (doctorId: string, date: string, startTime: string, endTime: string, reason?: string) => {
    const availability = getDoctorAvailability(doctorId, date);
    if (!availability) return;

    const updatedSlots = availability.timeSlots.map(slot => {
      // Check if slot overlaps with the blocking time range
      const slotStartTime = slot.startTime;
      const slotEndTime = slot.endTime;
      
      // A slot should be blocked if it overlaps with the blocking period
      const shouldBlock = (slotStartTime >= startTime && slotStartTime < endTime) || 
                         (slotEndTime > startTime && slotEndTime <= endTime) ||
                         (slotStartTime <= startTime && slotEndTime >= endTime);
      
      if (shouldBlock) {
        return { ...slot, isBlocked: true, blockReason: reason };
      }
      return slot;
    });

    // Update the availability immediately
    const updatedAvailability = { ...availability, timeSlots: updatedSlots };
    updateDoctorAvailability(updatedAvailability);
    
    // Broadcast the update to all subscribers for real-time sync
    broadcastAvailabilityUpdate(doctorId, date);
  };

  const unblockTimeSlot = (doctorId: string, date: string, slotId: string) => {
    const availability = getDoctorAvailability(doctorId, date);
    if (!availability) return;

    const updatedSlots = availability.timeSlots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, isBlocked: false, blockReason: undefined };
      }
      return slot;
    });

    // Update the availability immediately
    const updatedAvailability = { ...availability, timeSlots: updatedSlots };
    updateDoctorAvailability(updatedAvailability);
    
    // Broadcast the update to all subscribers for real-time sync
    broadcastAvailabilityUpdate(doctorId, date);
  };

  const getAvailableTimeSlots = (doctorId: string, date: string): TimeSlot[] => {
    const availability = getDoctorAvailability(doctorId, date);
    if (!availability) return [];

    return availability.timeSlots.filter(slot => !slot.isBooked && !slot.isBlocked);
  };

  const refreshAvailability = () => {
    // Force a re-render by creating a new reference
    setDoctorAvailability(prev => [...prev]);
  };

  // Real-time update system
  const subscribeToAvailabilityUpdates = (callback: (doctorId: string, date: string) => void) => {
    setAvailabilitySubscribers(prev => new Set([...prev, callback]));
    
    // Return unsubscribe function
    return () => {
      setAvailabilitySubscribers(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  };

  const broadcastAvailabilityUpdate = (doctorId: string, date: string) => {
    // Notify all subscribers about the availability update
    availabilitySubscribers.forEach(callback => {
      try {
        callback(doctorId, date);
      } catch (error) {
        console.warn('Error in availability update callback:', error);
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        appointments,
        visits,
        caseSheets,
        doctorAvailability,
        doctors,
        currentRole,
        addPatient,
        updatePatient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addVisit,
        addCaseSheet,
        setCurrentRole: handleSetCurrentRole,
        clearUserData,
        searchPatients,
        getDoctorAvailability,
        updateDoctorAvailability,
        blockTimeSlot,
        unblockTimeSlot,
        getAvailableTimeSlots,
        generateTimeSlots,
        refreshAvailability,
        subscribeToAvailabilityUpdates,
        broadcastAvailabilityUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
