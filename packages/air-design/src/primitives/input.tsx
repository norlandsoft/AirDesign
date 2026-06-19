/**
 * Input 原语：受控文本输入框
 *
 * 业务 EditableLabel / 表单组件基于此原语。样式经 Token 驱动，支持 disabled 与文件类型。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import {cn} from '../lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({className, type, ...props}, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-[4px] border border-input bg-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({className, ...props}, ref) => (
  <textarea
    className={cn(
      'flex min-h-[60px] w-full rounded-[4px] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export {Input, Textarea}
