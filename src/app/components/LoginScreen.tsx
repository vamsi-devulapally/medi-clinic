import React, { useState } from 'react';
import { LogIn, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserRole } from '../types';
import { Separator } from './ui/separator';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

// Mock user credentials
const MOCK_USERS = {
  receptionist: {
    username: 'receptionist',
    password: 'receptionist123',
    role: 'receptionist' as UserRole,
  },
  doctor: {
    username: 'doctor',
    password: 'doctor123',
    role: 'doctor' as UserRole,
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      const user = Object.values(MOCK_USERS).find(
        u => u.username === username && u.password === password
      );

      if (user) {
        onLogin(user.role);
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate social login - in real app, this would redirect to OAuth provider
    setTimeout(() => {
      // For demo purposes, social login defaults to receptionist
      onLogin('receptionist');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div 
        className="w-full max-w-md p-8"
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-sm)',
        }}
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: 'var(--primary)',
            }}
          >
            <svg
              className="h-8 w-8"
              style={{ color: 'var(--primary-foreground)' }}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="mb-2">Raghava Krishna Clinic Management</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--input-background)',
                borderRadius: 'var(--radius)',
              }}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--input-background)',
                borderRadius: 'var(--radius)',
              }}
            />
          </div>

          {error && (
            <div 
              className="p-3"
              style={{
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <Separator className="flex-1" />
          <span 
            className="px-4"
            style={{ 
              color: 'var(--muted-foreground)',
              fontSize: 'var(--text-sm)',
            }}
          >
            or continue with
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            style={{
              borderRadius: 'var(--radius-button)',
              borderColor: 'var(--border)',
            }}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('microsoft')}
            disabled={isLoading}
            style={{
              borderRadius: 'var(--radius-button)',
              borderColor: 'var(--border)',
            }}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M13 1h10v10H13z" />
              <path fill="#7fba00" d="M1 13h10v10H1z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
            Continue with Microsoft
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('email')}
            disabled={isLoading}
            style={{
              borderRadius: 'var(--radius-button)',
              borderColor: 'var(--border)',
            }}
          >
            <Mail className="h-5 w-5 mr-2" />
            Continue with Email
          </Button>
        </div>

        {/* Demo Credentials Info */}
        <div 
          className="mt-8 p-4"
          style={{
            backgroundColor: 'var(--muted)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          <p 
            className="mb-2"
            style={{ 
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Demo Credentials:
          </p>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            <p className="mb-1">
              <strong>Receptionist:</strong> receptionist / receptionist123
            </p>
            <p>
              <strong>Doctor:</strong> doctor / doctor123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
