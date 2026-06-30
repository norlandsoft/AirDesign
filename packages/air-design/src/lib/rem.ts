/**
 * rem 换算工具
 *
 * 设计基准 16px = 1rem。组件内联样式、动态尺寸应经此工具转为 rem，
 * 与 theme 根字号缩放（--font-scale 小/中/大）联动，避免硬编码 px。
 *
 * @author ChaiMingXu, 2026/06/25
 */

/** 设计稿基准：1rem 对应 16px */
export const REM_BASE = 16

/**
 * 将设计稿像素值转为 rem 字符串（如 16 → '1rem'）
 */
export function toRem(value: number): string {
  if (value === 0) return '0'
  const rem = value / REM_BASE
  const formatted = Number.isInteger(rem) ? rem : parseFloat(rem.toFixed(4))
  return `${formatted}rem`
}

/**
 * 数字转 rem，已是字符串则原样返回
 */
export function toRemCss(value: number | string): string {
  if (typeof value === 'string') return value
  return toRem(value)
}
