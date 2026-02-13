import React from 'react';
import { Clock, User, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onEdit, 
  onDelete,
  onClick 
}) => {
  return (
    <div 
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-lg)' }}>
              {appointment.patientName}
            </p>
            {appointment.isNewPatient && (
              <span 
                className="px-2 py-0.5"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                New Patient
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <User className="h-4 w-4" />
              <span style={{ fontSize: 'var(--text-sm)' }}>{appointment.patientNumber}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <Clock className="h-4 w-4" />
              <span style={{ fontSize: 'var(--text-sm)' }}>{appointment.time}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(appointment)}
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(appointment.id)}
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Trash2 className="h-4 w-4" style={{ color: 'var(--destructive)' }} />
          </Button>
        </div>
      </div>
      
      {appointment.notes && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          {appointment.notes}
        </p>
      )}
    </div>
  );
};
