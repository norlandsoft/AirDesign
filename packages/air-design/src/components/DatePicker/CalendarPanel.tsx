/**
 * CalendarPanel 日历面板
 *
 * 月视图日期选择，支持年/月快速切换与范围高亮。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useMemo, useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {
  addMonths,
  addYears,
  buildMonthMatrix,
  getDecadeStart,
  isDateInRange,
  isSameDay,
  isValidDate,
  stripTime,
} from './dateUtils'
import './DatePicker.css'

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

type PanelMode = 'date' | 'month' | 'year'

export interface CalendarPanelProps {
  viewDate: Date
  onViewDateChange: (date: Date) => void
  mode?: 'single' | 'range'
  selectedDate?: Date | null
  rangeValue?: [Date | null, Date | null] | null
  hoverDate?: Date | null
  onHoverDate?: (date: Date | null) => void
  onSelectDate: (date: Date) => void
  disabledDate?: (date: Date) => boolean
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({
  viewDate,
  onViewDateChange,
  mode = 'single',
  selectedDate,
  rangeValue,
  hoverDate,
  onHoverDate,
  onSelectDate,
  disabledDate,
}) => {
  const [panelMode, setPanelMode] = useState<PanelMode>('date')
  const [decadeStart, setDecadeStart] = useState(() => getDecadeStart(viewDate.getFullYear()))

  const cells = useMemo(() => buildMonthMatrix(viewDate), [viewDate])
  const rowCount = Math.ceil(cells.length / 7)
  const today = useMemo(() => stripTime(new Date()), [])
  const [rangeStart, rangeEnd] = rangeValue ?? [null, null]
  const previewEnd = rangeStart && !rangeEnd ? hoverDate : null

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const isSelected = (date: Date) => {
    if (mode === 'single') return selectedDate != null && isSameDay(date, selectedDate)
    if (rangeStart && isSameDay(date, rangeStart)) return true
    if (rangeEnd && isSameDay(date, rangeEnd)) return true
    if (previewEnd && rangeStart && isSameDay(date, previewEnd)) return true
    return false
  }

  const isInRange = (date: Date) => {
    if (mode !== 'range' || !rangeStart) return false
    const end = rangeEnd ?? previewEnd
    if (!end) return false
    return isDateInRange(date, rangeStart, end)
  }

  const handleSelectMonth = (monthIndex: number) => {
    onViewDateChange(new Date(year, monthIndex, 1))
    setPanelMode('date')
  }

  const handleSelectYear = (selectedYear: number) => {
    onViewDateChange(new Date(selectedYear, month, 1))
    setPanelMode('month')
  }

  const renderHeader = () => {
    if (panelMode === 'year') {
      return (
        <div className="air-date-picker-header">
          <button
            type="button"
            className="air-date-picker-nav"
            aria-label="上一个十年"
            onClick={() => setDecadeStart((prev) => prev - 10)}
          >
            <Icon name="arrow_left" size={14}/>
          </button>
          <div className="air-date-picker-title">
            {decadeStart}年 - {decadeStart + 9}年
          </div>
          <button
            type="button"
            className="air-date-picker-nav"
            aria-label="下一个十年"
            onClick={() => setDecadeStart((prev) => prev + 10)}
          >
            <Icon name="arrow_right" size={14}/>
          </button>
        </div>
      )
    }

    if (panelMode === 'month') {
      return (
        <div className="air-date-picker-header">
          <button
            type="button"
            className="air-date-picker-nav"
            aria-label="上一年"
            onClick={() => onViewDateChange(addYears(viewDate, -1))}
          >
            <Icon name="arrow_left" size={14}/>
          </button>
          <button
            type="button"
            className="air-date-picker-title air-date-picker-title-btn"
            onClick={() => {
              setDecadeStart(getDecadeStart(year))
              setPanelMode('year')
            }}
          >
            {year}年
          </button>
          <button
            type="button"
            className="air-date-picker-nav"
            aria-label="下一年"
            onClick={() => onViewDateChange(addYears(viewDate, 1))}
          >
            <Icon name="arrow_right" size={14}/>
          </button>
        </div>
      )
    }

    return (
      <div className="air-date-picker-header air-date-picker-header-date">
        <button
          type="button"
          className="air-date-picker-nav"
          aria-label="上一年"
          onClick={() => onViewDateChange(addYears(viewDate, -1))}
        >
          «
        </button>
        <button
          type="button"
          className="air-date-picker-nav"
          aria-label="上个月"
          onClick={() => onViewDateChange(addMonths(viewDate, -1))}
        >
          <Icon name="arrow_left" size={14}/>
        </button>
        <div className="air-date-picker-title-group">
          <button
            type="button"
            className="air-date-picker-title-btn"
            onClick={() => {
              setDecadeStart(getDecadeStart(year))
              setPanelMode('year')
            }}
          >
            {year}年
          </button>
          <button
            type="button"
            className="air-date-picker-title-btn"
            onClick={() => setPanelMode('month')}
          >
            {month + 1}月
          </button>
        </div>
        <button
          type="button"
          className="air-date-picker-nav"
          aria-label="下个月"
          onClick={() => onViewDateChange(addMonths(viewDate, 1))}
        >
          <Icon name="arrow_right" size={14}/>
        </button>
        <button
          type="button"
          className="air-date-picker-nav"
          aria-label="下一年"
          onClick={() => onViewDateChange(addYears(viewDate, 1))}
        >
          »
        </button>
      </div>
    )
  }

  const renderYearPanel = () => {
    const years = Array.from({length: 12}, (_, index) => decadeStart - 1 + index)
    return (
      <div className="air-date-picker-picker-grid air-date-picker-year-grid">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            className={cn(
              'air-date-picker-picker-cell',
              y === year && 'air-date-picker-picker-cell-selected',
              (y < decadeStart || y > decadeStart + 9) && 'air-date-picker-picker-cell-muted'
            )}
            onClick={() => handleSelectYear(y)}
          >
            {y}
          </button>
        ))}
      </div>
    )
  }

  const renderMonthPanel = () => (
    <div className="air-date-picker-picker-grid air-date-picker-month-grid">
      {MONTH_LABELS.map((label, index) => (
        <button
          key={label}
          type="button"
          className={cn(
            'air-date-picker-picker-cell',
            index === month && 'air-date-picker-picker-cell-selected'
          )}
          onClick={() => handleSelectMonth(index)}
        >
          {label}
        </button>
      ))}
    </div>
  )

  const renderDatePanel = () => (
    <>
      <div className="air-date-picker-week-row">
        {WEEK_LABELS.map((label) => (
          <div key={label} className="air-date-picker-week-cell">
            {label}
          </div>
        ))}
      </div>

      <div
        className="air-date-picker-day-row"
        style={{gridTemplateRows: `repeat(${rowCount}, 1fr)`}}
      >
        {cells.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} className="air-date-picker-day-empty" aria-hidden/>
          }

          const disabled = disabledDate?.(date) ?? false
          const selected = isSelected(date)
          const inRange = isInRange(date) && !selected
          const isToday = isSameDay(date, today)
          const isRangeStart = rangeStart != null && isSameDay(date, rangeStart)
          const isRangeEnd =
            (rangeEnd != null && isSameDay(date, rangeEnd)) ||
            (!rangeEnd && previewEnd != null && isSameDay(date, previewEnd))

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              className={cn(
                'air-date-picker-day',
                isToday && 'air-date-picker-day-today',
                selected && 'air-date-picker-day-selected',
                inRange && 'air-date-picker-day-in-range',
                isRangeStart && 'air-date-picker-day-range-start',
                isRangeEnd && 'air-date-picker-day-range-end'
              )}
              onMouseEnter={() => onHoverDate?.(date)}
              onMouseLeave={() => onHoverDate?.(null)}
              onClick={() => {
                if (!disabled && isValidDate(date)) onSelectDate(stripTime(date))
              }}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </>
  )

  return (
    <div className="air-date-picker-panel">
      {renderHeader()}
      {panelMode === 'year' && renderYearPanel()}
      {panelMode === 'month' && renderMonthPanel()}
      {panelMode === 'date' && renderDatePanel()}
    </div>
  )
}

export default CalendarPanel
