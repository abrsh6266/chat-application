import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-400">
          {React.cloneElement(icon as React.ReactElement, {
            className: 'h-12 w-12',
          })}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      )}
      
      {action && <div>{action}</div>}
    </motion.div>
  );
}; 