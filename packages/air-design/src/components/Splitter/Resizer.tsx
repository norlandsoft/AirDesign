/**
 * Resizer 分割条拖拽手柄
 *
 * 逻辑与旧版一致，样式改为内联（基于设计 Token）。垂直分割时为竖条、横向光标；
 * 水平分割时为横条、纵向光标。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'

export const RESIZER_DEFAULT_CLASSNAME = 'Resizer'

interface ResizerProps {
  className?: string
  onClick?: (event: React.MouseEvent) => void
  onDoubleClick?: (event: React.MouseEvent) => void
  onMouseDown: (event: React.MouseEvent) => void
  onTouchStart: (event: React.TouchEvent) => void
  onTouchEnd: (event: React.TouchEvent) => void
  split?: 'vertical' | 'horizontal'
  style?: React.CSSProperties
  resizerClassName?: string
}

class Resizer extends React.Component<ResizerProps> {
  static defaultProps = {
    resizerClassName: RESIZER_DEFAULT_CLASSNAME,
  }

  render() {
    const {
      className,
      onClick,
      onDoubleClick,
      onMouseDown,
      onTouchEnd,
      onTouchStart,
      resizerClassName,
      split,
      style,
    } = this.props

    const classes = [resizerClassName, split, className].filter(Boolean).join(' ')

    /** 默认手柄样式：基于 Token 的细条，hover 高亮 */
    const baseStyle: React.CSSProperties =
      split === 'vertical'
        ? {
            width: 3,
            margin: '0 -1px',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 1,
            background: 'var(--color-border)',
          }
        : {
            height: 3,
            margin: '-1px 0',
            cursor: 'row-resize',
            position: 'relative',
            zIndex: 1,
            background: 'var(--color-border)',
          }

    return (
      <span
        role="presentation"
        className={classes}
        style={{...baseStyle, ...style}}
        onMouseDown={(event) => onMouseDown(event)}
        onTouchStart={(event) => {
          event.preventDefault()
          onTouchStart(event)
        }}
        onTouchEnd={(event) => {
          event.preventDefault()
          onTouchEnd(event)
        }}
        onClick={(event) => {
          if (onClick) {
            event.preventDefault()
            onClick(event)
          }
        }}
        onDoubleClick={(event) => {
          if (onDoubleClick) {
            event.preventDefault()
            onDoubleClick(event)
          }
        }}
      />
    )
  }
}

export default Resizer
