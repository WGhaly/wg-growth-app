import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Button Variants
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary active:scale-95 tap-highlight touch-target';
    
    const variantStyles = {
      primary: 'bg-accent-primary text-bg-primary hover:bg-accent-hover active:bg-accent-active focus:ring-accent-primary shadow-lg shadow-accent-primary/20',
      secondary: 'bg-bg-tertiary text-text-primary border border-border-default hover:bg-bg-secondary active:bg-bg-primary focus:ring-accent-primary',
      text: 'text-accent-primary hover:text-accent-hover active:text-accent-active focus:ring-accent-primary',
      danger: 'bg-semantic-error text-white hover:bg-red-700 active:bg-red-800 focus:ring-semantic-error shadow-lg shadow-semantic-error/20'
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-5 py-3 text-base min-h-[44px]',
      lg: 'px-6 py-4 text-lg min-h-[52px]'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
