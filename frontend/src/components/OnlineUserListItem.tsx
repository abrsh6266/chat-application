import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Avatar, StatusIndicator } from './ui';
import { OnlineUser } from '../types';

interface OnlineUserListItemProps {
  user: OnlineUser;
  isTyping: boolean;
  className?: string;
}

export const OnlineUserListItem: React.FC<OnlineUserListItemProps> = ({
  user,
  isTyping,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
        className
      )}
    >
      <div className="relative">
        <Avatar
          fallback={user.username}
          size="sm"
        />
        <div className="absolute -bottom-1 -right-1">
          <StatusIndicator
            status="online"
            size="sm"
            showPulse={false}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {user.username}
          </span>
          {isTyping && (
            <div className="flex items-center gap-1">
              <div className="flex space-x-1">
                <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-primary-600 font-medium">typing</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 