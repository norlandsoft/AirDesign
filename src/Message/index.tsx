/**
 * Message 轻提示组件
 *
 * 页面顶部居中弹出，支持 info / success / error / warning 四种类型。
 * 纯 SVG 图标，零外部依赖；支持堆叠、自动消失和手动销毁。
 *
 * 用法：
 *   import { message } from 'air-design'
 *   message.success('操作成功')
 *   message.error('出错了')
 *   const ref = message.info('可关闭', 0)   // duration=0 不自动关闭
 *   ref.destroy()                            // 手动关闭
 *
 * @author ChaiMingXu, on 2026/05/18
 */
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import './index.less'

/* ------------------------------------------------------------------ */
/*  类型                                                               */
/* ------------------------------------------------------------------ */

type MessageType = 'info' | 'success' | 'error' | 'warning'

interface MessageItem {
  id: number
  type: MessageType
  content: React.ReactNode
  duration: number
  onClose?: () => void
  /** 是否处于退出动画阶段 */
  leaving: boolean
}

interface MessageRef {
  /** 手动关闭此条消息 */
  destroy: () => void
}

/* ------------------------------------------------------------------ */
/*  SVG 图标（stroke 线条风格，1.5px 描边）                              */
/* ------------------------------------------------------------------ */

const ICONS: Record<MessageType, React.ReactNode> = {
  info: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <line x1="10" y1="10" x2="10" y2="14"/>
      <circle cx="10" cy="7" r="0.1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <polyline points="6.5,10.5 9,13 13.5,7.5"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <line x1="7.5" y1="7.5" x2="12.5" y2="12.5"/>
      <line x1="12.5" y1="7.5" x2="7.5" y2="12.5"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3 L18 17 H2 Z"/>
      <line x1="10" y1="9" x2="10" y2="12.5"/>
      <circle cx="10" cy="14.8" r="0.1" fill="currentColor" stroke="none"/>
    </svg>
  ),
}

/* 每种类型的主题色 */
const COLORS: Record<MessageType, { icon: string; bg: string; accent: string }> = {
  info:    { icon: '#1677ff', bg: '#e6f4ff', accent: '#91caff' },
  success: { icon: '#52c41a', bg: '#f6ffed', accent: '#b7eb8f' },
  error:   { icon: '#ff4d4f', bg: '#fff2f0', accent: '#ffa39e' },
  warning: { icon: '#faad14', bg: '#fffbe6', accent: '#ffe58f' },
}

/* ------------------------------------------------------------------ */
/*  DOM 容器管理（单例）                                                 */
/* ------------------------------------------------------------------ */

let containerEl: HTMLDivElement | null = null
let root: Root | null = null

const ensureContainer = () => {
  if (containerEl) return
  containerEl = document.createElement('div')
  containerEl.className = 'air-msg-root'
  document.body.appendChild(containerEl)
  root = createRoot(containerEl)
}

/* ------------------------------------------------------------------ */
/*  状态管理                                                           */
/* ------------------------------------------------------------------ */

let uid = 0
let items: MessageItem[] = []

const render = () => {
  if (!root) return
  root.render(
    <div className="air-msg-list">
      {items.map(item => {
        const c = COLORS[item.type]
        return (
          <div
            key={item.id}
            className={`air-msg-item${item.leaving ? ' air-msg-item--leave' : ''}`}
            style={{
              '--msg-icon': c.icon,
              '--msg-bg': c.bg,
              '--msg-accent': c.accent,
            } as React.CSSProperties}
          >
            <span className="air-msg-icon">{ICONS[item.type]}</span>
            <span className="air-msg-text">{item.content}</span>
          </div>
        )
      })}
    </div>
  )
}

/* 关闭单条：先播放退出动画，再移除 */
const close = (id: number) => {
  const item = items.find(m => m.id === id)
  if (!item || item.leaving) return

  item.leaving = true
  render()

  setTimeout(() => {
    const closed = items.find(m => m.id === id)
    items = items.filter(m => m.id !== id)
    render()
    closed?.onClose?.()

    // 全部关闭后卸载容器
    if (items.length === 0 && containerEl && root) {
      root.unmount()
      containerEl.remove()
      containerEl = null
      root = null
    }
  }, 280)
}

/* 打开一条消息 */
const open = (
  type: MessageType,
  content: React.ReactNode,
  duration = 3,
  onClose?: () => void,
): MessageRef => {
  const id = ++uid
  items = [...items, {id, type, content, duration, onClose, leaving: false}]
  ensureContainer()
  render()

  if (duration > 0) {
    setTimeout(() => close(id), duration * 1000)
  }

  return {destroy: () => close(id)}
}

/* 销毁全部 */
const destroyAll = () => {
  items = []
  if (containerEl && root) {
    root.unmount()
    containerEl.remove()
    containerEl = null
    root = null
  }
}

/* ------------------------------------------------------------------ */
/*  对外 API                                                           */
/* ------------------------------------------------------------------ */

const message = {
  info:     (content: React.ReactNode, duration?: number, onClose?: () => void) => open('info', content, duration, onClose),
  success:  (content: React.ReactNode, duration?: number, onClose?: () => void) => open('success', content, duration, onClose),
  error:    (content: React.ReactNode, duration?: number, onClose?: () => void) => open('error', content, duration, onClose),
  warning:  (content: React.ReactNode, duration?: number, onClose?: () => void) => open('warning', content, duration, onClose),
  destroy:  (key?: number) => key ? close(key) : destroyAll(),
  destroyAll,
}

export default message
