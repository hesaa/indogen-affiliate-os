import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Plus, Check, AlertCircle, Loader2 } from 'lucide-react';

// Button component with multiple variants
export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  asChild = false,
  children,
  className,
  ...props
}: {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-blue-600 underline hover:text-blue-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// Card component for dashboard widgets
export function Card({
  children,
  className,
  title,
  description,
  actions,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
      {actions && (
        <div className="px-6 py-4 border-t border-gray-200">{actions}</div>
      )}
    </div>
  );
}

// Badge component for status indicators
export function Badge({
  variant = 'default',
  children,
  className,
  ...props
}: {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-200 text-gray-700',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Input component with validation states
export function Input({
  type = 'text',
  error,
  disabled,
  className,
  ...props
}: {
  type?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        className={cn(
          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100',
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500' : 'border-gray-300',
          disabled && 'cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      />
      {error && (
        <div className="absolute inset-x-0 bottom-full text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
    </div>
  );
}

// Form component with validation support
export function Form({
  children,
  onSubmit,
  className,
  ...props
}: {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  [key: string]: any;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (onSubmit) {
      await onSubmit(e);
    }
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'space-y-6',
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}

// Alert component for notifications
export function Alert({
  variant = 'default',
  children,
  className,
  onClose,
  ...props
}: {
  variant?: 'default' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  [key: string]: any;
}) {
  const variants = {
    default: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div
      className={cn(
        'relative flex items-center p-4 rounded-lg border-l-4',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'success' && <Check className="mr-3 h-5 w-5 text-green-600" />}
      {variant === 'error' && <AlertCircle className="mr-3 h-5 w-5 text-red-600" />}
      {variant === 'warning' && <AlertCircle className="mr-3 h-5 w-5 text-yellow-600" />}
      {variant === 'default' && <AlertCircle className="mr-3 h-5 w-5 text-blue-600" />}

      <div className="flex-1 text-sm text-gray-700">{children}</div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 -mr-1 text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Loading spinner component
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
      sizes[size],
      className
    )} />
  );
}

// Modal component
export function Modal({
  open,
  onClose,
  children,
  title,
  ...props
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  [key: string]: any;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}