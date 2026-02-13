import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Patient } from '../types';
import { useApp } from '../context/AppContext';

interface SearchBarProps {
  onPatientSelect: (patient: Patient) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onPatientSelect, 
  placeholder = "Search by patient number, name, or phone..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { searchPatients } = useApp();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const searchResults = searchPatients(value);
      setResults(searchResults);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    onPatientSelect(patient);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          style={{
            backgroundColor: 'var(--input-background)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
          }}
        />
      </div>
      
      {showResults && results.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-2 overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--elevation-sm)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="max-h-80 overflow-y-auto">
            {results.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="w-full px-4 py-3 text-left hover:opacity-80 transition-opacity border-b"
                style={{
                  borderBottomColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {patient.name} {patient.surname}
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                      {patient.patientNumber} • {patient.phoneNumber}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {showResults && results.length === 0 && query.trim() && (
        <div 
          className="absolute z-50 w-full mt-2 p-4"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--elevation-sm)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ color: 'var(--muted-foreground)' }}>No patients found</p>
        </div>
      )}
    </div>
  );
};
