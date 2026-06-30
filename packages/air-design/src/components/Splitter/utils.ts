/**
 * Splitter 工具函数
 *
 * 尺寸解析、布局方向映射、Panel 配置归一化。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {isValidElement} from 'react'
import type {NormalizedPanelConfig, PanelCollapsible, SplitterLayout, SplitterPanelProps, SplitterProps} from './types'
import {SPLITTER_PANEL_DISPLAY_NAME} from './SplitterPanel'

/** 分割条占位宽度（px），与样式 air-splitter-bar 操作热区一致 */
export const SPLIT_BAR_SIZE = 8

/** 将 size 字符串或数字解析为像素 */
export function parseSizeValue(value: number | string | undefined, containerSize: number): number | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number') return value
  const trimmed = String(value).trim()
  if (trimmed.endsWith('%')) {
    const percent = parseFloat(trimmed)
    if (Number.isNaN(percent)) return undefined
    return (containerSize * percent) / 100
  }
  const num = parseFloat(trimmed)
  return Number.isNaN(num) ? undefined : num
}

/** 解析 Panel min/max（支持 px 与百分比） */
export function resolvePanelLimit(
  value: number | string | undefined,
  containerSize: number
): number | undefined {
  return parseSizeValue(value, containerSize)
}

/** 约束面板尺寸在 min/max 范围内 */
export function clampPanelSize(
  size: number,
  minRaw?: number | string,
  maxRaw?: number | string,
  containerSize = 0
): number {
  const min = resolvePanelLimit(minRaw, containerSize)
  const max = resolvePanelLimit(maxRaw, containerSize)
  let next = size
  if (min != null) next = Math.max(min, next)
  if (max != null) next = Math.min(max, next)
  return Math.max(0, next)
}

/**
 * 拖拽相邻两面板时调整尺寸，始终保证 left + right === startLeft + startRight
 */
export function resizeAdjacentPanels(
  startLeft: number,
  startRight: number,
  delta: number,
  leftMinRaw?: number | string,
  leftMaxRaw?: number | string,
  rightMinRaw?: number | string,
  rightMaxRaw?: number | string,
  containerSize = 0
): [number, number] {
  const total = startLeft + startRight
  let leftSize = clampPanelSize(startLeft + delta, leftMinRaw, leftMaxRaw, containerSize)
  let rightSize = total - leftSize

  if (rightSize < 0) {
    rightSize = 0
    leftSize = total
    leftSize = clampPanelSize(leftSize, leftMinRaw, leftMaxRaw, containerSize)
    rightSize = total - leftSize
  }

  const minRight = resolvePanelLimit(rightMinRaw, containerSize)
  const maxRight = resolvePanelLimit(rightMaxRaw, containerSize)

  if (minRight != null && rightSize < minRight) {
    rightSize = minRight
    leftSize = total - rightSize
    leftSize = clampPanelSize(leftSize, leftMinRaw, leftMaxRaw, containerSize)
    rightSize = total - leftSize
  } else if (maxRight != null && rightSize > maxRight) {
    rightSize = maxRight
    leftSize = total - rightSize
    leftSize = clampPanelSize(leftSize, leftMinRaw, leftMaxRaw, containerSize)
    rightSize = total - leftSize
  }

  return [Math.max(0, leftSize), Math.max(0, rightSize)]
}

/** 解析 Splitter 布局方向 */
export function resolveSplitterLayout(props: SplitterProps): SplitterLayout {
  if (props.layout) return props.layout
  if (props.vertical) return 'vertical'
  return 'horizontal'
}

/** 判断子节点是否为 Splitter.Panel */
export function isSplitterPanelElement(child: React.ReactNode): child is React.ReactElement<SplitterPanelProps> {
  return (
    isValidElement(child) &&
    typeof child.type === 'function' &&
    (child.type as {displayName?: string}).displayName === SPLITTER_PANEL_DISPLAY_NAME
  )
}

/** 归一化 Panel collapsible 配置 */
export function normalizeCollapsible(value: PanelCollapsible | undefined): PanelCollapsible {
  return Boolean(value)
}

/** 从 React 子元素提取 Panel 配置 */
export function extractPanelConfigs(children: React.ReactNode): NormalizedPanelConfig[] {
  const items = React.Children.toArray(children).filter(isSplitterPanelElement)
  return items.map((child, index) => {
    const {
      className,
      style,
      defaultSize,
      size,
      min,
      max,
      resizable = true,
      collapsible = false,
      children: content,
    } = child.props

    return {
      key: child.key != null ? String(child.key) : `panel-${index}`,
      className,
      style,
      children: content,
      defaultSize,
      size,
      minRaw: min,
      maxRaw: max,
      resizable,
      collapsible: normalizeCollapsible(collapsible),
    }
  })
}

/** 根据 Panel 配置计算初始像素尺寸（分割条浮层不占布局空间，按容器全尺寸分配） */
export function buildInitialSizes(
  panels: NormalizedPanelConfig[],
  containerSize: number,
  collapsed: boolean[]
): number[] {
  const available = Math.max(0, containerSize)
  const explicit = panels.map((panel, index) => {
    if (collapsed[index]) return 0
    const raw = panel.size ?? panel.defaultSize
    return parseSizeValue(raw, containerSize)
  })

  let fixedTotal = 0
  let flexCount = 0
  explicit.forEach((value) => {
    if (value != null) fixedTotal += value
    else flexCount += 1
  })

  const flexUnit = flexCount > 0 ? Math.max(0, available - fixedTotal) / flexCount : 0

  return panels.map((panel, index) => {
    if (collapsed[index]) return 0
    const parsed = explicit[index] ?? flexUnit
    return clampPanelSize(parsed, panel.minRaw, panel.maxRaw, containerSize)
  })
}

/** 将 Panel 受控 size 合并进尺寸数组 */
export function mergeControlledSizes(
  panels: NormalizedPanelConfig[],
  sizes: number[],
  containerSize: number,
  collapsed: boolean[]
): number[] {
  return panels.map((panel, index) => {
    if (collapsed[index]) return 0
    if (panel.size != null) {
      const parsed = parseSizeValue(panel.size, containerSize)
      if (parsed != null) return clampPanelSize(parsed, panel.minRaw, panel.maxRaw, containerSize)
    }
    return sizes[index] ?? 0
  })
}

/** 计算第 index 条分割条在主轴上的中心位置（相邻面板接缝处，px） */
export function getBarCenterOffset(sizes: number[], barIndex: number): number {
  let offset = 0
  for (let i = 0; i <= barIndex; i += 1) {
    offset += sizes[i] ?? 0
  }
  return offset
}
