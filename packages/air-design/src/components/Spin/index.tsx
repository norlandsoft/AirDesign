/**
 * Spin 加载动画组件
 *
 * 三圆点弹跳指示器，支持：无 children 仅显示动画、有 children 叠加遮罩、fullscreen 全屏遮罩、
 * delay 延迟显示、自定义 indicator。逻辑与旧版一致，样式改为 Tailwind。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState, useEffect, useRef, ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {cn} from '@/lib/cn'

interface SpinProps {
  loading?: boolean
  spinning?: boolean
  label?: string
  description?: ReactNode
  size?: 'small' | 'default' | 'large'
  indicator?: ReactNode
  delay?: number
  fullscreen?: boolean
  children?: ReactNode
  style?: React.CSSProperties
  className?: string
}

const DOT_SIZE = {small: 4, default: 6, large: 8} as const
const GAP = {small: 4, default: 6, large: 8} as const

/** 默认三圆点弹跳动画 */
const DefaultIndicator = ({size}: {size: 'small' | 'default' | 'large'}) => {
  const dot = DOT_SIZE[size]
  return (
    <div className="flex items-center" style={{gap: GAP[size]}}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block rounded-full bg-primary"
          style={{
            width: dot,
            height: dot,
            animation: `air-spin-bounce 1.4s ${i * 0.16}s infinite ease-in-out both`,
          }}
        />
      ))}
    </div>
  )
}

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
  const isLoading = loading ?? spinningProp ?? true
  const [spinning, setSpinning] = useState(() => (!isLoading ? false : !delay))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (isLoading) {
      if (delay) {
        setSpinning(false)
        timerRef.current = setTimeout(() => setSpinning(true), delay)
      } else {
        setSpinning(true)
      }
    } else {
      setSpinning(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isLoading, delay])

  const desc = description ?? label
  const spinIndicator = indicator ?? <DefaultIndicator size={size}/>

  const inner = (
    <div className="flex flex-col items-center gap-2">
      {spinIndicator}
      {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
    </div>
  )

  if (fullscreen) {
    if (!spinning) return null
    return createPortal(
      <div className={cn('fixed inset-0 z-[9999] flex items-center justify-center bg-background/60', className)} style={style}>
        {inner}
      </div>,
      document.body
    )
  }

  if (!children) {
    if (!spinning) return null
    return (
      <div className={cn('flex items-center justify-center', className)} style={style}>
        {inner}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} style={style}>
      {children}
      {spinning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
          {inner}
        </div>
      )}
    </div>
  )
}

export default Spin
