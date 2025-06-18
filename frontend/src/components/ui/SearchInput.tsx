import React from 'react';
import { clsx } from 'clsx';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { IconButton } from './IconButton';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onClear,
      showClearButton = true,
      isLoading = false,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const hasValue = Boolean(value && value.toString().length > 0);

    return (
      <div className={clsx('relative', { 'w-full': fullWidth })}>
        <Input
          ref={ref}
          type="text"
          value={value}
          leftIcon={<Search className="h-4 w-4" />}
          className={clsx('pr-10', className)}
          fullWidth={fullWidth}
          {...props}
        />
        
        {hasValue && showClearButton && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <IconButton
              icon={<X className="h-4 w-4" />}
              size="sm"
              variant="ghost"
              onClick={onClear}
              type="button"
              disabled={isLoading}
            />
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput'; 