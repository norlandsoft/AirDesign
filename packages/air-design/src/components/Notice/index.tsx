/**
 * Notice 通知组件
 *
 * 四角弹出通知（topLeft/topRight/bottomLeft/bottomRight，默认 bottomRight），
 * 纯 SVG 图标、零外部依赖，支持堆叠、自动消失、手动关闭。命令式 API：
 *   Notice.info/success/error/warning(title, content?, duration?, position?, onClose?)
 *   Notice.destroyAll()
 * 样式改为 Tailwind，逻辑与旧版一致。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {createRoot, type Root} from 'react-dom/client'

type NoticeType = 'info' | 'success' | 'error' | 'warning'
type NoticePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

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

interface NoticeRef {
  destroy: () => void
}

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

const TYPE_COLOR: Record<NoticeType, string> = {
  info: 'text-primary',
  success: 'text-green-600',
  error: 'text-destructive',
  warning: 'text-amber-600',
}

const POSITIONS: NoticePosition[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']

/** 位置 → 容器定位 class */
const POSITION_CLASS: Record<NoticePosition, string> = {
  topLeft: 'fixed left-4 top-4 flex flex-col gap-2',
  topRight: 'fixed right-4 top-4 flex flex-col gap-2',
  bottomLeft: 'fixed bottom-4 left-4 flex flex-col-reverse gap-2',
  bottomRight: 'fixed bottom-4 right-4 flex flex-col-reverse gap-2',
}

const containers: Record<NoticePosition, {el: HTMLDivElement | null; root: Root | null}> = {
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
  c.el.className = `z-[10000] ${POSITION_CLASS[pos]}`
  document.body.appendChild(c.el)
  c.root = createRoot(c.el)
}

const renderAll = () => {
  for (const pos of POSITIONS) {
    const c = containers[pos]
    if (!c.root) continue
    const posItems = items.filter((m) => m.position === pos)
    if (posItems.length === 0) {
      c.root.unmount()
      c.el?.remove()
      c.el = null
      c.root = null
      continue
    }
    c.root.render(
      <>
        {posItems.map((item) => (
          <div
            key={item.id}
            className={`flex w-80 items-start gap-3 rounded-md border border-border bg-background p-3 transition-all duration-200 ${
              item.leaving ? 'opacity-0 translate-x-4' : 'opacity-100'
            }`}
          >
            <span className={`mt-0.5 size-4 shrink-0 ${TYPE_COLOR[item.type]}`}>{ICONS[item.type]}</span>
            <div className="flex-1">
              {item.title && <div className="text-sm font-medium">{item.title}</div>}
              {item.content && <div className="mt-0.5 text-xs text-muted-foreground">{item.content}</div>}
            </div>
            <span
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => close(item.id)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </span>
          </div>
        ))}
      </>
    )
  }
}

const close = (id: number) => {
  const item = items.find((m) => m.id === id)
  if (!item || item.leaving) return
  item.leaving = true
  renderAll()
  setTimeout(() => {
    const closed = items.find((m) => m.id === id)
    items = items.filter((m) => m.id !== id)
    renderAll()
    closed?.onClose?.()
  }, 220)
}

const open = (
  type: NoticeType,
  title: string,
  content = '',
  duration = 4,
  position: NoticePosition = 'bottomRight',
  onClose?: () => void
): NoticeRef => {
  const id = ++uid
  items = [...items, {id, type, title, content, duration, position, onClose, leaving: false}]
  ensureContainer(position)
  renderAll()
  if (duration > 0) setTimeout(() => close(id), duration * 1000)
  return {destroy: () => close(id)}
}

const Notice = {
  info: (title: string, content?: string, duration?: number, position?: NoticePosition, onClose?: () => void) => open('info', title, content, duration, position, onClose),
  success: (title: string, content?: string, duration?: number, position?: NoticePosition, onClose?: () => void) => open('success', title, content, duration, position, onClose),
  error: (title: string, content?: string, duration?: number, position?: NoticePosition, onClose?: () => void) => open('error', title, content, duration, position, onClose),
  warning: (title: string, content?: string, duration?: number, position?: NoticePosition, onClose?: () => void) => open('warning', title, content, duration, position, onClose),
  destroyAll: () => {
    items = []
    for (const pos of POSITIONS) {
      const c = containers[pos]
      if (c.root) {
        c.root.unmount()
        c.el?.remove()
        c.el = null
        c.root = null
      }
    }
  },
}

export default Notice
