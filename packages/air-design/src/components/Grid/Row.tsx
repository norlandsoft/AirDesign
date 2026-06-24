/**
 * Grid Row 行容器
 *
 * 基于 Flex 的 24 栅格行，支持 gutter / justify / align / wrap，API 对齐 antd Row。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef} from 'react'
import {cn} from '@/lib/cn'
import {RowContext} from './context'
import {
  mapRowAlign,
  mapRowJustify,
  parseGutter,
  resolveResponsiveValue,
} from './resolveProps'
import {useViewportWidth} from './useBreakpoint'
import type {RowAlign, RowJustify, RowProps} from './types'
import './Grid.css'

const Row = forwardRef<HTMLDivElement, RowProps>((props, ref) => {
  const {
    gutter = 0,
    justify = 'start',
    align = 'top',
    wrap = true,
    className,
    style,
    children,
    ...rest
  } = props

  const width = useViewportWidth()
  const [gutterH, gutterV] = parseGutter(gutter, width)
  const justifyValue = resolveResponsiveValue<RowJustify>(justify, width, 'start')
  const alignValue = resolveResponsiveValue<RowAlign>(align, width, 'top')

  const rowStyle: React.CSSProperties = {
    marginLeft: gutterH ? -gutterH / 2 : undefined,
    marginRight: gutterH ? -gutterH / 2 : undefined,
    marginTop: gutterV ? -gutterV / 2 : undefined,
    marginBottom: gutterV ? -gutterV / 2 : undefined,
    justifyContent: mapRowJustify(justifyValue),
    alignItems: mapRowAlign(alignValue),
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  }

  return (
    <RowContext.Provider value={{gutter: [gutterH, gutterV]}}>
      <div ref={ref} className={cn('air-row', className)} style={rowStyle} {...rest}>
        {children}
      </div>
    </RowContext.Provider>
  )
})
Row.displayName = 'Row'

export default Row
