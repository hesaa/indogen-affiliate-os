import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface TextareaProps {
  className?: string
  defaultValue?: string
  disabled?: boolean
  id?: string
  name?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  rows?: number
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyUp?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyPress?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      id,
      name,
      placeholder,
      readOnly,
      required,
      resize = 'vertical',
      rows = 3,
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      ...props
    },
    ref
  ) => {
    return (
      <textarea
        className={cn(
          'block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-{resize} transition-colors',
          className
        )}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onKeyPress={onKeyPress}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }