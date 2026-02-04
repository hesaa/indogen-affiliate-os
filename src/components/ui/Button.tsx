import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'secondary' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
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
      outline: 'border border-input bg-background hover:bg-accent focus:ring-primary'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2',
      lg: 'px-6 py-3 text-base'
    }

    const iconClasses = 'h-4 w-4'

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
        {loading ? (
          <Loader2 className={iconClasses} />
        ) : iconPosition === 'left' && icon ? (
          <>
            {React.cloneElement(icon, { className: iconClasses })}
            <span className="ml-2">{children}</span>
          </>
        ) : iconPosition === 'right' && icon ? (
          <>
            <span className="mr-2">{children}</span>
            {React.cloneElement(icon, { className: iconClasses })}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }