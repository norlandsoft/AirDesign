/**
 * NumberInput 数字输入框（antd InputNumber 兼容子集）
 *
 * 支持 min/max/step/precision/controls，默认高度 38px。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo} from 'react'
import {cn} from '@/lib/cn'
import {controlBaseClass, controlStatusClass} from '@/lib/control-styles'

export interface NumberInputProps {
  value?: number | null
  defaultValue?: number
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  status?: 'error' | 'warning'
  controls?: boolean
  className?: string
  style?: React.CSSProperties
  id?: string
}

/** 按 precision 格式化数字 */
function formatNumber(value: number, precision?: number): number {
  if (precision == null) return value
  return Number(value.toFixed(precision))
}

/** 约束数值范围与精度 */
function clampValue(value: number, min?: number, max?: number, precision?: number): number {
  let next = value
  if (min != null) next = Math.max(min, next)
  if (max != null) next = Math.min(max, next)
  return formatNumber(next, precision)
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    min,
    max,
    step = 1,
    precision,
    placeholder,
    disabled,
    readOnly,
    status,
    controls = true,
    className,
    style,
    id,
  } = props

  const [inner, setInner] = React.useState<number | null>(defaultValue ?? null)
  const merged = value !== undefined ? value : inner
  const display = merged == null || Number.isNaN(merged) ? '' : String(merged)

  const commit = (next: number | null) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    if (raw === '' || raw === '-') {
      commit(null)
      return
    }
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return
    commit(clampValue(parsed, min, max, precision))
  }

  const handleStep = (direction: 1 | -1) => {
    if (disabled || readOnly) return
    const base = merged ?? 0
    commit(clampValue(base + direction * step, min, max, precision))
  }

  const controlButtons = useMemo(() => {
    if (!controls) return null
    return (
      <span className="flex h-full flex-col border-l border-input">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          className="flex flex-1 items-center justify-center px-2 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50"
          onClick={() => handleStep(1)}
        >
          ▲
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          className="flex flex-1 items-center justify-center border-t border-input px-2 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50"
          onClick={() => handleStep(-1)}
        >
          ▼
        </button>
      </span>
    )
  }, [controls, disabled, readOnly, merged, min, max, step, precision])

  return (
    <span
      className={cn(
        'air-number-input inline-flex w-full overflow-hidden rounded-[4px] border border-input bg-background',
        controlStatusClass(status),
        disabled && 'opacity-50',
        className
      )}
      style={style}
    >
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="decimal"
        className={cn(
          controlBaseClass,
          'border-0 focus-visible:ring-0',
          controls && 'rounded-r-none'
        )}
        value={display}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleInput}
      />
      {controlButtons}
    </span>
  )
})
NumberInput.displayName = 'NumberInput'

export default NumberInput
export {NumberInput}
