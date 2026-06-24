/**
 * RangePicker 日期范围选择器
 *
 * 选择开始与结束日期，对齐 antd DatePicker.RangePicker。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo, useState} from 'react'
import {Popover, PopoverContent, PopoverTrigger} from '@/primitives/popover'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {controlBaseClass, controlStatusClass} from '@/lib/control-styles'
import CalendarPanel from './CalendarPanel'
import {
  DEFAULT_DATE_FORMAT,
  formatDate,
  formatRangeText,
  isValidDate,
  startOfMonth,
  stripTime,
} from './dateUtils'
import './DatePicker.css'

export type RangeValue = [Date | null, Date | null] | null

export interface RangePickerProps {
  value?: RangeValue
  defaultValue?: RangeValue
  onChange?: (dates: RangeValue, dateStrings: [string, string]) => void
  format?: string
  placeholder?: [string, string]
  separator?: string
  disabled?: boolean
  allowClear?: boolean
  status?: 'error' | 'warning'
  className?: string
  style?: React.CSSProperties
  id?: string
  disabledDate?: (date: Date) => boolean
}

const RangePicker = forwardRef<HTMLButtonElement, RangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    format = DEFAULT_DATE_FORMAT,
    placeholder = ['开始日期', '结束日期'],
    separator = ' ~ ',
    disabled,
    allowClear = true,
    status,
    className,
    style,
    id,
    disabledDate,
  } = props

  const [open, setOpen] = useState(false)
  const [innerValue, setInnerValue] = useState<RangeValue>(defaultValue ?? null)
  const mergedValue = value !== undefined ? value : innerValue
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [viewDate, setViewDate] = useState<Date>(() => {
    const seed = mergedValue?.[0] ?? mergedValue?.[1]
    return startOfMonth(seed && isValidDate(seed) ? seed : new Date())
  })

  const displayText = useMemo(
    () => formatRangeText(mergedValue, format, separator),
    [mergedValue, format, separator]
  )

  const placeholderText = `${placeholder[0]}${separator}${placeholder[1]}`

  const updateValue = (next: RangeValue) => {
    if (value === undefined) setInnerValue(next)
    const start = next?.[0] ?? null
    const end = next?.[1] ?? null
    onChange?.(next, [formatDate(start, format), formatDate(end, format)])
  }

  const handleSelect = (date: Date) => {
    const picked = stripTime(date)
    const [start, end] = mergedValue ?? [null, null]

    if (!start || (start && end)) {
      updateValue([picked, null])
      return
    }

    if (isSameOrBefore(picked, start)) {
      updateValue([picked, start])
    } else {
      updateValue([start, picked])
    }
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
            {displayText || placeholderText}
          </span>
          <span className="inline-flex items-center gap-1">
            {allowClear && displayText && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                className="inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                aria-label="清除日期范围"
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
          mode="range"
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          rangeValue={mergedValue}
          hoverDate={hoverDate}
          onHoverDate={setHoverDate}
          onSelectDate={handleSelect}
          disabledDate={disabledDate}
        />
      </PopoverContent>
    </Popover>
  )
})

RangePicker.displayName = 'RangePicker'

/** 判断 a 是否早于或等于 b（按日） */
function isSameOrBefore(left: Date, right: Date): boolean {
  return stripTime(left).getTime() <= stripTime(right).getTime()
}

export default RangePicker
