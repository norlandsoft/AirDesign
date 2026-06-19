/**
 * Separator 原语：基于 Radix Separator 的分隔线
 *
 * 支持水平/垂直方向，无障碍语义（role="separator"）。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import {cn} from '../lib/cn'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({className, orientation = 'horizontal', decorative = true, ...props}, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export {Separator}
