import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, Loader2 } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | 'link' | 'primary'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'md'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
      outline: 'border border-input bg-background hover:bg-accent focus:ring-primary',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      primary: 'bg-blue-600 text-white hover:bg-blue-700'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-base',
      icon: 'h-9 w-9'
    }

    const iconClasses = 'h-4 w-4'

    const renderIcon = (iconNode: React.ReactNode) => {
      if (!iconNode) return null
      return React.isValidElement(iconNode)
        ? React.cloneElement(iconNode as React.ReactElement<any>, { className: cn(iconClasses, (iconNode.props as any).className) })
        : iconNode
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className={cn(iconClasses, 'animate-spin mr-2')} />}
        {!loading && (startIcon || (iconPosition === 'left' && icon)) && (
          <span className="mr-2">
            {renderIcon(startIcon || icon)}
          </span>
        )}
        {children}
        {!loading && (endIcon || (iconPosition === 'right' && icon)) && (
          <span className="ml-2">
            {renderIcon(endIcon || icon)}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }