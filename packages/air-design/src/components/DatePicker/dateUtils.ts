/**
 * DatePicker 日期工具函数
 *
 * 格式化、解析与日历网格计算，不依赖 dayjs。
 *
 * @author ChaiMingXu, 2026/06/24
 */

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

const FORMAT_TOKEN_REG = /YYYY|MM|DD/g

/** 判断是否为有效 Date */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime())
}

/** Date 格式化为字符串 */
export function formatDate(date: Date | null | undefined, format = DEFAULT_DATE_FORMAT): string {
  if (!date || !isValidDate(date)) return ''
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return format.replace(FORMAT_TOKEN_REG, (token) => {
    if (token === 'YYYY') return String(year)
    if (token === 'MM') return String(month).padStart(2, '0')
    return String(day).padStart(2, '0')
  })
}

/** 解析 YYYY-MM-DD 字符串为 Date（本地时区） */
export function parseDateString(value: string): Date | null {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!matched) return null
  const date = new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]))
  return isValidDate(date) ? date : null
}

/** 是否同一天 */
export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

/** 日期是否在闭区间内 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const time = stripTime(date).getTime()
  const min = Math.min(stripTime(start).getTime(), stripTime(end).getTime())
  const max = Math.max(stripTime(start).getTime(), stripTime(end).getTime())
  return time >= min && time <= max
}

/** 去除时分秒 */
export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** 月份第一天 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** 偏移年份（保持月为 1 号） */
export function addYears(date: Date, offset: number): Date {
  return new Date(date.getFullYear() + offset, date.getMonth(), 1)
}

/** 取年份所在十年的起始年（如 2024 -> 2020） */
export function getDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10
}

/** 偏移月份（保持日为 1 号，供面板切换使用） */
export function addMonths(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

/** 某月天数 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** 生成月历网格（周日为首列，仅补齐末行，不强制 6 行） */
export function buildMonthMatrix(viewDate: Date): Array<Date | null> {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)
  const cells: Array<Date | null> = []

  for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  const remainder = cells.length % 7
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i += 1) cells.push(null)
  }
  return cells
}

/** 范围展示文案 */
export function formatRangeText(
  range: [Date | null, Date | null] | null | undefined,
  format = DEFAULT_DATE_FORMAT,
  separator = ' ~ '
): string {
  if (!range) return ''
  const [start, end] = range
  if (start && end) return `${formatDate(start, format)}${separator}${formatDate(end, format)}`
  if (start) return `${formatDate(start, format)}${separator}`
  return ''
}
