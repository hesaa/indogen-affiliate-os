import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      type = 'text',
      label,
      error,
      description,
      icon,
      className,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id || name}
            className="text-sm font-medium text-muted-foreground"
          >
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={id || name}
            name={name}
            type={type}
            required={required}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger ring-offset-danger focus-visible:ring-danger',
              className
            )}
            ref={ref}
            {...props}
          />
          {icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <div className="flex items-center text-xs text-danger">
            <AlertCircle className="mr-1 h-3 w-3" />
            {error}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }