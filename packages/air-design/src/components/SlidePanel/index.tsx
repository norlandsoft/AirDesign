/**
 * SlidePanel 侧滑抽屉
 *
 * 保留旧版 API：size 类型（small/default/large/huge/full/custom）、双层抽屉（innerDrawer）、
 * footer 按钮栏。右上角关闭使用 IconButton。底层迁移到 Radix Dialog（primitives/sheet），无 AntD 依赖。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter} from '@/primitives/sheet'
import Button from '@/components/Button'
import IconButton from '@/components/Button/IconButton'
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
  // 全屏从顶部滑出（全宽），其它从 placement（默认右侧）滑出，宽度按 size 计算
  const computedWidth = type === 'custom' ? width : isFull ? undefined : SIZE_WIDTH[type as Exclude<PanelSize, 'custom' | 'full'>] ?? width

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
        side={isFull ? 'top' : placement === 'left' ? 'left' : placement === 'top' ? 'top' : placement === 'bottom' ? 'bottom' : 'right'}
        hideClose
        className={cn('p-0 sm:max-w-none', isFull && 'h-full w-full max-w-none')}
        style={isFull ? undefined : {width: typeof computedWidth === 'number' ? `${computedWidth}px` : computedWidth}}
        onPointerDownOutside={(e) => {
          if (!maskClosable) e.preventDefault()
        }}
      >
        {hasCloseButton && !title && (
          <div className="absolute right-2 top-2 z-10">
            <IconButton icon="close" size={26} tooltip="关闭" onClick={handleHeaderClose}/>
          </div>
        )}

        {title && (
          <SheetHeader className="flex h-10 shrink-0 flex-row items-center justify-between border-b pl-4 pr-2 py-0">
            <SheetTitle className="min-w-0 flex-1 truncate pr-2 text-sm font-medium leading-none">{title}</SheetTitle>
            {hasCloseButton && (
              <span className="shrink-0">
                <IconButton icon="close" size={26} tooltip="关闭" onClick={handleHeaderClose}/>
              </span>
            )}
          </SheetHeader>
        )}

        {/* 内容区 */}
        <div className="min-h-0 flex-1 overflow-auto" style={{padding: `${bodyPadding}px`, background: bodyBackgroundColor}}>
          <div className={cn(isFull && 'h-full')}>{children}</div>
        </div>

        {/* 页脚按钮栏：固定 50px 高度；全屏时按钮靠右，其余靠左 */}
        {hasButtonBar && (
          <SheetFooter className={cn('flex h-[50px] shrink-0 flex-row items-center gap-2 border-t px-6 py-0', isFull ? 'justify-end' : 'justify-start')}>
            {onConfirm && (
              <Button type="primary" onClick={onConfirm}>
                {confirmButtonText}
              </Button>
            )}
            {onClose && <Button onClick={onClose}>{closeButtonText}</Button>}
            {footerExtra && <div className="ml-auto">{footerExtra}</div>}
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
