/**
 * Input 文本输入框（antd 兼容）
 *
 * 基于 primitives/input，提供 prefix/suffix、allowClear、status 等能力，
 * 默认高度 38px，样式与 air-design Token 一致。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useState} from 'react'
import {Input as PrimitiveInput, type InputProps as PrimitiveInputProps} from '@/primitives/input'
import {cn} from '@/lib/cn'
import {controlBaseClass, controlStatusClass} from '@/lib/control-styles'

export interface InputProps extends Omit<PrimitiveInputProps, 'size' | 'prefix'> {
  /** 校验状态 */
  status?: 'error' | 'warning'
  /** 前缀装饰 */
  prefix?: React.ReactNode
  /** 后缀装饰 */
  suffix?: React.ReactNode
  /** 是否展示清除按钮 */
  allowClear?: boolean
  /** 尺寸：middle 为默认 38px */
  size?: 'small' | 'middle' | 'large'
}

const sizeClassMap = {
  small: 'h-8 text-xs',
  middle: 'h-[var(--control-height)] text-sm',
  large: 'h-10 text-base',
}

/** 带前后缀的输入框容器 */
const AffixWrapper = forwardRef<
  HTMLInputElement,
  InputProps & {innerType?: string; visibilityToggle?: boolean}
>((props, ref) => {
  const {
    className,
    status,
    prefix,
    suffix,
    allowClear,
    size = 'middle',
    value,
    defaultValue,
    disabled,
    onChange,
    innerType,
    visibilityToggle,
    ...rest
  } = props

  const [innerValue, setInnerValue] = useState<string>(() => {
    if (value != null) return String(value)
    if (defaultValue != null) return String(defaultValue)
    return ''
  })
  const [visible, setVisible] = useState(false)
  const mergedValue = value != null ? String(value) : innerValue

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (value == null) setInnerValue(event.target.value)
    onChange?.(event)
  }

  const handleClear = () => {
    if (disabled) return
    if (value == null) setInnerValue('')
    onChange?.({target: {value: ''}} as React.ChangeEvent<HTMLInputElement>)
  }

  const clearNode =
    allowClear && mergedValue && !disabled ? (
      <button
        type="button"
        tabIndex={-1}
        className="inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
        onClick={handleClear}
        aria-label="清除"
      >
        ×
      </button>
    ) : null

  const toggleNode = visibilityToggle ? (
    <button
      type="button"
      tabIndex={-1}
      className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
      onClick={() => setVisible((v) => !v)}
    >
      {visible ? '隐藏' : '显示'}
    </button>
  ) : null

  const suffixNode = suffix ?? toggleNode ?? clearNode

  return (
    <span
      className={cn(
        'air-input-affix-wrapper inline-flex w-full items-center gap-2 rounded-[4px] border border-input bg-background px-3 transition-colors focus-within:ring-1 focus-within:ring-ring',
        sizeClassMap[size],
        controlStatusClass(status),
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {prefix ? <span className="shrink-0 text-muted-foreground">{prefix}</span> : null}
      <PrimitiveInput
        ref={ref}
        type={visibilityToggle ? (visible ? 'text' : 'password') : innerType}
        className={cn(
          'h-full min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0'
        )}
        value={mergedValue}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      {suffix ? <span className="shrink-0 text-muted-foreground">{suffix}</span> : null}
      {!suffix && clearNode}
      {!suffix && toggleNode}
    </span>
  )
})
AffixWrapper.displayName = 'AffixWrapper'

const PlainInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {className, status, size = 'middle', allowClear, prefix, suffix, ...rest} = props
  if (prefix || suffix || allowClear) {
    return <AffixWrapper ref={ref} {...props} />
  }
  return (
    <PrimitiveInput
      ref={ref}
      className={cn(controlBaseClass, sizeClassMap[size], controlStatusClass(status), className)}
      {...rest}
    />
  )
})
PlainInput.displayName = 'Input'

/** 密码输入框 */
const Password = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <AffixWrapper ref={ref} {...props} innerType="password" visibilityToggle />
))
Password.displayName = 'Input.Password'

type InputComponent = typeof PlainInput & {
  Password: typeof Password
}

const Input = PlainInput as InputComponent
Input.Password = Password

export default Input
export {Input, Password as PasswordInput}
