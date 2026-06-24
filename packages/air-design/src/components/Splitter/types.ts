/**
 * Splitter 类型定义
 *
 * API 对齐 antd Splitter / Splitter.Panel。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {CSSProperties, ReactNode} from 'react'

/** 布局方向：horizontal 左右分栏，vertical 上下分栏 */
export type SplitterLayout = 'horizontal' | 'vertical'

/** Panel 是否允许折叠（不渲染折叠按钮，由外部或 onCollapse 配合控制） */
export type PanelCollapsible = boolean

/** Splitter.Panel Props */
export interface SplitterPanelProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** 初始尺寸：数字 px 或百分比字符串如 40% */
  defaultSize?: number | string
  /** 受控尺寸 */
  size?: number | string
  min?: number | string
  max?: number | string
  /** 是否可拖拽调整相邻尺寸 */
  resizable?: boolean
  /** 是否可折叠 */
  collapsible?: PanelCollapsible
}

/** Splitter 根组件 Props */
export interface SplitterProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** 布局方向，对齐 antd layout */
  layout?: SplitterLayout
  /** 是否垂直布局（与 layout 二选一，layout 优先） */
  vertical?: boolean
  lazy?: boolean
  onResize?: (sizes: number[]) => void
  onResizeStart?: (sizes: number[]) => void
  onResizeEnd?: (sizes: number[]) => void
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void
  onDraggerDoubleClick?: (index: number) => void
}

/** Splitter 实例方法（折叠操作，无内置折叠按钮） */
export interface SplitterRef {
  /** 折叠指定面板（需 Panel 设置 collapsible） */
  collapsePanel: (panelIndex: number) => void
  /** 展开指定面板 */
  expandPanel: (panelIndex: number) => void
}

/** 内部解析后的 Panel 配置 */
export interface NormalizedPanelConfig {
  key: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  defaultSize?: number | string
  size?: number | string
  minRaw?: number | string
  maxRaw?: number | string
  resizable: boolean
  collapsible: PanelCollapsible
}
