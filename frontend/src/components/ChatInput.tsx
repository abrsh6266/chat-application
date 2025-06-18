import React from 'react';
import { clsx } from 'clsx';
import { Send } from 'lucide-react';
import { Textarea, IconButton } from './ui';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
  isLoading = false,
  className,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Handle typing indicators
    if (newValue.trim()) {
      onStartTyping?.();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 3000);
    } else {
      onStopTyping?.();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        // Send message with Enter
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled || isLoading) return;
    
    onSend();
    onStopTyping?.();
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = value.trim() && !disabled && !isLoading;

  return (
    <div className={clsx('flex items-end gap-2 p-4 bg-white border-t border-gray-200', className)}>

      {/* Input Area */}
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          resize="none"
          className="pr-12 min-h-[40px] max-h-32 overflow-y-auto"
          rows={1}
          style={{
            height: 'auto',
            minHeight: '40px',
            maxHeight: '128px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
          }}
        />


      </div>

      {/* Send Button */}
      <IconButton
        icon={<Send />}
        variant={canSend ? 'primary' : 'ghost'}
        size="md"
        onClick={handleSend}
        disabled={!canSend}
        isLoading={isLoading}
        className="mb-2"
      />
    </div>
  );
}; 