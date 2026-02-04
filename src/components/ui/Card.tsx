import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { InformationCircle, TrendingUp, Users, Clock } from 'lucide-react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  variant?: 'default' | 'elevated' | 'borderless' | 'stats'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  action?: ReactNode
}

export function Card({
  children,
  className,
  title,
  description,
  variant = 'default',
  size = 'md',
  icon,
  action,
}: CardProps) {
  const baseClasses = 'rounded-lg border bg-white dark:bg-gray-900 shadow-sm'
  const variantClasses = {
    default: 'border-gray-200 dark:border-gray-700',
    elevated: 'shadow-lg border-gray-200 dark:border-gray-700',
    borderless: 'border-0 shadow-none',
    stats: 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900/50 dark:to-gray-950',
  }
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {(title || description || icon) && (
        <div className="mb-4 last:mb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="text-sm text-gray-500 dark:text-gray-400">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}