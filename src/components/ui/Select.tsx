import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  label?: string
  description?: string
  error?: string
  className?: string
  placeholder?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string | number) => void
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, description, error, options, placeholder, value, defaultValue, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState<string | number | undefined>(value ?? defaultValue)

    useEffect(() => {
      if (value !== undefined && internalValue !== value) {
        setInternalValue(value)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value
      setInternalValue(selectedValue)
      onChange?.(selectedValue)
    }

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={internalValue}
            onChange={handleChange}
            className={cn(
              'appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-error',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center justify-center px-3 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'