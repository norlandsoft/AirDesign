/**
 * Checkbox 复选框（antd 兼容）
 *
 * 提供 Checkbox 与 Checkbox.Group，Group 支持 options 快捷配置。
 * Form.Item 绑定需设置 valuePropName="checked"。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef} from 'react'
import {Checkbox as PrimitiveCheckbox} from '@/primitives/checkbox'
import {cn} from '@/lib/cn'
import type {OptionType} from '../types'

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof PrimitiveCheckbox> {
  children?: React.ReactNode
}

const CheckboxBase = forwardRef<
  React.ElementRef<typeof PrimitiveCheckbox>,
  CheckboxProps
>(({className, children, ...props}, ref) => (
  <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm', className)}>
    <PrimitiveCheckbox ref={ref} {...props} />
    {children ? <span>{children}</span> : null}
  </label>
))
CheckboxBase.displayName = 'Checkbox'

export interface CheckboxGroupProps {
  value?: Array<string | number | boolean>
  defaultValue?: Array<string | number | boolean>
  onChange?: (checkedValues: Array<string | number | boolean>) => void
  options?: OptionType[]
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  defaultValue = [],
  onChange,
  options,
  disabled,
  className,
  style,
  children,
}) => {
  const [inner, setInner] = React.useState<Array<string | number | boolean>>(defaultValue)
  const merged = value ?? inner

  const toggle = (optValue: string | number | boolean, checked: boolean) => {
    const next = checked
      ? [...merged, optValue]
      : merged.filter((item) => item !== optValue)
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  if (options) {
    return (
      <div className={cn('flex flex-col gap-2', className)} style={style}>
        {options.map((opt) => (
          <CheckboxBase
            key={String(opt.value)}
            checked={merged.includes(opt.value)}
            disabled={disabled || opt.disabled}
            onCheckedChange={(checked) => toggle(opt.value, !!checked)}
          >
            {opt.label}
          </CheckboxBase>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)} style={style}>
      {children}
    </div>
  )
}

type CheckboxComponent = typeof CheckboxBase & {
  Group: typeof CheckboxGroup
}

const Checkbox = CheckboxBase as CheckboxComponent
Checkbox.Group = CheckboxGroup

export default Checkbox
export {Checkbox, CheckboxGroup}
