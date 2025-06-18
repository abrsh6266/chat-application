import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      size = 'md',
      fallback,
      isOnline = false,
      showOnlineStatus = false,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    const avatarClasses = clsx(
      'relative inline-flex items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600 overflow-hidden',
      sizes[size],
      className
    );

    const getInitials = (name?: string) => {
      if (!name) return '?';
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div ref={ref} className={avatarClasses} {...props}>
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="select-none">
            {fallback ? getInitials(fallback) : '?'}
          </span>
        )}
        
        {showOnlineStatus && (
          <span
            className={clsx(
              'absolute bottom-0 right-0 block rounded-full border-2 border-white',
              statusSizes[size],
              isOnline ? 'bg-green-400' : 'bg-gray-400'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 5, size = 'md', ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleAvatars = childrenArray.slice(0, max);
    const hiddenCount = childrenArray.length - max;

    const spacingClasses = {
      xs: '-space-x-1',
      sm: '-space-x-1.5',
      md: '-space-x-2',
      lg: '-space-x-2.5',
      xl: '-space-x-3',
    };

    return (
      <div
        ref={ref}
        className={clsx('flex items-center', spacingClasses[size], className)}
        {...props}
      >
        {visibleAvatars.map((avatar, index) =>
          React.cloneElement(avatar as React.ReactElement, {
            key: index,
            size,
            className: clsx(
              'ring-2 ring-white relative z-10',
              (avatar as React.ReactElement).props.className
            ),
            style: {
              zIndex: visibleAvatars.length - index,
            },
          })
        )}
        
        {hiddenCount > 0 && (
          <Avatar
            size={size}
            fallback={`+${hiddenCount}`}
            className="ring-2 ring-white bg-gray-200 text-gray-600 relative"
            style={{ zIndex: 0 }}
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup'; 