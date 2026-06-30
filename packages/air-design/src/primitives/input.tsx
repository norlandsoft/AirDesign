/**
 * Input 原语：受控文本输入框
 *
 * 业务 EditableLabel / 表单组件基于此原语。样式经 Token 驱动，支持 disabled 与文件类型。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import {cn} from '../lib/cn'
import {controlBaseClass} from '../lib/control-styles'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>((allProps, ref) => {
  const {className, type, value, defaultValue, onChange, ...rest} = allProps
  // Form.Item 注入 onChange 但 value:undefined 被 cloneElement 省略时，仍须受控空串
  const controlled =
    'value' in allProps || (defaultValue === undefined && onChange != null)
  return (
    <input
      type={type}
      className={cn(
        'flex py-1 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        controlBaseClass,
        className
      )}
      ref={ref}
      onChange={onChange}
      {...rest}
      {...(controlled ? {value: value ?? ''} : defaultValue !== undefined ? {defaultValue} : {})}
    />
  )
})
Input.displayName = 'Input'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({className, ...props}, ref) => (
  <textarea
    className={cn(
      'flex min-h-[3.75rem] w-full rounded-[0.25rem] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export {Input, Textarea}
