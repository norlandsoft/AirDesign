/**
 * Popover 原语：基于 Radix Popover 的气泡卡片
 *
 * 业务 ColorPicker 等组件基于此原语。点击触发，点击外部关闭，带焦点管理与无障碍属性。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {cn} from '../lib/cn'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({className, align = 'center', sideOffset = 4, ...props}, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export {Popover, PopoverTrigger, PopoverContent, PopoverAnchor}
