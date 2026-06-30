/**
 * SlidePanel 侧滑抽屉
 *
 * 基于 Radix Dialog（primitives/sheet）。支持 small/default/large/huge/full/custom
 * 六种尺寸、页脚按钮栏、双层抽屉（innerDrawer）。
 *
 * 关键设计：**打开时一次性锁定 side 与尺寸（宽度/全屏），整个开-关周期保持不变**。
 * 这样无论外部 props 如何变化，关闭动画的方向与尺寸都与打开时严格一致，
 * 不会出现「从右滑入却向左收回」或「关闭时尺寸跳变」的问题。
 *
 * - 全屏（type=full）：从顶部滑出，全屏覆盖（h-full w-full）
 * - 其余：从 placement（默认右侧）滑出，宽度按 size 计算
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useState} from 'react'
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '@/primitives/sheet'
import Button from '@/components/Button'
import IconButton from '@/components/Button/IconButton'
import {cn} from '@/lib/cn'
import {toRem} from '@/lib/rem'

type PanelSize = 'small' | 'default' | 'large' | 'huge' | 'full' | 'custom'
type Side = 'top' | 'right' | 'left' | 'bottom'

interface SlidePanelProps {
  open?: boolean
  title?: React.ReactNode
  placement?: 'left' | 'right' | 'top' | 'bottom'
  type?: PanelSize
  width?: number
  hasCloseButton?: boolean
  hasButtonBar?: boolean
  maskClosable?: boolean
  confirmButtonText?: string
  closeButtonText?: string
  onConfirm?: () => void
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  footerExtra?: React.ReactNode
  bodyPadding?: number
  bodyBackgroundColor?: string
  children?: React.ReactNode
  /** 内嵌抽屉 */
  innerDrawer?: React.ReactNode
  showInnerDrawer?: boolean
  innerDrawerWidth?: number
  onInnerClose?: () => void
}

const SIZE_WIDTH: Record<Exclude<PanelSize, 'custom' | 'full'>, number> = {
  small: 290,
  default: 378,
  large: 850,
  huge: 1280,
}

/** 由当前 props 推导本次应有的 side 与 content 样式 */
function resolveLayout(type: PanelSize, placement: Side, width: number) {
  const isFull = type === 'full'
  const side: Side = isFull ? 'top' : placement

  let className: string
  let style: React.CSSProperties
  if (isFull) {
    // 全屏：顶部滑出，全屏覆盖
    className = 'h-full w-full max-h-screen'
    style = {}
  } else if (type === 'custom') {
    className = ''
    style = {width: toRem(width), maxWidth: '100vw'}
  } else {
    const w = SIZE_WIDTH[type] ?? width
    className = ''
    style = {width: toRem(w), maxWidth: '100vw'}
  }
  return {side, className, style, isFull}
}

const SlidePanel: React.FC<SlidePanelProps> = (props) => {
  const {
    children,
    hasCloseButton = false,
    hasButtonBar = true,
    onConfirm,
    onClose,
    confirmButtonText = '确定',
    closeButtonText = '取消',
    open = false,
    placement = 'right',
    title,
    bodyPadding = 16,
    bodyBackgroundColor = 'var(--color-background)',
    type = 'default',
    width = 378,
    onOpenChange,
    footerExtra,
    innerDrawer,
    showInnerDrawer = false,
    innerDrawerWidth = 600,
    onInnerClose,
    maskClosable = false,
  } = props

  // 打开时锁定的布局（side + className + style），整个开-关周期保持不变
  const [locked, setLocked] = useState(() => resolveLayout(type, placement as Side, width))

  useEffect(() => {
    if (open) {
      // 仅在打开时同步布局；关闭过程中保持锁定，确保收起动画方向/尺寸一致
      setLocked(resolveLayout(type, placement as Side, width))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, placement, width])

  /** 右上角关闭：与 footer 取消一致，由外部 onClose 控制 open */
  const handleHeaderClose = () => {
    onClose?.()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange?.(o)
        if (!o) onClose?.()
      }}
    >
      <SheetContent
        side={locked.side}
        hideClose
        className={cn('flex flex-col p-0', locked.className)}
        style={locked.style}
        onPointerDownOutside={(e) => {
          if (!maskClosable) e.preventDefault()
        }}
      >
        {/* 无标题时的浮动关闭按钮 */}
        {hasCloseButton && !title && (
          <div className="absolute right-2 top-2 z-10">
            <IconButton icon="close" size={26} tooltip="关闭" showTooltip={false} onClick={handleHeaderClose}/>
          </div>
        )}

        {/* 标题栏（含关闭按钮） */}
        {title && (
          <SheetHeader className="flex h-10 shrink-0 flex-row items-center justify-between border-b pl-4 pr-2 py-0">
            <SheetTitle className="min-w-0 flex-1 truncate pr-2 text-sm font-medium leading-none">{title}</SheetTitle>
            {hasCloseButton && (
              <span className="shrink-0">
                <IconButton icon="close" size={26} tooltip="关闭" showTooltip={false} onClick={handleHeaderClose}/>
              </span>
            )}
          </SheetHeader>
        )}

        {/* 内容区 */}
        <div className="min-h-0 flex-1 overflow-auto" style={{padding: toRem(bodyPadding), background: bodyBackgroundColor}}>
          {children}
        </div>

        {/* 页脚按钮栏：固定 3.125rem；非 full 靠左 gap 0.5rem，full 靠右 */}
        {hasButtonBar && (
          <div
            className={cn(
              'flex h-[3.125rem] shrink-0 flex-row items-center gap-[0.5rem] border-t px-6',
              locked.isFull ? 'justify-end' : 'justify-start',
            )}
          >
            {onConfirm && (
              <Button type="primary" onClick={onConfirm}>
                {confirmButtonText}
              </Button>
            )}
            {onClose && <Button onClick={onClose}>{closeButtonText}</Button>}
            {footerExtra && <div className={locked.isFull ? undefined : 'ml-auto'}>{footerExtra}</div>}
          </div>
        )}

        {/* 内嵌抽屉（独立 Sheet 叠加，side 与主面板一致） */}
        {innerDrawer && (
          <Sheet open={showInnerDrawer} onOpenChange={(o) => !o && onInnerClose?.()}>
            <SheetContent side={locked.side} hideClose className="flex flex-col p-0" style={{width: toRem(innerDrawerWidth), maxWidth: '100vw'}}>
              <div className="h-full overflow-auto p-4">{innerDrawer}</div>
            </SheetContent>
          </Sheet>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default SlidePanel
