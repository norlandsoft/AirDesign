/**
 * DatePicker 日期选择器（antd 兼容）
 *
 * 基于 Popover + 月历面板，支持单日选择与受控/非受控模式。
 * RangePicker 见 RangePicker.tsx，挂载为 DatePicker.RangePicker。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo, useState} from 'react'
import {Popover, PopoverContent, PopoverTrigger} from '@/primitives/popover'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {controlBaseClass, controlStatusClass} from '@/lib/control-styles'
import CalendarPanel from './CalendarPanel'
import RangePicker from './RangePicker'
import {
  DEFAULT_DATE_FORMAT,
  formatDate,
  isValidDate,
  startOfMonth,
  stripTime,
} from './dateUtils'
import './DatePicker.css'

export interface DatePickerProps {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null, dateString: string) => void
  format?: string
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  status?: 'error' | 'warning'
  className?: string
  style?: React.CSSProperties
  id?: string
  /** 禁用特定日期 */
  disabledDate?: (date: Date) => boolean
}

const DatePickerBase = forwardRef<HTMLButtonElement, DatePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    format = DEFAULT_DATE_FORMAT,
    placeholder = '请选择日期',
    disabled,
    allowClear = true,
    status,
    className,
    style,
    id,
    disabledDate,
  } = props

  const [open, setOpen] = useState(false)
  const [innerValue, setInnerValue] = useState<Date | null>(defaultValue ?? null)
  const mergedValue = value !== undefined ? value : innerValue
  const [viewDate, setViewDate] = useState<Date>(() =>
    startOfMonth(mergedValue && isValidDate(mergedValue) ? mergedValue : new Date())
  )

  const displayText = useMemo(() => formatDate(mergedValue, format), [mergedValue, format])

  const updateValue = (next: Date | null) => {
    if (value === undefined) setInnerValue(next)
    onChange?.(next, formatDate(next, format))
  }

  const handleSelect = (date: Date) => {
    updateValue(date)
    setOpen(false)
  }

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    updateValue(null)
  }

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'air-date-picker-trigger',
            controlBaseClass,
            controlStatusClass(status),
            className
          )}
          style={style}
        >
          <span className={cn(!displayText && 'air-date-picker-trigger-placeholder')}>
            {displayText || placeholder}
          </span>
          <span className="inline-flex items-center gap-1">
            {allowClear && displayText && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                className="inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                aria-label="清除日期"
              >
                ×
              </span>
            )}
            <Icon name="calendar" size={16}/>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPanel
          mode="single"
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          selectedDate={mergedValue}
          onSelectDate={handleSelect}
          disabledDate={disabledDate}
        />
      </PopoverContent>
    </Popover>
  )
})

DatePickerBase.displayName = 'DatePicker'

type DatePickerComponent = typeof DatePickerBase & {
  RangePicker: typeof RangePicker
}

const DatePicker = DatePickerBase as DatePickerComponent
DatePicker.RangePicker = RangePicker

export default DatePicker
