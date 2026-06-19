/**
 * Button 原语：shadcn 风格按钮基础件
 *
 * 基于 cva 定义 variant（default/primary/destructive/outline/secondary/ghost/link）
 * 与 size，通过 Radix Slot 支持 asChild 复合渲染。所有业务按钮组件（Button / IconButton /
 * MenuButton / ToggleButton）基于此原语组合。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import {Slot} from '@radix-ui/react-slot'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '../lib/cn'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-[0.75rem] font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70',
        primary: 'border border-primary bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-4 py-0',
        sm: 'h-7 rounded px-3 py-0 text-[0.7rem]',
        lg: 'h-9 rounded px-5 py-0 text-[0.8rem]',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, asChild = false, ...props}, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({variant, size, className}))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export {Button, buttonVariants}
