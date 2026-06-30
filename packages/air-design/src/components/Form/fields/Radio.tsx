/**
 * Radio 单选框（antd 兼容）
 *
 * 提供 Radio 与 Radio.Group，支持 default / button 两种展示样式。
 * Form.Item 绑定需设置 valuePropName="value"（默认）。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {createContext, forwardRef, useContext} from 'react'
import {cn} from '@/lib/cn'
import {controlHeightClass} from '@/lib/control-styles'
import type {OptionType} from '../types'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string | number | boolean
  children?: React.ReactNode
  /** 由 Radio.Group 注入 */
  checked?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

interface RadioGroupContextValue {
  value?: string | number | boolean
  disabled?: boolean
  name?: string
  optionType?: 'default' | 'button'
  onSelect: (value: string | number | boolean) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

const RadioBase = forwardRef<HTMLInputElement, RadioProps>(
  ({className, children, value, checked, disabled, onChange, ...rest}, ref) => {
    const group = useContext(RadioGroupContext)
    const isChecked = checked ?? (group ? group.value === value : undefined)
    const isDisabled = disabled ?? group?.disabled

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (group && value !== undefined) {
        group.onSelect(value)
      }
      onChange?.(event)
    }

    if (group?.optionType === 'button') {
      return (
        <label
          className={cn(
            'inline-flex cursor-pointer items-center justify-center border border-input px-3 text-sm transition-colors first:rounded-l-[0.25rem] last:rounded-r-[0.25rem]',
            controlHeightClass,
            isChecked ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent',
            isDisabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <input
            ref={ref}
            type="radio"
            className="sr-only"
            value={String(value)}
            checked={!!isChecked}
            disabled={isDisabled}
            name={group.name}
            onChange={handleChange}
            {...rest}
          />
          {children}
        </label>
      )
    }

    return (
      <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm', className)}>
        <input
          ref={ref}
          type="radio"
          className="size-4 accent-[var(--color-primary)]"
          value={String(value)}
          checked={!!isChecked}
          disabled={isDisabled}
          name={group?.name}
          onChange={handleChange}
          {...rest}
        />
        {children ? <span>{children}</span> : null}
      </label>
    )
  }
)
RadioBase.displayName = 'Radio'

export interface RadioGroupProps {
  value?: string | number | boolean
  defaultValue?: string | number | boolean
  onChange?: (value: string | number | boolean) => void
  options?: OptionType[]
  disabled?: boolean
  optionType?: 'default' | 'button'
  name?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  onChange,
  options,
  disabled,
  optionType = 'default',
  name,
  className,
  style,
  children,
}) => {
  const [inner, setInner] = React.useState<string | number | boolean | undefined>(defaultValue)
  const merged = value ?? inner

  const onSelect = (next: string | number | boolean) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  const ctx: RadioGroupContextValue = {
    value: merged,
    disabled,
    name,
    optionType,
    onSelect,
  }

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        className={cn(
          optionType === 'button' ? 'inline-flex overflow-hidden rounded-[0.25rem]' : 'flex flex-col gap-2',
          className
        )}
        style={style}
      >
        {options
          ? options.map((opt) => (
              <RadioBase key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </RadioBase>
            ))
          : children}
      </div>
    </RadioGroupContext.Provider>
  )
}

type RadioComponent = typeof RadioBase & {
  Group: typeof RadioGroup
}

const Radio = RadioBase as RadioComponent
Radio.Group = RadioGroup

export default Radio
export {Radio, RadioGroup}
