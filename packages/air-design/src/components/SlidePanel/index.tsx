/**
 * SlidePanel 侧滑抽屉
 *
 * 保留旧版 API：size 类型（small/default/large/huge/full/custom）、双层抽屉（innerDrawer）、
 * footer 按钮栏。底层迁移到 Radix Dialog（primitives/sheet），无 AntD 依赖。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter} from '@/primitives/sheet'
import Button from '@/components/Button'
import {cn} from '@/lib/cn'

type PanelSize = 'small' | 'default' | 'large' | 'huge' | 'full' | 'custom'

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

const SlidePanel: React.FC<SlidePanelProps> = (props) => {
  const {
    children,
    hasCloseButton = false,
    hasButtonBar = true,
    onConfirm,
    onClose,
    confirmButtonText = '确定',
    closeButtonText = '取消',
    open,
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

  const isFull = type === 'full'
  const computedWidth = type === 'custom' ? width : isFull ? '100%' : SIZE_WIDTH[type as Exclude<PanelSize, 'custom' | 'full'>] ?? width

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange?.(o)
        if (!o) onClose?.()
      }}
    >
      <SheetContent
        side={isFull ? 'top' : placement === 'left' ? 'left' : placement === 'top' ? 'top' : placement === 'bottom' ? 'bottom' : 'right'}
        hideClose={!hasCloseButton}
        className="p-0 sm:max-w-none"
        style={{width: typeof computedWidth === 'number' ? `${computedWidth}px` : computedWidth}}
        onPointerDownOutside={(e) => {
          if (!maskClosable) e.preventDefault()
        }}
      >
        {title && (
          <SheetHeader className="flex-row items-center justify-between border-b px-4 py-2">
            <SheetTitle className="text-sm">{title}</SheetTitle>
          </SheetHeader>
        )}

        {/* 内容区 */}
        <div className="flex-1 overflow-auto" style={{padding: `${bodyPadding}px`, background: bodyBackgroundColor}}>
          <div className={cn(isFull && 'h-full')}>{children}</div>
        </div>

        {/* 页脚按钮栏 */}
        {hasButtonBar && (
          <SheetFooter className="flex-row items-center justify-between border-t px-6 py-2.5">
            <span className="flex gap-2">
              {onConfirm && (
                <Button type="primary" onClick={onConfirm}>
                  {confirmButtonText}
                </Button>
              )}
              {onClose && <Button onClick={onClose}>{closeButtonText}</Button>}
            </span>
            {footerExtra && <div>{footerExtra}</div>}
          </SheetFooter>
        )}

        {/* 内嵌抽屉（独立 Sheet 叠加） */}
        {innerDrawer && (
          <Sheet open={showInnerDrawer} onOpenChange={(o) => !o && onInnerClose?.()}>
            <SheetContent side={placement} hideClose className="p-0 sm:max-w-none" style={{width: `${innerDrawerWidth}px`}}>
              <div className="h-full overflow-auto p-4">{innerDrawer}</div>
            </SheetContent>
          </Sheet>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default SlidePanel
