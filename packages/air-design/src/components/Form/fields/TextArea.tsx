/**
 * TextArea 多行文本（antd 兼容）
 *
 * 基于 primitives/textarea，支持 showCount、status；高度由 rows 控制，非固定 38px。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef} from 'react'
import {Textarea as PrimitiveTextarea, type TextareaProps as PrimitiveTextareaProps} from '@/primitives/input'
import {cn} from '@/lib/cn'
import {controlStatusClass} from '@/lib/control-styles'

export interface TextAreaProps extends PrimitiveTextareaProps {
  status?: 'error' | 'warning'
  /** 是否展示字数统计 */
  showCount?: boolean
  maxLength?: number
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const {className, status, showCount, maxLength, value, defaultValue, onChange, ...rest} = props
  const [innerValue, setInnerValue] = React.useState<string>(() => {
    if (value != null) return String(value)
    if (defaultValue != null) return String(defaultValue)
    return ''
  })
  const merged = value != null ? String(value) : innerValue

  return (
    <div className="relative w-full">
      <PrimitiveTextarea
        ref={ref}
        className={cn(
          'min-h-[80px] w-full rounded-[4px] border border-input bg-background px-3 py-2 text-sm',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          controlStatusClass(status),
          showCount && maxLength ? 'pb-7' : undefined,
          className
        )}
        value={merged}
        maxLength={maxLength}
        onChange={(event) => {
          if (value == null) setInnerValue(event.target.value)
          onChange?.(event)
        }}
        {...rest}
      />
      {showCount && maxLength ? (
        <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
          {merged.length}/{maxLength}
        </span>
      ) : null}
    </div>
  )
})
TextArea.displayName = 'TextArea'

export default TextArea
export {TextArea}
