import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks';
import { RegisterRequest } from '../../types';
import { Button, Input } from '../ui';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/rooms');
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (error) {
      clearError();
    }
  };

  const isFormValid = formData.username && formData.password && formData.confirmPassword;

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
          type="text"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleInputChange('username')}
          leftIcon={<User className="h-4 w-4" />}
          error={fieldErrors.username}
          disabled={isLoading}
          fullWidth
          autoComplete="username"
          autoFocus
        />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange('password')}
          leftIcon={<Lock className="h-4 w-4" />}
          error={fieldErrors.password}
          disabled={isLoading}
          fullWidth
          autoComplete="new-password"
        />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            formData.confirmPassword && formData.password === formData.confirmPassword ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : null
          }
          error={fieldErrors.confirmPassword}
          disabled={isLoading}
          fullWidth
          autoComplete="new-password"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        fullWidth
        disabled={!isFormValid}
      >
        Create Account
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
            disabled={isLoading}
          >
            Sign in here
          </button>
        </p>
      </div>
    </motion.form>
  );
}; 