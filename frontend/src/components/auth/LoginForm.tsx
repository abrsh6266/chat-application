import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks';
import { LoginRequest } from '../../types';
import { Button, Input } from '../ui';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginRequest>>({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginRequest> = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate('/rooms');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear global error when user makes changes
    if (error) {
      clearError();
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      <div>
        <Input
          type="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleInputChange('username')}
          leftIcon={<Mail className="h-4 w-4" />}
          error={fieldErrors.username}
          disabled={isLoading}
          fullWidth
          autoComplete="email"
          autoFocus
        />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          leftIcon={<Lock className="h-4 w-4" />}
          error={fieldErrors.password}
          disabled={isLoading}
          fullWidth
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        fullWidth
        disabled={!formData.username || !formData.password}
      >
        Sign In
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
            disabled={isLoading}
          >
            Sign up here
          </button>
        </p>
      </div>
    </motion.form>
  );
}; 