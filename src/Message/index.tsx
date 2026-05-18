/**
 * Message 轻提示组件
 *
 * 页面顶部居中的 info / success / error / warning 提示，
 * 纯 SVG 图标，无外部图标库依赖，支持堆叠显示和自动消失。
 *
 * @author ChaiMingXu, on 2026/05/18
 */
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import './index.less'

type MessageType = 'info' | 'success' | 'error' | 'warning'

interface MessageItem {
  key: string
  content: React.ReactNode
  duration: number
  onClose?: () => void
  type: MessageType
  closing?: boolean
}

/* 纯 SVG 图标，无外部依赖 */
const ICONS: Record<MessageType, React.ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.8" fill="currentColor"/>
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1.5 13.5h13L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.7" fill="currentColor"/>
    </svg>
  ),
}

let container: HTMLDivElement | null = null
let root: Root | null = null
let messages: MessageItem[] = []

const getContainer = () => {
  if (!container) {
    container = document.createElement('div')
    container.className = 'air-message-container'
    document.body.appendChild(container)
    root = createRoot(container)
  }
  return container
}

const render = () => {
  if (!root) return

  const MessageComponent = () => (
    <>
      {messages.map((msg) => (
        <div
          key={msg.key}
          className={`air-message-item air-message-item--${msg.type}${msg.closing ? ' air-message-item--closing' : ''}`}
        >
          <span className="air-message-item__icon">{ICONS[msg.type]}</span>
          <span className="air-message-item__content">{msg.content}</span>
        </div>
      ))}
    </>
  )

  root.render(<MessageComponent/>)
}

const close = (key: string) => {
  // 先播放关闭动画，再移除
  const item = messages.find((m) => m.key === key)
  if (item && !item.closing) {
    item.closing = true
    render()
    setTimeout(() => {
      const closedItem = messages.find((m) => m.key === key)
      messages = messages.filter((m) => m.key !== key)
      render()
      closedItem?.onClose?.()
    }, 240)
  }
}

const showMessage = (
  type: MessageType,
  content: React.ReactNode,
  duration = 2,
  onClose?: () => void
): { key: string; destroy: () => void } => {
  const key = `msg_${Date.now()}_${Math.random()}`
  const item: MessageItem = {key, content, duration, onClose, type}

  messages = [...messages, item]
  getContainer()
  render()

  if (duration > 0) {
    setTimeout(() => close(key), duration * 1000)
  }

  return {
    key,
    destroy: () => close(key),
  }
}

const destroyAll = () => {
  messages = []
  if (container && root) {
    root.unmount()
    container.remove()
    container = null
    root = null
  }
}

export default {
  info: (content: React.ReactNode, duration?: number, onClose?: () => void) =>
    showMessage('info', content, duration, onClose),
  success: (content: React.ReactNode, duration?: number, onClose?: () => void) =>
    showMessage('success', content, duration, onClose),
  error: (content: React.ReactNode, duration?: number, onClose?: () => void) =>
    showMessage('error', content, duration, onClose),
  warning: (content: React.ReactNode, duration?: number, onClose?: () => void) =>
    showMessage('warning', content, duration, onClose),
  destroy: (key?: string) => (key ? close(key) : destroyAll()),
  destroyAll,
}
