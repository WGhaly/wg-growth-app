import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'w-full px-4 py-2.5 bg-bg-secondary text-text-primary border rounded-lg transition-all duration-200',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error 
                ? 'border-semantic-error focus:ring-semantic-error' 
                : 'border-border-default hover:border-border-strong',
              icon && 'pl-10',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-semantic-error">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
