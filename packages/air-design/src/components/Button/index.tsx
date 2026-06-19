/**
 * Button 毛玻璃风格按钮
 *
 * 支持 default / primary / danger / text / link 五种类型，icon 支持 string（图标名，用 Icon 渲染）
 * 或 ReactNode。基于 primitives/button 的 cva variant 实现，样式经设计 Token 驱动。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {forwardRef, MouseEvent, ReactNode} from 'react'
import {Button as PrimitiveButton, type ButtonProps} from '@/primitives/button'
import Icon from '@/components/Icon'

/** AirDesign 按钮类型语义（非 AntD） */
type AirButtonType = 'default' | 'primary' | 'danger' | 'text' | 'link'

interface AirButtonProps extends Omit<ButtonProps, 'type' | 'variant'> {
  /** 按钮类型，等价于旧 type 属性，便于业务代码平滑迁移 */
  type?: AirButtonType
  /** danger=true 时强制渲染为 danger 类型（保留语义快捷开关） */
  danger?: boolean
  /** 图标：string 为图标名（经 Icon 渲染），或任意 ReactNode */
  icon?: ReactNode | string
  /** 加载态 */
  loading?: boolean
  /** 撑满父容器宽度 */
  block?: boolean
  children?: ReactNode
}

/** AirDesign 类型 → primitives variant 映射 */
function resolveVariant(type: AirButtonType | undefined, danger?: boolean) {
  if (danger) return 'destructive' as const
  switch (type) {
    case 'primary':
      return 'primary' as const
    case 'danger':
      return 'destructive' as const
    case 'text':
      return 'ghost' as const
    case 'link':
      return 'link' as const
    default:
      return 'default' as const
  }
}

const Button = forwardRef<HTMLButtonElement, AirButtonProps>((props, ref) => {
  const {
    children,
    onClick,
    type = 'default',
    danger,
    icon = null,
    loading = false,
    block = false,
    disabled,
    className,
    size = 'default',
    ...rest
  } = props

  const variant = resolveVariant(type, danger)
  const isDisabled = disabled || loading
  // primary / danger(destructive) 类型图标用白色，其余用主色
  const iconColor = variant === 'primary' || variant === 'destructive' ? '#fff' : 'var(--color-primary)'
  const iconNode =
    icon == null
      ? null
      : typeof icon === 'string'
        ? <Icon name={icon} size={16} color={iconColor}/>
        : icon

  return (
    <PrimitiveButton
      ref={ref}
      type="button"
      variant={variant}
      size={size}
      className={block ? 'w-full' : undefined}
      onClick={onClick}
      disabled={isDisabled}
      data-loading={loading || undefined}
      {...rest}
    >
      {iconNode}
      {children}
    </PrimitiveButton>
  )
})

export default Button
