/**
 * IconButton 图标按钮
 *
 * 支持图标（Icon 图标名或自定义 ReactNode）、tooltip 提示、下拉菜单（items）、
 * 圆形/方形外观、禁用态。下拉菜单基于 primitives/dropdown-menu，tooltip 基于 primitives/tooltip。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {ReactNode} from 'react'
import Icon from '@/components/Icon'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/primitives/dropdown-menu'
import {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from '@/primitives/tooltip'
import {cn} from '@/lib/cn'

/** 下拉菜单项（兼容旧 {label, onClick, type:'split'/'divider', disabled, key} 结构） */
export interface IconButtonItem {
  key?: string
  label?: ReactNode
  icon?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  /** 分隔符：'split' 与 'divider' 均渲染为分隔线 */
  type?: 'split' | 'divider'
}

interface IconButtonProps {
  icon?: string
  customIcon?: ReactNode
  size?: number
  items?: IconButtonItem[]
  onClick?: () => void
  tooltip?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
  bordered?: boolean
  shape?: 'circle' | 'square' | 'default'
  className?: string
  style?: React.CSSProperties
  /** 下拉菜单展开方向（兼容旧 antd placement 语义），默认 bottomLeft */
  dropdownPlacement?:
    | 'top' | 'topLeft' | 'topRight'
    | 'bottom' | 'bottomLeft' | 'bottomRight'
    | 'left' | 'right'
}

/** 旧 antd placement → Radix DropdownMenu {side, align} 映射 */
function resolveDropdownPlacement(p: IconButtonProps['dropdownPlacement']) {
  switch (p) {
    case 'top': return {side: 'top' as const, align: 'center' as const}
    case 'topLeft': return {side: 'top' as const, align: 'start' as const}
    case 'topRight': return {side: 'top' as const, align: 'end' as const}
    case 'bottom': return {side: 'bottom' as const, align: 'center' as const}
    case 'bottomRight': return {side: 'bottom' as const, align: 'end' as const}
    case 'left': return {side: 'left' as const, align: 'center' as const}
    case 'right': return {side: 'right' as const, align: 'center' as const}
    case 'bottomLeft':
    default: return {side: 'bottom' as const, align: 'start' as const}
  }
}

const IconButton: React.FC<IconButtonProps> = (props) => {
  const {
    icon,
    customIcon,
    size = 34,
    items,
    onClick,
    tooltip,
    placement = 'top',
    disabled = false,
    bordered = false,
    shape = 'default',
    className,
    style,
    dropdownPlacement = 'bottomLeft',
  } = props

  const menuPos = resolveDropdownPlacement(dropdownPlacement)

  const iconSize = size - 12
  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-md'

  const iconElement = customIcon ? (
    <span className="flex items-center justify-center">{customIcon}</span>
  ) : icon ? (
    <Icon name={icon} size={iconSize}/>
  ) : null

  const buttonContent = (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'inline-flex items-center justify-center transition-colors',
        radiusClass,
        bordered && 'border border-border',
        !disabled && 'hover:bg-accent active:bg-accent/70',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{height: size, width: size, ...style}}
    >
      {iconElement}
    </button>
  )

  // items 存在时渲染下拉菜单
  const withMenu = items && items.length > 0 ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{buttonContent}</DropdownMenuTrigger>
      <DropdownMenuContent side={menuPos.side} align={menuPos.align}>
        {items.map((item, index) =>
          item.type === 'split' || item.type === 'divider' ? (
            <DropdownMenuSeparator key={`split-${index}`}/>
          ) : (
            !item.disabled && (
              <DropdownMenuItem
                key={`item-${index}`}
                onClick={(e) => {
                  e.stopPropagation()
                  item.onClick?.(e)
                }}
              >
                {item.icon && <Icon name={item.icon} size={14}/>}
                {item.label}
              </DropdownMenuItem>
            )
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    buttonContent
  )

  return tooltip ? (
    <TooltipProvider delayDuration={800}>
      <Tooltip>
        <TooltipTrigger asChild>{withMenu}</TooltipTrigger>
        <TooltipContent side={placement}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    withMenu
  )
}

export default IconButton
