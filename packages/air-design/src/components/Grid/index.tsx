/**
 * Grid 栅格布局模块入口
 *
 * 导出 Row / Col 与 useBreakpoint，API 对齐 antd Grid。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import Row from './Row'
import Col from './Col'
import {useBreakpoint, useViewportWidth} from './useBreakpoint'
import {getActiveBreakpoint} from './breakpoints'

/** 与 antd Grid 命名空间一致，提供 useBreakpoint */
export const Grid = {
  useBreakpoint,
}

export default Grid
export {Row, Col, useBreakpoint, useViewportWidth, getActiveBreakpoint}
export type {
  RowProps,
  ColProps,
  ColSize,
  ColSizeConfig,
  Gutter,
  Breakpoint,
  BreakpointMap,
  RowJustify,
  RowAlign,
  ResponsiveValue,
} from './types'
