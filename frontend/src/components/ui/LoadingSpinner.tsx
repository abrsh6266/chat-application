import React from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  textClassName?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  color = 'primary',
  className,
  textClassName,
}) => {
  const containerClasses = clsx(
    'flex items-center justify-center gap-3',
    className
  );

  const textClasses = clsx(
    'text-sm font-medium',
    {
      'text-primary-600': color === 'primary',
      'text-white': color === 'white',
      'text-gray-600': color === 'gray',
    },
    textClassName
  );

  return (
    <div className={containerClasses}>
      <Spinner size={size} color={color} />
      {text && <span className={textClasses}>{text}</span>}
    </div>
  );
}; 