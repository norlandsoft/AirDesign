/**
 * Separator 原语：基于 Radix Separator 的分隔线
 *
 * 支持水平/垂直方向，无障碍语义（role="separator"）。
 * 传入 title 时渲染为"标题 + 线条"的分组分割线（仅水平方向生效），
 * 可用作表单分组分割线；无 title 时为纯线条（向后兼容）。
 *
 * 设计思路：无 title 复用 Radix Separator Root（线条 + 无障碍语义）；
 * 有 title 时外层 flex 容器承载标题与一条 flex-1 线条，titleAlign 控制
 * 标题位置（left=标题在左+右侧长线；center=两侧等长线）。
 *
 * @author ChaiMingXu, 2026/06/30
 */
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import {cn} from '../lib/cn'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    /** 可选标题：传入后渲染为"标题 + 线条"的分组分割线（仅水平方向生效） */
    title?: React.ReactNode
    /** 标题位置，默认 left（标题在左 + 右侧长线）；center 为两侧等长线 */
    titleAlign?: 'left' | 'center'
  }
>(
  (
    {className, orientation = 'horizontal', decorative = true, title, titleAlign = 'left', ...props},
    ref,
  ) => {
    // 有标题且水平：渲染"标题 + 线条"组合（表单分组分割线）
    if (title && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          role={decorative ? undefined : 'separator'}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          {titleAlign === 'center' && (
            <SeparatorPrimitive.Root
              decorative
              orientation="horizontal"
              className="shrink-0 h-px flex-1 bg-border"
            />
          )}
          <span className="whitespace-nowrap text-sm font-medium text-foreground">{title}</span>
          <SeparatorPrimitive.Root
            decorative
            orientation="horizontal"
            className="shrink-0 h-px flex-1 bg-border"
          />
        </div>
      )
    }
    // 无标题（或垂直方向忽略 title）：纯线条，行为与改造前一致
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    )
  },
)
Separator.displayName = 'Separator'

export {Separator}
