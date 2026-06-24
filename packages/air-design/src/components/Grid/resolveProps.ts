/**
 * Grid 响应式属性解析
 *
 * 按视口宽度合并断点配置，对齐 antd 栅格在各级 min-width 下叠加覆盖的行为。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {CSSProperties} from 'react'
import {BREAKPOINT_ORDER, BREAKPOINTS} from './breakpoints'
import type {
  Breakpoint,
  ColProps,
  ColSize,
  ColSizeConfig,
  Gutter,
  ResolvedColConfig,
  ResponsiveValue,
  RowAlign,
  RowJustify,
} from './types'

const GRID_COLUMNS = 24

/** 判断对象是否为按断点划分的 responsive map */
function isBreakpointMap(value: object): boolean {
  return BREAKPOINT_ORDER.some((key) => key in value)
}

/** 将 gutter 字符串解析为像素数（支持 px / rem） */
function parseGutterUnit(value: number | string): number {
  if (typeof value === 'number') return value
  const trimmed = value.trim()
  if (trimmed.endsWith('px')) return parseFloat(trimmed) || 0
  if (trimmed.endsWith('rem')) return (parseFloat(trimmed) || 0) * 16
  const num = parseFloat(trimmed)
  return Number.isNaN(num) ? 0 : num
}

/** 解析单个 gutter 值 */
function resolveGutterValue(value: Gutter | undefined, width: number): number {
  if (value == null) return 0
  if (typeof value === 'number' || typeof value === 'string') return parseGutterUnit(value)
  if (Array.isArray(value)) return resolveGutterValue(value[0], width)
  if (isBreakpointMap(value)) {
    let resolved = 0
    for (const bp of BREAKPOINT_ORDER) {
      if (width >= BREAKPOINTS[bp] && value[bp] != null) {
        resolved = parseGutterUnit(value[bp]!)
      }
    }
    return resolved
  }
  return 0
}

/** 解析 Row gutter 为 [水平, 垂直] 像素间距 */
export function parseGutter(gutter: Gutter | undefined, width: number): [number, number] {
  if (gutter == null) return [0, 0]
  if (Array.isArray(gutter)) {
    return [resolveGutterValue(gutter[0], width), resolveGutterValue(gutter[1], width)]
  }
  return [resolveGutterValue(gutter, width), 0]
}

/** 合并 responsive 单值配置 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  width: number,
  fallback: T
): T {
  if (value == null) return fallback
  if (typeof value !== 'object' || Array.isArray(value)) return value as T
  if (!isBreakpointMap(value)) return value as T

  let resolved = fallback
  const map = value as Partial<Record<Breakpoint, T>>
  for (const bp of BREAKPOINT_ORDER) {
    if (width >= BREAKPOINTS[bp] && map[bp] !== undefined) {
      resolved = map[bp]!
    }
  }
  return resolved
}

/** ColSize 归一化为配置对象 */
export function normalizeColSize(size: ColSize | undefined): ColSizeConfig | undefined {
  if (size == null) return undefined
  if (typeof size === 'number') return {span: size}
  return size
}

/** 根据视口与 Col props 计算最终栅格配置 */
export function resolveColConfig(props: ColProps, width: number): ResolvedColConfig {
  let config: ResolvedColConfig = {
    span: props.span,
    offset: props.offset ?? 0,
    order: props.order ?? 0,
    push: props.push ?? 0,
    pull: props.pull ?? 0,
    flex: props.flex,
  }

  for (const bp of BREAKPOINT_ORDER) {
    if (width < BREAKPOINTS[bp]) continue
    const normalized = normalizeColSize(props[bp])
    if (!normalized) continue
    config = {
      span: normalized.span ?? config.span,
      offset: normalized.offset ?? config.offset,
      order: normalized.order ?? config.order,
      push: normalized.push ?? config.push,
      pull: normalized.pull ?? config.pull,
      flex: normalized.flex ?? config.flex,
    }
  }

  return config
}

/** 栅格占位百分比 */
export function spanPercent(span: number): string {
  return `${(span / GRID_COLUMNS) * 100}%`
}

/** 将 Col 配置转换为内联样式（含水平/垂直 gutter 内边距，对齐 antd） */
export function buildColStyle(
  config: ResolvedColConfig,
  gutterH: number,
  gutterV: number
): CSSProperties {
  const {span, offset, order, push, pull, flex} = config
  const paddingStyle: CSSProperties = {
    paddingLeft: gutterH / 2,
    paddingRight: gutterH / 2,
    paddingTop: gutterV / 2,
    paddingBottom: gutterV / 2,
  }

  if (span === 0) {
    return {
      display: 'none',
      ...paddingStyle,
    }
  }

  const style: CSSProperties = {
    ...paddingStyle,
    order,
    minHeight: 0,
  }

  if (flex !== undefined) {
    if (typeof flex === 'number') {
      style.flex = `${flex} ${flex} auto`
    } else {
      style.flex = flex
    }
  } else if (span != null) {
    const width = spanPercent(span)
    style.flex = `0 0 ${width}`
    style.maxWidth = width
  } else {
    style.flex = '1 1 0'
  }

  if (offset) style.marginInlineStart = spanPercent(offset)
  if (push || pull) {
    style.position = 'relative'
    if (push) style.insetInlineStart = spanPercent(push)
    if (pull) style.insetInlineEnd = spanPercent(pull)
  }

  return style
}

/** Row justify 映射为 flex justify-content */
export function mapRowJustify(value: RowJustify): string {
  switch (value) {
    case 'start':
      return 'flex-start'
    case 'end':
      return 'flex-end'
    default:
      return value
  }
}

/** Row align 映射为 flex align-items */
export function mapRowAlign(value: RowAlign): string {
  switch (value) {
    case 'top':
      return 'flex-start'
    case 'middle':
      return 'center'
    case 'bottom':
      return 'flex-end'
    default:
      return value
  }
}
