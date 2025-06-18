import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      resize = 'vertical',
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${React.useId()}`;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const baseClasses = clsx(
      'block w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
      'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
      resizeClasses[resize],
      {
        'border-red-300 focus:border-red-500 focus:ring-red-500': error,
        'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !error,
        'w-full': fullWidth,
      }
    );

    return (
      <div className={clsx('relative', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={textareaId}
            className={clsx(
              'mb-1 block text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(baseClasses, className)}
          disabled={disabled}
          {...props}
        />
        
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

Textarea.displayName = 'Textarea'; 