/**
 * Pane 分割面板子面板
 *
 * Splitter 的单个面板，按 split 方向设置 width/height。逻辑与旧版一致，样式内联。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'

interface PaneProps {
  className?: string
  children: React.ReactNode
  size?: string | number
  split?: 'vertical' | 'horizontal'
  style?: React.CSSProperties
  eleRef?: (ref: HTMLDivElement | null) => void
}

class Pane extends React.PureComponent<PaneProps> {
  render() {
    const {children, className = '', split, style: styleProps, size, eleRef} = this.props

    const classes = ['Pane', split, className].filter(Boolean).join(' ')

    let style: React.CSSProperties = {
      flex: 1,
      position: 'relative',
      outline: 'none',
    }

    if (size !== undefined) {
      if (split === 'vertical') {
        style.width = size
      } else {
        style.height = size
        style.display = 'flex'
      }
      style.flex = 'none'
    }

    style = Object.assign({}, style, styleProps || {})

    return (
      <div ref={eleRef} className={classes} style={style}>
        {children}
      </div>
    )
  }
}

export default Pane
