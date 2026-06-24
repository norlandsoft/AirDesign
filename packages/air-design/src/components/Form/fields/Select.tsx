/**
 * Select 下拉选择（antd 兼容）
 *
 * 单选基于 Radix Select；多选基于 Popover + Checkbox 列表。
 * 支持 options、allowClear、placeholder，默认高度 38px。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo, useState} from 'react'
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/primitives/select'
import {Popover, PopoverContent, PopoverTrigger} from '@/primitives/popover'
import {Checkbox} from '@/primitives/checkbox'
import {cn} from '@/lib/cn'
import {controlBaseClass, controlStatusClass} from '@/lib/control-styles'
import type {SelectOption} from '../types'

export interface SelectProps {
  value?: string | number | (string | number)[] | null
  defaultValue?: string | number | (string | number)[]
  onChange?: (value: string | number | (string | number)[] | null) => void
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  mode?: 'multiple'
  status?: 'error' | 'warning'
  className?: string
  style?: React.CSSProperties
  id?: string
}

function normalizeValue(value: string | number): string {
  return String(value)
}

const SelectSingle = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    options = [],
    placeholder,
    disabled,
    allowClear,
    status,
    className,
    style,
    id,
  } = props

  const [inner, setInner] = useState<string | undefined>(
    defaultValue != null ? normalizeValue(defaultValue as string | number) : undefined
  )
  const merged = value != null && !Array.isArray(value) ? normalizeValue(value) : inner

  const handleChange = (next: string) => {
    if (value === undefined) setInner(next)
    const original = options.find((opt) => normalizeValue(opt.value) === next)
    onChange?.(original?.value ?? next)
  }

  return (
    <div className={cn('relative w-full', className)} style={style}>
      <RadixSelect value={merged} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger
          ref={ref}
          id={id}
          className={cn('air-select-trigger', controlBaseClass, controlStatusClass(status))}
        >
          <SelectValue placeholder={placeholder}/>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={normalizeValue(opt.value)} value={normalizeValue(opt.value)} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
      {allowClear && merged && !disabled ? (
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (value === undefined) setInner(undefined)
            onChange?.(null)
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  )
})
SelectSingle.displayName = 'SelectSingle'

const SelectMultiple: React.FC<SelectProps> = (props) => {
  const {
    value,
    defaultValue,
    onChange,
    options = [],
    placeholder,
    disabled,
    allowClear,
    status,
    className,
    style,
    id,
  } = props

  const [open, setOpen] = useState(false)
  const [inner, setInner] = useState<(string | number)[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue != null ? [defaultValue] : []
  )
  const merged = Array.isArray(value) ? value : value === undefined ? inner : []

  const labelText = useMemo(() => {
    if (!merged.length) return placeholder ?? '请选择'
    return options
      .filter((opt) => merged.map(String).includes(normalizeValue(opt.value)))
      .map((opt) => (typeof opt.label === 'string' ? opt.label : opt.value))
      .join(', ')
  }, [merged, options, placeholder])

  const toggle = (optValue: string | number, checked: boolean) => {
    const key = normalizeValue(optValue)
    const next = checked
      ? [...merged.filter((item) => normalizeValue(item) !== key), optValue]
      : merged.filter((item) => normalizeValue(item) !== key)
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'air-select-trigger inline-flex w-full items-center justify-between text-left',
            controlBaseClass,
            controlStatusClass(status),
            !merged.length && 'text-muted-foreground',
            className
          )}
          style={style}
        >
          <span className="truncate">{labelText}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        {options.map((opt) => {
          const checked = merged.map(String).includes(normalizeValue(opt.value))
          return (
            <label
              key={normalizeValue(opt.value)}
              className="flex cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={checked}
                disabled={opt.disabled || disabled}
                onCheckedChange={(v) => toggle(opt.value, !!v)}
              />
              <span>{opt.label}</span>
            </label>
          )
        })}
      </PopoverContent>
      {allowClear && merged.length > 0 && !disabled ? (
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (value === undefined) setInner([])
            onChange?.([])
          }}
        >
          ×
        </button>
      ) : null}
    </Popover>
  )
}

const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  if (props.mode === 'multiple') {
    return <SelectMultiple {...props} />
  }
  return <SelectSingle ref={ref} {...props} />
})
Select.displayName = 'Select'

export default Select
export {Select}
