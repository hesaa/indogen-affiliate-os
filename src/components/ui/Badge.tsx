import { ReactNode } from 'react'
import { Check, Clock, AlertTriangle, X } from 'lucide-react'

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error'
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function Badge({
  variant = 'default',
  children,
  icon,
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors'
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const iconMap: Record<string, ReactNode> = {
    success: <Check className="w-4 h-4 mr-1" />,
    warning: <Clock className="w-4 h-4 mr-1" />,
    error: <AlertTriangle className="w-4 h-4 mr-1" />,
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {icon || iconMap[variant]}
      {children}
    </span>
  )
}