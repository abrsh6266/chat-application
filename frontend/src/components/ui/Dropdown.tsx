import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className,
  menuClassName,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  const menuClasses = clsx(
    'absolute top-full z-50 mt-1 min-w-[200px] rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5',
    alignmentClasses[align],
    menuClassName
  );

  return (
    <div ref={dropdownRef} className={clsx('relative inline-block', className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx('cursor-pointer', { 'cursor-not-allowed opacity-50': disabled })}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className={menuClasses}
          >
            <div onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  disabled,
  ...props
}) => {
  const variants = {
    default: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    danger: 'text-red-700 hover:bg-red-50 hover:text-red-900',
  };

  const itemClasses = clsx(
    'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    className
  );

  return (
    <button className={itemClasses} disabled={disabled} {...props}>
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="flex-1">{children}</span>
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export const DropdownSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={clsx('my-1 h-px bg-gray-200', className)} />;
}; 