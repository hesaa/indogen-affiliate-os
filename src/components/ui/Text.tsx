import React from 'react'
import { cn } from '@/lib/utils'

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'small'

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
    variant?: TextVariant
    className?: string
    children?: React.ReactNode
}

const variantStyles: Record<TextVariant, string> = {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-semibold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold tracking-tight',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    body: 'text-base',
    caption: 'text-sm',
    small: 'text-xs',
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
    ({ as, variant = 'body', className, children, ...props }, ref) => {
        const Component = as || (variant.startsWith('h') ? variant : 'p')

        return React.createElement(
            Component,
            {
                ref,
                className: cn(variantStyles[variant], className),
                ...props,
            },
            children
        )
    }
)

Text.displayName = 'Text'
