/**
 * Grid 栅格类型定义
 *
 * API 对齐 antd Row / Col / useBreakpoint。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'

/** 响应式断点 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

/** Row 水平排列 */
export type RowJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'

/** Row 垂直对齐 */
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'

/** 响应式值：单值或按断点映射 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/** 栅格 gutter：水平间距、或 [水平, 垂直]、或响应式对象 */
export type Gutter = number | string | GutterObject | [Gutter, Gutter]

type GutterObject = Partial<Record<Breakpoint, number | string>>

/** Col 响应式配置对象 */
export interface ColSizeConfig {
  span?: number
  offset?: number
  order?: number
  push?: number
  pull?: number
  flex?: string | number
}

/** Col 响应式 span 简写：数字或配置对象 */
export type ColSize = number | ColSizeConfig

/** Row Props */
export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** 栅格间隔，支持数字、CSS 单位字符串、响应式对象或 [水平, 垂直] 数组 */
  gutter?: Gutter
  /** 水平排列方式 */
  justify?: ResponsiveValue<RowJustify>
  /** 垂直对齐方式 */
  align?: ResponsiveValue<RowAlign>
  /** 是否自动换行，默认 true */
  wrap?: boolean
}

/** Col Props */
export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  span?: number
  offset?: number
  order?: number
  push?: number
  pull?: number
  flex?: string | number
  xs?: ColSize
  sm?: ColSize
  md?: ColSize
  lg?: ColSize
  xl?: ColSize
  xxl?: ColSize
  xxxl?: ColSize
}

/** useBreakpoint 返回值 */
export type BreakpointMap = Record<Breakpoint, boolean>

/** Row 传递给 Col 的上下文 */
export interface RowContextValue {
  gutter: [number, number]
}

/** 解析后的 Col 布局配置 */
export interface ResolvedColConfig {
  span?: number
  offset: number
  order: number
  push: number
  pull: number
  flex?: string | number
}

/** Col 内联样式 */
export type ColStyleResult = CSSProperties
