/**
 * ModalDialog 可拖拽模态对话框
 *
 * 保留旧版拖拽（鼠标按住标题栏移动）、loading 遮罩、自定义页头/页脚背景等能力。
 * 底层迁移到 Radix Dialog（primitives/dialog），获得无障碍与焦点管理。受控 visible。
 *
 * 通过 ref 暴露 doCancel / open，命令式场景（Dialog.confirm）依赖 doCancel 关闭并卸载 DOM。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useImperativeHandle, useRef, useState} from 'react'
import {
  Dialog as RadixDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/primitives/dialog'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Spin from '@/components/Spin'
import {cn} from '@/lib/cn'

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
    contentBgColor = 'var(--color-background)',
    footerBgColor = 'var(--color-muted)',
    contentPadding = 24,
    contentAlign = 'middle',
    loading = false,
  } = props

  const [open, setOpen] = useState(!!visible)

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

  // 拖拽定位：统一使用视口坐标（clientX/Y、innerWidth/Height），与 position:fixed 对齐
  const [pos, setPos] = useState<{x: number; y: number} | null>(null)
  const dragRef = useRef<{moving: boolean; diffX: number; diffY: number}>({moving: false, diffX: 0, diffY: 0})

  const onMouseDown = (e: React.MouseEvent) => {
    const titleDom = e.currentTarget as HTMLElement
    const rect = titleDom.getBoundingClientRect()
    // 以标题栏左上角为基准，记录鼠标相对偏移（全部视口坐标）
    dragRef.current = {moving: true, diffX: e.clientX - rect.left, diffY: e.clientY - rect.top}
    // 拖拽前先固定当前位置，避免 transform 与 position 切换造成跳变
    const modal = (document.getElementById('air-modal-window') as HTMLElement | null)
    const modalRect = modal?.getBoundingClientRect()
    if (modalRect) setPos({x: modalRect.left, y: modalRect.top})
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.moving) return
    const modal = document.getElementById('air-modal-window')
    const maxX = window.innerWidth - (modal?.offsetWidth ?? 0)
    const maxY = window.innerHeight - (modal?.offsetHeight ?? 0)
    const x = Math.min(Math.max(e.clientX - dragRef.current.diffX, 0), Math.max(maxX, 0))
    const y = Math.min(Math.max(e.clientY - dragRef.current.diffY, 0), Math.max(maxY, 0))
    setPos({x, y})
  }

  const onMouseUp = () => {
    dragRef.current.moving = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  // onInit 回调（命令式渲染时用于拿到 doCancel）
  React.useEffect(() => {
    onInit?.({doCancel, open: () => setOpen(true)})
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const style: React.CSSProperties = {
    width: width ?? 'min(560px, 90vw)',
    maxHeight: height ?? undefined,
    // 拖拽时切换为视口绝对定位，并强制清除 Radix 的 translate 居中（避免抖动）
    position: pos ? 'fixed' : undefined,
    left: pos ? `${pos.x}px` : undefined,
    top: pos ? `${pos.y}px` : undefined,
    transform: pos ? 'translate(0,0)' : undefined,
    padding: 0,
  }

  return (
    <RadixDialog open={open} onOpenChange={(o) => !o && doCancel()}>
      <DialogContent
        hideClose={!closable}
        style={style}
        className="air-modal-dialog overflow-hidden rounded-lg p-0"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* 内层容器：与外层圆角一致，overflow 防止方角溢出 */}
        <div
          id="air-modal-window"
          className="flex flex-col overflow-hidden rounded-lg"
          style={{backgroundColor: contentBgColor}}
        >
          <DialogHeader
            className="flex-row items-center justify-between border-b px-5 py-3"
            style={{backgroundColor: headerBgColor}}
          >
            <div
              className="flex-1 cursor-move select-none text-sm font-semibold"
              onMouseDown={onMouseDown}
            >
              {title ?? 'AirMachine'}
            </div>
          </DialogHeader>

          {/* 内容区 */}
          <div
            className={cn('relative overflow-auto')}
            style={{
              padding: typeof contentPadding === 'number' ? `${contentPadding}px` : contentPadding,
              justifyContent:
                contentAlign === 'top' ? 'flex-start' : contentAlign === 'bottom' ? 'flex-end' : 'center',
            }}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                <Spin size="large"/>
              </div>
            )}
            {children}
          </div>

          {/* 页脚 */}
          {showFooter && (
            <DialogFooter
              className="w-full justify-start border-t px-5 py-3"
              style={{backgroundColor: footerBgColor}}
            >
              {confirmable && (
                <Button type="primary" onClick={onOk}>
                  {okText ?? '确定'}
                </Button>
              )}
              {closable && (
                <Button onClick={doCancel} className="ml-2">
                  {cancelText ?? '取消'}
                </Button>
              )}
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </RadixDialog>
  )
})

// 保留默认导出与受控 visible 语义，兼容命令式 Dialog()
export default ModalDialog
