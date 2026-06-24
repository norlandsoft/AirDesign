/**
 * 表单控件统一样式常量
 *
 * 单行表单控件（Input、Select、NumberInput 等）默认高度 38px，经 CSS 变量 --control-height
 * 驱动，便于全局调整。样式与 air-design Token 保持一致。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {cn} from './cn'

/** 单行控件高度类名（38px） */
export const controlHeightClass = 'h-[var(--control-height)]'

/** 单行文本类控件基础样式 */
export const controlBaseClass = cn(
  controlHeightClass,
  'w-full rounded-[4px] border border-input bg-background px-3 text-sm transition-colors',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

/** 校验失败时的边框样式 */
export const controlErrorClass = 'border-destructive focus-visible:ring-destructive'

/** 校验警告时的边框样式 */
export const controlWarningClass = 'border-amber-500 focus-visible:ring-amber-500'

/** 根据 status 返回边框修饰类 */
export function controlStatusClass(status?: 'error' | 'warning'): string {
  if (status === 'error') return controlErrorClass
  if (status === 'warning') return controlWarningClass
  return ''
}
