/**
 * Tag 标签组件
 *
 * 胶囊状标签：可选前缀色点 + 文本 + 可选关闭按钮。
 * 支持 default / primary / success / warning / danger 五种语义色，
 * 也可通过 color 传入任意 hex 自定义点色。可关闭（closable）时显示 ×。
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/cn'

const tagVariants = cva(
  'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs leading-5 font-medium border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground border-transparent',
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-green-50 text-green-700 border-green-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  /** 前缀色点颜色（hex）；不传则按 variant 取色 */
  dotColor?: string
  /** 是否可关闭（显示 × 按钮） */
  closable?: boolean
  /** 关闭回调 */
  onClose?: (e: React.MouseEvent) => void
}

/** 各 variant 对应的点色 */
const VARIANT_DOT: Record<NonNullable<TagProps['variant']>, string> = {
  default: 'var(--color-muted-foreground)',
  primary: 'var(--color-primary)',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({className, variant, dotColor, closable, onClose, children, ...props}, ref) => {
    const dot = dotColor ?? (variant ? VARIANT_DOT[variant] : undefined)
    return (
      <span ref={ref} className={cn(tagVariants({variant}), className)} {...props}>
        {dot && <span className="size-1.5 rounded-full" style={{backgroundColor: dot}}/>}
        {children}
        {closable && (
          <button
            type="button"
            onClick={onClose}
            className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-sm opacity-60 transition-opacity hover:opacity-100"
            aria-label="关闭"
          >
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l6 6M8 2l-6 6"/>
            </svg>
          </button>
        )}
      </span>
    )
  }
)
Tag.displayName = 'Tag'

export {Tag, tagVariants}
