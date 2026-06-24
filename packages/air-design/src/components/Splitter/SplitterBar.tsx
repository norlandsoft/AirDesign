/**
 * SplitterBar 分割条
 *
 * 对齐 antd Splitter 拖拽条：更大热区、hover 高亮、可选折叠按钮、双击重置。
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
  showStartCollapse?: boolean
  showEndCollapse?: boolean
  startCollapsed?: boolean
  endCollapsed?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onMouseDown?: (event: React.MouseEvent) => void
  onTouchStart?: (event: React.TouchEvent) => void
  onDoubleClick?: (event: React.MouseEvent) => void
  onCollapseStart?: () => void
  onCollapseEnd?: () => void
}

/** 默认折叠箭头 */
function CollapseGlyph({direction}: {direction: 'start' | 'end'}) {
  const rotate = direction === 'start' ? 'rotate-0' : 'rotate-180'
  return (
    <svg
      className={cn('h-2.5 w-2.5', rotate)}
      viewBox="0 0 8 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 1L2 5l4 4" />
    </svg>
  )
}

const SplitterBar: React.FC<SplitterBarProps> = ({
  layout,
  active = false,
  disabled = false,
  showStartCollapse = false,
  showEndCollapse = false,
  startCollapsed = false,
  endCollapsed = false,
  startIcon,
  endIcon,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
  onCollapseStart,
  onCollapseEnd,
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
    >
      {showStartCollapse && (
        <button
          type="button"
          className="air-splitter-collapse air-splitter-collapse-start"
          onClick={(event) => {
            event.stopPropagation()
            onCollapseStart?.()
          }}
          aria-label={startCollapsed ? '展开面板' : '折叠面板'}
        >
          {startIcon ?? <CollapseGlyph direction={startCollapsed ? 'end' : 'start'} />}
        </button>
      )}

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

      {showEndCollapse && (
        <button
          type="button"
          className="air-splitter-collapse air-splitter-collapse-end"
          onClick={(event) => {
            event.stopPropagation()
            onCollapseEnd?.()
          }}
          aria-label={endCollapsed ? '展开面板' : '折叠面板'}
        >
          {endIcon ?? <CollapseGlyph direction={endCollapsed ? 'start' : 'end'} />}
        </button>
      )}
    </div>
  )
}

export default SplitterBar
