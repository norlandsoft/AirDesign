/**
 * Spin 加载动画组件
 * 模仿 Ant Design 的 Spin 组件设计，支持包裹 children 内容并在加载时显示遮罩层
 *
 * 使用方式：
 * 1. 无 children：直接显示加载动画（loading=false 时返回 null）
 * 2. 有 children：始终渲染 children，loading=true 时在其上方显示半透明遮罩和加载动画
 *
 * Created by ChaiMingXu 2026/05/27
 */

import React, {useState, useEffect, useRef, ReactNode} from 'react'
import ReactDOM from 'react-dom'
import './index.less'

interface SpinProps {
  /** 是否显示加载状态，默认 true */
  loading?: boolean
  /** 兼容 antd 的 spinning 属性，与 loading 功能相同 */
  spinning?: boolean
  /** 加载提示文字 */
  label?: string
  /** 加载描述文字（与 label 功能相同，兼容 antd 命名） */
  description?: ReactNode
  /** 组件大小：small / default / large */
  size?: 'small' | 'default' | 'large'
  /** 自定义加载指示器，传入后替代默认的三圆点动画 */
  indicator?: ReactNode
  /** 延迟显示加载效果的时间（毫秒），用于防止加载闪烁 */
  delay?: number
  /** 是否以全屏遮罩模式显示，覆盖整个视口 */
  fullscreen?: boolean
  /** 被包裹的内容 */
  children?: ReactNode
  /** 自定义容器样式 */
  style?: React.CSSProperties
  /** 自定义容器类名 */
  className?: string
}

/**
 * 默认的三圆点弹跳动画指示器
 */
const DefaultIndicator = ({size}: { size: string }) => (
  <div className={`air-spin-dots air-spin-dots-${size}`}>
    <span className="air-spin-dot"/>
    <span className="air-spin-dot"/>
    <span className="air-spin-dot"/>
  </div>
)

const Spin: React.FC<SpinProps> = ({
  loading,
  spinning: spinningProp,
  label,
  description,
  size = 'default',
  indicator,
  delay,
  fullscreen = false,
  children,
  style,
  className,
}) => {
  // 兼容 antd 的 spinning 属性，loading 优先
  const isLoading = loading ?? spinningProp ?? true

  /** 延迟控制：实际是否显示加载动画，初始值需要同步 loading 状态 */
  const [spinning, setSpinning] = useState(() => {
    if (!isLoading) return false
    return !delay
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 清理上一次的延迟计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (isLoading) {
      if (delay) {
        // loading=true 且设置了 delay：先不显示，延迟后再显示
        setSpinning(false)
        timerRef.current = setTimeout(() => setSpinning(true), delay)
      } else {
        setSpinning(true)
      }
    } else {
      // loading=false：立即隐藏
      setSpinning(false)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isLoading, delay])

  // 描述文字，优先使用 description，兼容 label
  const desc = description ?? label
  // 渲染的指示器
  const spinIndicator = indicator ?? <DefaultIndicator size={size}/>

  // 全屏模式：使用 React.createPortal 渲染到 body，覆盖整个视口
  if (fullscreen) {
    if (!spinning) return null
    return ReactDOM.createPortal(
      <div className={`air-spin-fullscreen ${className || ''}`} style={style}>
        <div className="air-spin-fullscreen-content">
          <div className={`air-spin air-spin-${size}`}>
            {spinIndicator}
            {desc && <div className="air-spin-label">{desc}</div>}
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // 无 children：仅显示加载动画
  if (!children) {
    if (!spinning) return null
    return (
      <div className={`air-spin air-spin-${size} ${className || ''}`} style={style}>
        {spinIndicator}
        {desc && <div className="air-spin-label">{desc}</div>}
      </div>
    )
  }

  // 有 children：始终渲染 children，loading 时叠加遮罩
  return (
    <div
      className={`air-spin-container ${spinning ? 'air-spin-spinning' : ''} ${className || ''}`}
      style={style}
    >
      <div className="air-spin-children">{children}</div>
      {spinning && (
        <div className="air-spin-overlay">
          <div className={`air-spin air-spin-${size}`}>
            {spinIndicator}
            {desc && <div className="air-spin-label">{desc}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Spin
