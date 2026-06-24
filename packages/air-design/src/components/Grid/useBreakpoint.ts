/**
 * useBreakpoint Hook
 *
 * 返回各断点在当前视口下是否满足 min-width，对齐 antd Grid.useBreakpoint。
 * 视口快照在 resize 时更新并缓存引用，避免 useSyncExternalStore 无限重渲染。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {useSyncExternalStore} from 'react'
import {BREAKPOINTS, getBreakpointMap} from './breakpoints'
import type {BreakpointMap} from './types'

/** SSR 默认快照（固定引用） */
const SERVER_BREAKPOINT_MAP = getBreakpointMap(BREAKPOINTS.lg)
const SERVER_WIDTH = BREAKPOINTS.lg

const listeners = new Set<() => void>()
let viewportWidth = typeof window !== 'undefined' ? window.innerWidth : SERVER_WIDTH
let breakpointSnapshot: BreakpointMap = getBreakpointMap(viewportWidth)

/** 同步视口宽度与断点快照，仅在宽度变化时替换 snapshot 引用 */
function syncViewport() {
  if (typeof window === 'undefined') return
  const nextWidth = window.innerWidth
  if (nextWidth === viewportWidth) return
  viewportWidth = nextWidth
  breakpointSnapshot = getBreakpointMap(nextWidth)
}

function handleViewportChange() {
  syncViewport()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined
  syncViewport()
  if (listeners.size === 0) {
    window.addEventListener('resize', handleViewportChange)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('resize', handleViewportChange)
    }
  }
}

function getBreakpointSnapshot(): BreakpointMap {
  return breakpointSnapshot
}

function getWidthSnapshot(): number {
  return viewportWidth
}

/** 获取当前视口下的响应式断点匹配情况 */
export function useBreakpoint(): BreakpointMap {
  return useSyncExternalStore(subscribe, getBreakpointSnapshot, () => SERVER_BREAKPOINT_MAP)
}

/** 获取当前视口宽度（便于 Demo 展示） */
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, getWidthSnapshot, () => SERVER_WIDTH)
}
