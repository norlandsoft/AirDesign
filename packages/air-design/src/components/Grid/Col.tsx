/**
 * Grid Col 列
 *
 * 24 栅格列，支持 span / offset / order / push / pull / flex 及 xs–xxxl 响应式配置。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useMemo} from 'react'
import {cn} from '@/lib/cn'
import {useRowContext} from './context'
import {buildColStyle, resolveColConfig} from './resolveProps'
import {useViewportWidth} from './useBreakpoint'
import type {ColProps} from './types'

const Col = forwardRef<HTMLDivElement, ColProps>((props, ref) => {
  const {
    className,
    style,
    children,
    span,
    offset,
    order,
    push,
    pull,
    flex,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    xxxl,
    ...rest
  } = props
  const {gutter} = useRowContext()
  const width = useViewportWidth()

  const colStyle = useMemo(() => {
    const config = resolveColConfig(
      {span, offset, order, push, pull, flex, xs, sm, md, lg, xl, xxl, xxxl},
      width
    )
    return buildColStyle(config, gutter[0], gutter[1])
  }, [span, offset, order, push, pull, flex, xs, sm, md, lg, xl, xxl, xxxl, width, gutter])

  return (
    <div ref={ref} className={cn('air-col', className)} style={{...colStyle, ...style}} {...rest}>
      {children}
    </div>
  )
})
Col.displayName = 'Col'

export default Col
