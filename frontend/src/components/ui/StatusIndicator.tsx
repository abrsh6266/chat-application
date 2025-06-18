import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showPulse = false,
  className,
}) => {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const indicatorClasses = clsx(
    'inline-block rounded-full border-2 border-white',
    sizes[size],
    colors[status],
    className
  );

  if (showPulse && status === 'online') {
    return (
      <div className="relative">
        <motion.div
          className={indicatorClasses}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className={clsx(
            'absolute inset-0 rounded-full',
            colors[status],
            'opacity-75'
          )}
          animate={{ scale: [1, 2], opacity: [0.75, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    );
  }

  return <div className={indicatorClasses} />;
};

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  className,
}) => {
  return (
    <div className={clsx('flex items-center gap-2 text-sm', className)}>
      <StatusIndicator
        status={isConnected ? 'online' : 'offline'}
        size="sm"
        showPulse={isConnected}
      />
      <span className={clsx(isConnected ? 'text-green-600' : 'text-gray-500')}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}; 