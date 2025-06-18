import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator } from './ui';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isOwn: boolean;
  showUser?: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  className?: string;
}

export const Message: React.FC<MessageProps> = ({
  message,
  isOwn,
  showUser = true,
  onDelete,
  onEdit,
  className,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'group flex gap-3 px-4 py-2 hover:bg-gray-50',
        {
          'flex-row-reverse': isOwn,
        },
        className
      )}
    >
      {/* Avatar */}
      {showUser && (
        <div className="flex-shrink-0">
          <Avatar
            fallback={message.user.username}
            size="sm"
          />
        </div>
      )}

      {/* Message Content */}
      <div className={clsx('flex-1 min-w-0', { 'text-right': isOwn })}>
        {/* Header */}
        {showUser && (
          <div className={clsx('flex items-center gap-2 mb-1', { 'justify-end': isOwn })}>
            <span className="text-sm font-semibold text-gray-900">
              {message.user.username}
            </span>
            <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
          </div>
        )}

        {/* Message Text */}
        <div
          className={clsx(
            'inline-block max-w-xs sm:max-w-md lg:max-w-lg px-3 py-2 rounded-lg text-sm',
            {
              'bg-primary-600 text-white rounded-br-sm': isOwn,
              'bg-gray-200 text-gray-900 rounded-bl-sm': !isOwn,
            }
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp for messages without user info */}
        {!showUser && (
          <div className={clsx('mt-1', { 'text-right': isOwn })}>
            <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
          </div>
        )}
      </div>

      {/* Actions Menu */}
      {isOwn && (onDelete || onEdit) && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Dropdown
            trigger={
              <button className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
            }
            align="right"
          >
            {onEdit && (
              <DropdownItem
                leftIcon={<Edit3 className="h-4 w-4" />}
                onClick={() => onEdit(message.id)}
              >
                Edit message
              </DropdownItem>
            )}
            
            {onEdit && onDelete && <DropdownSeparator />}
            
            {onDelete && (
              <DropdownItem
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => onDelete(message.id)}
              >
                Delete message
              </DropdownItem>
            )}
          </Dropdown>
        </div>
      )}
    </motion.div>
  );
}; 