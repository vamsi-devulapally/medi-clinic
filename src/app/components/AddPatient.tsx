import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';

interface AddPatientProps {
  onBack: () => void;
  onSave: () => void;
}

export const AddPatient: React.FC<AddPatientProps> = ({ onBack, onSave }) => {
  const { addPatient, patients } = useApp();
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: '',
    address: '',
    phoneNumber: '',
    visitedDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate patient number
    const patientNumber = `P${String(patients.length + 1).padStart(3, '0')}`;
    
    const newPatient: Patient = {
      id: String(Date.now()),
      patientNumber,
      surname: formData.surname,
      name: formData.name,
      gender: formData.gender,
      age: parseInt(formData.age),
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      registrationDate: new Date().toISOString().split('T')[0],
      isNew: true,
    };

    addPatient(newPatient);
    onSave();
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isFormValid = formData.surname && formData.name && formData.age && 
                      formData.address && formData.phoneNumber;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto">
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
          <h1 className="mb-2">Add New Patient</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Register a new patient in the system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div 
            className="p-8"
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surname */}
              <div>
                <Label htmlFor="surname">Patient Surname *</Label>
                <Input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                  placeholder="Enter surname"
                  required
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Patient Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter name"
                  required
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>

              {/* Gender */}
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age */}
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="Enter age"
                  required
                  min="0"
                  max="150"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="+1-555-0000"
                  required
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>

              {/* Visited Date (Optional) */}
              <div>
                <Label htmlFor="visitedDate">Visited Date (Optional)</Label>
                <Input
                  id="visitedDate"
                  type="date"
                  value={formData.visitedDate}
                  onChange={(e) => handleChange('visitedDate', e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  required
                  rows={3}
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <Button
                type="submit"
                disabled={!isFormValid}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius-button)',
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Patient
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
