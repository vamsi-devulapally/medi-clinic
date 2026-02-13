import React, { useState } from 'react';
import { ArrowLeft, Edit, Save, Upload, FileText, Calendar, Pill, User, Phone, MapPin, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useApp } from '../context/AppContext';
import { Patient, Visit } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PatientDetailsProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patientId, onBack }) => {
  const { patients, visits, caseSheets, updatePatient, addCaseSheet, currentRole } = useApp();
  const patient = patients.find(p => p.id === patientId);
  const patientVisits = visits.filter(v => v.patientId === patientId);
  const patientCaseSheets = caseSheets.filter(cs => cs.patientId === patientId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient | null>(patient || null);

  if (!patient || !editedPatient) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
        <p>Patient not found</p>
      </div>
    );
  }

  const handleSave = () => {
    if (editedPatient) {
      updatePatient(editedPatient);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (field: keyof Patient, value: string | number) => {
    setEditedPatient({ ...editedPatient, [field]: value });
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newCaseSheet = {
      id: String(Date.now()),
      patientId: patient.id,
      uploadDate: new Date().toISOString().split('T')[0],
      fileName: 'case-sheet-' + new Date().toISOString().split('T')[0] + '.pdf',
      fileUrl: '#',
      uploadedBy: currentRole === 'doctor' ? 'Dr. Anderson' : 'Receptionist',
    };
    addCaseSheet(newCaseSheet);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="mb-2">
                {patient.name} {patient.surname}
              </h1>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Patient ID: {patient.patientNumber}
              </p>
            </div>
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius-button)',
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: 'var(--radius-button)',
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedPatient(patient);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Patient Details</TabsTrigger>
            <TabsTrigger value="history">Visit History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Patient Details Tab */}
          <TabsContent value="details">
            <div 
              className="p-8"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Patient Number</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                    <span>{patient.patientNumber}</span>
                  </div>
                </div>

                <div>
                  <Label>Registration Date</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                    <span>{new Date(patient.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="surname">Surname</Label>
                  {isEditing ? (
                    <Input
                      id="surname"
                      value={editedPatient.surname}
                      onChange={(e) => handleChange('surname', e.target.value)}
                      style={{ backgroundColor: 'var(--input-background)' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span>{patient.surname}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedPatient.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      style={{ backgroundColor: 'var(--input-background)' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span>{patient.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select 
                      value={editedPatient.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-2">
                      <span>{patient.gender}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      type="number"
                      value={editedPatient.age}
                      onChange={(e) => handleChange('age', parseInt(e.target.value))}
                      style={{ backgroundColor: 'var(--input-background)' }}
                    />
                  ) : (
                    <div className="mt-2">
                      <span>{patient.age} years</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedPatient.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      style={{ backgroundColor: 'var(--input-background)' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span>{patient.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Textarea
                      id="address"
                      value={editedPatient.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows={3}
                      style={{ backgroundColor: 'var(--input-background)' }}
                    />
                  ) : (
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin className="h-4 w-4 mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
                      <span>{patient.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Visit History Tab */}
          <TabsContent value="history">
            <div 
              className="p-8"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="mb-6">Visit History</h3>
              
              {patientVisits.length > 0 ? (
                <div className="space-y-4">
                  {patientVisits.map((visit) => (
                    <div 
                      key={visit.id}
                      className="p-6"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderRadius: 'var(--radius-card)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                              {new Date(visit.visitDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                            Doctor: {visit.doctorName}
                          </p>
                        </div>
                      </div>
                      
                      {visit.diagnosis && (
                        <div className="mb-3">
                          <Label className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4" />
                            Diagnosis
                          </Label>
                          <p>{visit.diagnosis}</p>
                        </div>
                      )}
                      
                      {visit.prescription && (
                        <div className="mb-3">
                          <Label className="flex items-center gap-2 mb-1">
                            <Pill className="h-4 w-4" />
                            Prescription
                          </Label>
                          <p>{visit.prescription}</p>
                        </div>
                      )}
                      
                      {visit.notes && (
                        <div>
                          <Label className="mb-1">Notes</Label>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
                            {visit.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                  <p style={{ color: 'var(--muted-foreground)' }}>No visit history available</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div 
              className="p-8"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3>Case Sheets & Documents</h3>
                {currentRole === 'doctor' && (
                  <Button
                    onClick={handleFileUpload}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      borderRadius: 'var(--radius-button)',
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </div>
              
              {patientCaseSheets.length > 0 ? (
                <div className="space-y-3">
                  {patientCaseSheets.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-4"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2"
                          style={{
                            backgroundColor: 'var(--primary)',
                            borderRadius: 'var(--radius)',
                          }}
                        >
                          <FileText className="h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {doc.fileName}
                          </p>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                            Uploaded on {new Date(doc.uploadDate).toLocaleDateString()} by {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                  <p style={{ color: 'var(--muted-foreground)' }}>No documents uploaded</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
