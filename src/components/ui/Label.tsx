import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { Text } from './Text'

interface LabelProps {
  htmlFor?: string
  required?: boolean
  description?: string
  className?: string
}

const Label = forwardRef<
  HTMLLabelElement,
  LabelProps & React.HTMLAttributes<HTMLLabelElement>
>(({ htmlFor, required, description, className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        'flex flex-col gap-1 text-sm font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-1">
        {children}
        {required && (
          <Text as="span" className="text-danger-foreground" variant="caption">
            *
          </Text>
        )}
      </span>
      {description && (
        <Text as="span" variant="caption" className="text-muted-foreground">
          {description}
        </Text>
      )}
    </label>
  )
})

Label.displayName = 'Label'

export { Label }