/**
 * SplitterBar 分割条
 *
 * 全长 1px 浅色轨道，中段 36px × 3px 稍深把手；操作热区 8px。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React from 'react'
import type {SplitterLayout} from './types'
import {cn} from '../../lib/cn'

export interface SplitterBarProps {
  layout: SplitterLayout
  active?: boolean
  disabled?: boolean
  onMouseDown?: (event: React.MouseEvent) => void
  onTouchStart?: (event: React.TouchEvent) => void
  onDoubleClick?: (event: React.MouseEvent) => void
  style?: React.CSSProperties
}

const SplitterBar: React.FC<SplitterBarProps> = ({
  layout,
  active = false,
  disabled = false,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
  style,
}) => {
  const isHorizontal = layout === 'horizontal'

  return (
    <div
      className={cn(
        'air-splitter-bar',
        isHorizontal ? 'air-splitter-bar-horizontal' : 'air-splitter-bar-vertical',
        active && 'air-splitter-bar-active',
        disabled && 'air-splitter-bar-disabled'
      )}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      style={style}
    >
      <div
        className="air-splitter-dragger"
        onMouseDown={disabled ? undefined : onMouseDown}
        onTouchStart={
          disabled
            ? undefined
            : (event) => {
                event.preventDefault()
                onTouchStart?.(event)
              }
        }
        onDoubleClick={onDoubleClick}
      />
    </div>
  )
}

export default SplitterBar
