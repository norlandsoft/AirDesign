/**
 * Notice 轻提示组件
 *
 * 页面顶部居中弹出，支持 info / success / error / warning 四种类型。
 * 纯 SVG 图标，零外部依赖；支持堆叠、自动消失和手动销毁。
 *
 * 用法：
 *   import { Notice } from 'air-design'
 *   Notice.success('操作成功')
 *   Notice.success('操作成功', '数据已保存到服务器')
 *   Notice.error('操作失败', resp.message)
 *   Notice.destroyAll()
 *
 * @author ChaiMingXu, on 2026/05/18
 */
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import './index.less'

type NoticeType = 'info' | 'success' | 'error' | 'warning'

interface NoticeItem {
  id: number
  type: NoticeType
  title: string
  content: string
  duration: number
  onClose?: () => void
  leaving: boolean
}

interface NoticeRef {
  destroy: () => void
}

/* ------------------------------------------------------------------ */
/*  SVG 图标                                                           */
/* ------------------------------------------------------------------ */

const ICONS: Record<NoticeType, React.ReactNode> = {
  info: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.8" fill="currentColor"/>
    </svg>
  ),
  success: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1.5 13.5h13L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.7" fill="currentColor"/>
    </svg>
  ),
}

/* ------------------------------------------------------------------ */
/*  容器 & 状态管理                                                     */
/* ------------------------------------------------------------------ */

let containerEl: HTMLDivElement | null = null
let root: Root | null = null
let uid = 0
let items: NoticeItem[] = []

const ensureContainer = () => {
  if (containerEl) return
  containerEl = document.createElement('div')
  containerEl.className = 'air-notice-toast-root'
  document.body.appendChild(containerEl)
  root = createRoot(containerEl)
}

const render = () => {
  if (!root) return
  root.render(
    <div className="air-notice-toast-list">
      {items.map(item => (
        <div
          key={item.id}
          className={`air-notice-toast air-notice-toast--${item.type}${item.leaving ? ' air-notice-toast--leave' : ''}`}
        >
          <span className="air-notice-toast__icon">{ICONS[item.type]}</span>
          <div className="air-notice-toast__body">
            {item.title && <div className="air-notice-toast__title">{item.title}</div>}
            {item.content && <div className="air-notice-toast__content">{item.content}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

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

    if (items.length === 0 && containerEl && root) {
      root.unmount()
      containerEl.remove()
      containerEl = null
      root = null
    }
  }, 260)
}

const open = (
  type: NoticeType,
  title: string,
  content = '',
  duration = 3,
  onClose?: () => void,
): NoticeRef => {
  const id = ++uid
  items = [...items, {id, type, title, content, duration, onClose, leaving: false}]
  ensureContainer()
  render()

  if (duration > 0) {
    setTimeout(() => close(id), duration * 1000)
  }

  return {destroy: () => close(id)}
}

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

const Notice = {
  info:    (title: string, content?: string, duration?: number, onClose?: () => void) => open('info', title, content, duration, onClose),
  success: (title: string, content?: string, duration?: number, onClose?: () => void) => open('success', title, content, duration, onClose),
  error:   (title: string, content?: string, duration?: number, onClose?: () => void) => open('error', title, content, duration, onClose),
  warning: (title: string, content?: string, duration?: number, onClose?: () => void) => open('warning', title, content, duration, onClose),
  destroyAll,
}

export default Notice
