/**
 * Message 轻提示组件
 *
 * 页面顶部居中的 info / success / error / warning 提示，纯 SVG 图标（无外部图标库依赖），
 * 支持堆叠显示与自动消失。命令式 API：Message.info/success/error/warning/destroy/destroyAll。
 * 样式改为 Tailwind，逻辑与旧版一致。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {createRoot, type Root} from 'react-dom/client'

type MessageType = 'info' | 'success' | 'error' | 'warning'

interface MessageItem {
  key: string
  content: React.ReactNode
  duration: number
  onClose?: () => void
  type: MessageType
  closing?: boolean
}

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

/** 类型 → Tailwind 颜色 class（基于设计 Token） */
const TYPE_COLOR: Record<MessageType, string> = {
  info: 'text-primary',
  success: 'text-green-600',
  error: 'text-destructive',
  warning: 'text-amber-600',
}

let container: HTMLDivElement | null = null
let root: Root | null = null
let messages: MessageItem[] = []

const getContainer = () => {
  if (!container) {
    container = document.createElement('div')
    container.className = 'fixed left-1/2 top-4 z-[10000] flex -translate-x-1/2 flex-col items-center gap-2'
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
          className={`flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm transition-all duration-200 ${
            msg.closing ? 'translate-y-[-8px] opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <span className={TYPE_COLOR[msg.type]}>{ICONS[msg.type]}</span>
          <span className="text-foreground">{msg.content}</span>
        </div>
      ))}
    </>
  )
  root.render(<MessageComponent/>)
}

const close = (key: string) => {
  const item = messages.find((m) => m.key === key)
  if (item && !item.closing) {
    item.closing = true
    render()
    setTimeout(() => {
      const closedItem = messages.find((m) => m.key === key)
      messages = messages.filter((m) => m.key !== key)
      render()
      closedItem?.onClose?.()
    }, 220)
  }
}

const showMessage = (
  type: MessageType,
  content: React.ReactNode,
  duration = 2,
  onClose?: () => void
): {key: string; destroy: () => void} => {
  const key = `msg_${Date.now()}_${Math.random()}`
  messages = [...messages, {key, content, duration, onClose, type}]
  getContainer()
  render()
  if (duration > 0) setTimeout(() => close(key), duration * 1000)
  return {key, destroy: () => close(key)}
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

const Message = {
  info: (content: React.ReactNode, duration?: number, onClose?: () => void) => showMessage('info', content, duration, onClose),
  success: (content: React.ReactNode, duration?: number, onClose?: () => void) => showMessage('success', content, duration, onClose),
  error: (content: React.ReactNode, duration?: number, onClose?: () => void) => showMessage('error', content, duration, onClose),
  warning: (content: React.ReactNode, duration?: number, onClose?: () => void) => showMessage('warning', content, duration, onClose),
  destroy: (key?: string) => (key ? close(key) : destroyAll()),
  destroyAll,
}

export default Message
