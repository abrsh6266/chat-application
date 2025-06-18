import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isRound?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      isRound = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      {
        'rounded-full': isRound,
        'rounded-lg': !isRound,
      }
    );

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
      ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100',
    };

    const sizes = {
      sm: 'h-8 w-8 p-1',
      md: 'h-10 w-10 p-2',
      lg: 'h-12 w-12 p-3',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const buttonClasses = clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    const { 
      onAnimationStart, 
      onAnimationEnd, 
      onDragStart, 
      onDrag, 
      onDragEnd,
      ...buttonProps 
    } = props;

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        {...buttonProps}
      >
        {isLoading ? (
          <Loader2 className={clsx('animate-spin', iconSizes[size])} />
        ) : (
          <span className={iconSizes[size]}>{icon}</span>
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton'; 