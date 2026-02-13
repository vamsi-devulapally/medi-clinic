export interface Patient {
  id: string;
  patientNumber: string;
  surname: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  address: string;
  phoneNumber: string;
  registrationDate: string;
  isNew?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientNumber: string;
  patientName: string;
  date: string;
  time: string;
  doctorId: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  isNewPatient: boolean;
  notes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  doctorName: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

export interface CaseSheet {
  id: string;
  patientId: string;
  uploadDate: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  date: string;
  timeSlots: TimeSlot[];
  isBlocked?: boolean;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  appointmentId?: string;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  workingHours: {
    start: string;
    end: string;
    slotDuration: number; // in minutes
  };
}

export type UserRole = 'receptionist' | 'doctor';
