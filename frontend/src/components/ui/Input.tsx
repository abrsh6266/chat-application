import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || `input-${React.useId()}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseClasses = clsx(
      'block w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
      'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
      {
        'pl-10': leftIcon,
        'pr-10': rightIcon || isPassword,
        'border-red-300 focus:border-red-500 focus:ring-red-500': error,
        'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !error,
        'w-full': fullWidth,
      }
    );

    const togglePassword = () => setShowPassword(!showPassword);

    return (
      <div className={clsx('relative', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'mb-1 block text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={clsx(baseClasses, className)}
            disabled={disabled}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1 flex items-start gap-1">
            {error && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
            <p
              className={clsx(
                'text-sm',
                error ? 'text-red-600' : 'text-gray-500'
              )}
            >
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 