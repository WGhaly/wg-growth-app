import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(
            'w-full px-4 py-2.5 bg-bg-secondary text-text-primary border rounded-lg transition-all duration-200',
            'placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-vertical min-h-[100px]',
            error 
              ? 'border-semantic-error focus:ring-semantic-error' 
              : 'border-border-default hover:border-border-strong',
            className
          )}
          ref={ref}
          {...props}
        />
        
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

Textarea.displayName = 'Textarea';
