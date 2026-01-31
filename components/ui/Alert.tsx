import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, onClose, children, ...props }, ref) => {
    const variantStyles = {
      success: 'bg-green-900/20 border-semantic-success text-semantic-success',
      error: 'bg-red-900/20 border-semantic-error text-semantic-error',
      warning: 'bg-yellow-900/20 border-semantic-warning text-semantic-warning',
      info: 'bg-blue-900/20 border-semantic-info text-semantic-info'
    };

    const icons = {
      success: <CheckCircle2 size={20} />,
      error: <AlertCircle size={20} />,
      warning: <AlertTriangle size={20} />,
      info: <Info size={20} />
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative p-4 border-l-4 rounded-r-lg flex items-start gap-3',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0 mt-0.5">
          {icons[variant]}
        </div>
        
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm opacity-90">
            {children}
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
