/**
 * ModalDialog 可拖拽模态对话框
 *
 * 自包含实现（遮罩 + 居中窗口 + 标题栏拖拽），不依赖 Radix，避免 transform 居中与拖拽定位冲突。
 * 沿用旧版经过验证的拖拽算法（鼠标按住标题栏移动、边界约束），样式迁移到 Tailwind + 设计 Token。
 * 受控 visible；通过 ref 暴露 doCancel / open，命令式 Dialog.confirm 依赖 doCancel 关闭并卸载 DOM。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useImperativeHandle, useRef, useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Spin from '@/components/Spin'

export interface ModalDialogProps {
  visible?: boolean
  children?: React.ReactNode
  onInit?: (ref: ModalDialogHandle) => void
  onCancel?: () => void
  domId?: string
  okText?: string
  onOk?: () => void
  cancelText?: string
  confirmable?: boolean
  closable?: boolean
  width?: number | string
  height?: number | string
  title?: React.ReactNode
  showFooter?: boolean
  headerColor?: string
  headerBgColor?: string
  contentBgColor?: string
  footerBgColor?: string
  contentPadding?: number | string
  contentAlign?: 'top' | 'middle' | 'bottom'
  mask?: boolean
  loading?: boolean
}

/** 命令式调用通过 ref 暴露的句柄 */
export interface ModalDialogHandle {
  doCancel: () => void
  open: () => void
}

const ModalDialog = React.forwardRef<ModalDialogHandle, ModalDialogProps>((props, ref) => {
  const {
    visible = true,
    children,
    onInit,
    onCancel,
    domId,
    okText,
    onOk,
    cancelText,
    confirmable = true,
    closable = true,
    width,
    height,
    title,
    showFooter = true,
    headerBgColor = 'var(--color-muted)',
    headerColor = 'var(--color-foreground)',
    contentBgColor = 'var(--color-card)',
    footerBgColor = 'var(--color-muted)',
    contentPadding = 24,
    contentAlign = 'middle',
    mask = true,
    loading = false,
  } = props

  const [open, setOpen] = useState(!!visible)
  const windowRef = useRef<HTMLDivElement>(null)

  const doCancel = () => {
    onCancel?.()
    setOpen(false)
    // 卸载命令式渲染挂载的 DOM
    const rootDiv = document.getElementById('root')
    if (rootDiv) {
      const dm = rootDiv.querySelector(`#${domId ?? 'air-modal-dialog'}`)
      if (dm) rootDiv.removeChild(dm)
    }
  }

  useImperativeHandle(ref, () => ({doCancel, open: () => setOpen(true)}), [])

  // ---- 拖拽算法：保持 flex 居中，用 transform 偏移移动，避免布局切换造成跳动 ----
  // offset = 鼠标相对按下点的位移；窗口始终居中，仅 translate(offset)，不改变 position。
  const [offset, setOffset] = useState<{x: number; y: number} | null>(null)
  const dragRef = useRef<{startX: number; startY: number}>({startX: 0, startY: 0})

  const onMouseDown = (e: React.MouseEvent) => {
    // 记录鼠标按下点；从当前累计偏移开始（支持多次拖拽累计）
    const base = offset ?? {x: 0, y: 0}
    dragRef.current = {startX: e.clientX - base.x, startY: e.clientY - base.y}
    if (!offset) setOffset({x: 0, y: 0})
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
    const el = windowRef.current
    // 窗口居中位置（视口坐标）
    const centerX = (window.innerWidth - (el?.offsetWidth ?? 0)) / 2
    const centerY = (window.innerHeight - (el?.offsetHeight ?? 0)) / 2
    // 约束：移动后窗口不超出视口
    const dx = Math.min(
      Math.max(e.clientX - dragRef.current.startX, -centerX),
      centerX
    )
    const dy = Math.min(
      Math.max(e.clientY - dragRef.current.startY, -centerY),
      centerY
    )
    setOffset({x: dx, y: dy})
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  useEffect(() => {
    onInit?.({doCancel, open: () => setOpen(true)})
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') doCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  // 窗口始终 flex 居中；拖拽时叠加 transform 偏移（不切换布局，避免跳动）
  const winStyle: React.CSSProperties = offset
    ? {transform: `translate(${offset.x}px, ${offset.y}px)`}
    : {}

  const maskStyle: React.CSSProperties = mask
    ? {background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(1px)'}
    : {background: 'transparent', pointerEvents: 'none'}

  const contentPaddingStyle =
    typeof contentPadding === 'number' ? `${contentPadding}px` : contentPadding

  const alignJustify =
    contentAlign === 'top' ? 'flex-start' : contentAlign === 'bottom' ? 'flex-end' : 'center'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={maskStyle} onMouseDown={mask ? doCancel : undefined}>
      {/* 窗口：阻止点击冒泡到遮罩 */}
      <div
        ref={windowRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute flex max-h-[90vh] flex-col overflow-hidden rounded border border-border bg-card shadow-2xl"
        style={{
          width: width ?? 'min(560px, 90vw)',
          height: height ?? undefined,
          ...winStyle,
        }}
      >
        {/* 标题栏（可拖拽，高度 50px） */}
        <div
          className="flex shrink-0 items-center justify-between border-b border-border px-4 select-none"
          style={{height: 50, backgroundColor: headerBgColor, color: headerColor}}
        >
          <div
            className="flex-1 cursor-move truncate text-sm font-semibold"
            onMouseDown={onMouseDown}
          >
            {title ?? 'AirMachine'}
          </div>
          {closable && (
            <button
              type="button"
              onClick={doCancel}
              className="ml-2 inline-flex size-7 cursor-pointer items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
            >
              <Icon name="close" size={14}/>
            </button>
          )}
        </div>

        {/* 内容区 */}
        <div
          className="relative flex-1 overflow-auto"
          style={{backgroundColor: contentBgColor, padding: contentPaddingStyle, justifyContent: alignJustify}}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
              <Spin size="large"/>
            </div>
          )}
          {children}
        </div>

        {/* 页脚（无边框无背景，按钮靠右） */}
        {showFooter && (
          <div
            className="flex w-full shrink-0 items-center justify-end gap-2 px-4 py-3"
          >
            {confirmable && (
              <Button type="primary" onClick={onOk}>
                {okText ?? '确定'}
              </Button>
            )}
            {closable && (
              <Button onClick={doCancel}>
                {cancelText ?? '取消'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
})

export default ModalDialog
