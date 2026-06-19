/**
 * Sheet 原语：基于 Radix Dialog 的侧滑抽屉
 *
 * 业务 SlidePanel 组件基于此原语组合。支持 left/right/top/bottom 四个方向，
 * 继承 Radix Dialog 的无障碍能力。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '../lib/cn'

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({className, ...props}, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-sheet-fade-in data-[state=closed]:animate-sheet-fade-out',
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva('fixed z-50 gap-0 bg-background p-0', {
  variants: {
    side: {
      top: 'inset-x-0 top-0 max-h-screen border-b data-[state=open]:animate-sheet-in-top data-[state=closed]:animate-sheet-out-top',
      bottom:
        'inset-x-0 bottom-0 max-h-screen border-t data-[state=open]:animate-sheet-in-bottom data-[state=closed]:animate-sheet-out-bottom',
      left: 'inset-y-0 left-0 h-full border-r data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left',
      right:
        'inset-y-0 right-0 h-full border-l data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right',
    },
  },
  defaultVariants: {
    side: 'right',
  },
})

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideClose?: boolean
}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({side = 'right', className, children, hideClose, ...props}, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({side}), 'flex flex-col', className)} {...props}>
        {children}
        {!hideClose && (
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
            <span className="sr-only">关闭</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
)
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({className, ...props}, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({className, ...props}, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
