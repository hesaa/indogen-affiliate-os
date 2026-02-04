import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Select } from './Select'
import { Label } from './Label'
import { Badge } from './Badge'
import { Check, X, AlertCircle } from 'lucide-react'

export interface FormField {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number'
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
  validation?: (value: string) => string | null
}

export interface FormProps {
  fields: FormField[]
  onSubmit: (values: Record<string, string>) => void | Promise<void>
  submitText: string
  className?: string
  initialValues?: Record<string, string>
  disabled?: boolean
}

export function Form({
  fields,
  onSubmit,
  submitText,
  className,
  initialValues = {},
  disabled = false,
}: FormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))

    if (fields.find(field => field.name === name)?.validation) {
      const error = fields.find(field => field.name === name)?.validation?.(value) || null
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const validateForm = (): boolean => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`
        isValid = false
      }

      if (field.validation && values[field.name]) {
        const error = field.validation(values[field.name])
        if (error) {
          newErrors[field.name] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (disabled || isSubmitting) return

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {fields.map((field) => {
        const hasError = errors[field.name] && touched[field.name]
        const value = values[field.name] || ''

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center justify-between">
              {field.label}
              {field.required && <Badge className="bg-red-100 text-red-800" variant="secondary">Required</Badge>}
            </Label>

            {field.type === 'textarea' && (
              <Textarea
                id={field.name}
                name={field.name}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                disabled={disabled}
                className={cn(hasError && 'border-red-500', 'w-full')}
              />
            )}

            {field.type === 'select' && (
              <Select
                id={field.name}
                name={field.name}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className={cn(hasError && 'border-red-500', 'w-full')}
              >
                {!field.required && <option value="">Select...</option>}
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}

            {(field.type === 'text' || field.type === 'email' || field.type === 'password' || !field.type) && (
              <Input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                disabled={disabled}
                className={cn(hasError && 'border-red-500', 'w-full')}
              />
            )}

            {hasError && (
              <div className="flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1.5 h-4 w-4" />
                {errors[field.name]}
              </div>
            )}
          </div>
        )
      })}

      <Button
        type="submit"
        className="w-full"
        disabled={disabled || isSubmitting}
        loading={isSubmitting}
      >
        {submitText}
      </Button>
    </form>
  )
}