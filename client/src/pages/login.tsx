import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { useAuth } from '@/contexts/auth-context';

const Login = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleShowLogin = () => {
    setShowRegister(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-lg font-medium text-neutral-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      {showRegister ? (
        <RegisterForm onShowLogin={handleShowLogin} />
      ) : (
        <LoginForm onShowRegister={handleShowRegister} />
      )}
    </div>
  );
};

export default Login;
