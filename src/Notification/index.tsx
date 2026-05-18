/**
 * Notification 通知组件
 *
 * 支持四个角落弹出：topLeft / topRight / bottomLeft / bottomRight（默认 topRight）。
 * 纯 SVG 图标，零外部依赖；支持堆叠、自动消失和手动关闭。
 * 与 Message 组件风格统一，适合需要标题+内容详情的场景。
 *
 * 用法：
 *   import { error, success } from 'air-design'
 *   error({ title: '操作失败', message: '请检查网络连接' })
 *   success({ title: '保存成功', position: 'bottomRight' })
 *
 * @author ChaiMingXu, on 2026/05/18
 */
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import './index.less'

type NoticeType = 'info' | 'success' | 'error' | 'warning'
type NoticePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

interface NotificationOptions {
  title?: string
  message: string
  type?: NoticeType
  duration?: number
  position?: NoticePosition
  onClose?: () => void
}

interface NoticeItem {
  id: number
  type: NoticeType
  title: string
  content: string
  duration: number
  position: NoticePosition
  onClose?: () => void
  leaving: boolean
}

/* ------------------------------------------------------------------ */
/*  SVG 图标（与 Message 一致）                                         */
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
/*  按位置分组的容器管理                                                 */
/* ------------------------------------------------------------------ */

const POSITIONS: NoticePosition[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']

const containers: Record<NoticePosition, { el: HTMLDivElement | null; root: Root | null }> = {
  topLeft: {el: null, root: null},
  topRight: {el: null, root: null},
  bottomLeft: {el: null, root: null},
  bottomRight: {el: null, root: null},
}

let uid = 0
let items: NoticeItem[] = []

const ensureContainer = (pos: NoticePosition) => {
  const c = containers[pos]
  if (c.el) return
  c.el = document.createElement('div')
  c.el.className = `air-notification-root air-notification-root--${pos}`
  document.body.appendChild(c.el)
  c.root = createRoot(c.el)
}

const getItemsByPos = (pos: NoticePosition) => items.filter(m => m.position === pos)

const renderAll = () => {
  for (const pos of POSITIONS) {
    const c = containers[pos]
    if (!c.root) continue
    const posItems = getItemsByPos(pos)
    if (posItems.length === 0) {
      c.root.unmount()
      c.el?.remove()
      c.el = null
      c.root = null
      continue
    }
    c.root.render(
      <div className="air-notification-list">
        {posItems.map(item => (
          <div
            key={item.id}
            className={`air-notification-item air-notification-item--${item.type}${item.leaving ? ' air-notification-item--leave' : ''}`}
          >
            <span className="air-notification-item__icon">{ICONS[item.type]}</span>
            <div className="air-notification-item__body">
              {item.title && <div className="air-notification-item__title">{item.title}</div>}
              {item.content && <div className="air-notification-item__content">{item.content}</div>}
            </div>
            <span className="air-notification-item__close" onClick={() => close(item.id)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </span>
          </div>
        ))}
      </div>
    )
  }
}

/* ------------------------------------------------------------------ */
/*  打开 & 关闭                                                         */
/* ------------------------------------------------------------------ */

const close = (id: number) => {
  const item = items.find(m => m.id === id)
  if (!item || item.leaving) return

  item.leaving = true
  renderAll()

  setTimeout(() => {
    const closed = items.find(m => m.id === id)
    items = items.filter(m => m.id !== id)
    renderAll()
    closed?.onClose?.()
  }, 260)
}

const open = (options: NotificationOptions) => {
  const id = ++uid
  const position = options.position || 'bottomRight'
  items = [...items, {
    id,
    type: options.type || 'info',
    title: options.title || '',
    content: options.message || '',
    duration: options.duration ?? 4,
    position,
    onClose: options.onClose,
    leaving: false,
  }]
  ensureContainer(position)
  renderAll()

  if ((options.duration ?? 4) > 0) {
    setTimeout(() => close(id), (options.duration ?? 4) * 1000)
  }
}

/* ------------------------------------------------------------------ */
/*  对外 API                                                           */
/* ------------------------------------------------------------------ */

const info = (options: NotificationOptions) => open({...options, type: 'info'})
const success = (options: NotificationOptions) => open({...options, type: 'success'})
const warn = (options: NotificationOptions) => open({...options, type: 'warning'})
const warning = (options: NotificationOptions) => open({...options, type: 'warning'})
const error = (options: NotificationOptions) => open({...options, type: 'error'})

export {info, success, warn, warning, error}
