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

/** 下拉菜单项（兼容旧 {label, onClick, type:'split', disabled} 结构） */
export interface IconButtonItem {
  label?: ReactNode
  icon?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  type?: 'split'
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
  } = props

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
      <DropdownMenuContent align="start">
        {items.map((item, index) =>
          item.type === 'split' ? (
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
