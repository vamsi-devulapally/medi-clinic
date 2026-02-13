import React from 'react';
import { UserCog, Stethoscope } from 'lucide-react';
import { Button } from './ui/button';
import { UserRole } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="mb-4">Medical Clinic Management System</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-lg)' }}>
            Select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Receptionist Card */}
          <button
            onClick={() => onSelectRole('receptionist')}
            className="p-8 text-center transition-all hover:shadow-xl"
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--radius-card)',
              border: '2px solid var(--border)',
            }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                backgroundColor: 'var(--primary)',
              }}
            >
              <UserCog className="h-10 w-10" style={{ color: 'var(--primary-foreground)' }} />
            </div>
            <h2 className="mb-3">Receptionist</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px' }}>
              Manage patient registrations, appointments, and daily schedules
            </p>
            <Button
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-button)',
                width: '100%',
              }}
            >
              Continue as Receptionist
            </Button>
          </button>

          {/* Doctor Card */}
          <button
            onClick={() => onSelectRole('doctor')}
            className="p-8 text-center transition-all hover:shadow-xl"
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--radius-card)',
              border: '2px solid var(--border)',
            }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                backgroundColor: 'var(--accent)',
              }}
            >
              <Stethoscope className="h-10 w-10" style={{ color: 'var(--accent-foreground)' }} />
            </div>
            <h2 className="mb-3">Doctor</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px' }}>
              View appointments, access patient records, and manage case sheets
            </p>
            <Button
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                borderRadius: 'var(--radius-button)',
                width: '100%',
              }}
            >
              Continue as Doctor
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
};
