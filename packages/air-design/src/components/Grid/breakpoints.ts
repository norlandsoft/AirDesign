/**
 * Grid 栅格断点常量
 *
 * 对齐 antd / Bootstrap 4 响应式断点（px）。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import type {Breakpoint} from './types'

/** 断点最小宽度（px） */
export const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
  xxxl: 1920,
}

/** 断点从小到大遍历顺序 */
export const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']

/** 根据视口宽度生成各断点是否生效的映射 */
export function getBreakpointMap(width: number): Record<Breakpoint, boolean> {
  return {
    xs: width >= BREAKPOINTS.xs,
    sm: width >= BREAKPOINTS.sm,
    md: width >= BREAKPOINTS.md,
    lg: width >= BREAKPOINTS.lg,
    xl: width >= BREAKPOINTS.xl,
    xxl: width >= BREAKPOINTS.xxl,
    xxxl: width >= BREAKPOINTS.xxxl,
  }
}

/** 获取当前视口宽度对应的主断点名称（用于演示） */
export function getActiveBreakpoint(width: number): Breakpoint {
  let active: Breakpoint = 'xs'
  for (const bp of BREAKPOINT_ORDER) {
    if (width >= BREAKPOINTS[bp]) active = bp
  }
  return active
}
