/**
 * MenuButton 菜单按钮
 *
 * 点击展开下拉菜单，默认渲染横向「更多」(more) 或纵向「菜单」(menu) 图标作为触发器。
 * 基于 primitives/dropdown-menu。兼容旧 items 结构（label/onClick/type:'split'）。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import Icon from '@/components/Icon'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/primitives/dropdown-menu'
import {cn} from '@/lib/cn'

export interface MenuButtonItem {
  label?: React.ReactNode
  icon?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  type?: 'split'
}

interface MenuButtonProps {
  size?: number
  items: MenuButtonItem[]
  type?: 'horizontal' | 'vertical'
  transClickEvent?: boolean
  innerMargin?: number
  className?: string
  style?: React.CSSProperties
}

const MenuButton: React.FC<MenuButtonProps> = (props) => {
  const {size = 24, items, type = 'horizontal', innerMargin = 4, className, style} = props
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn('inline-flex items-center justify-center rounded transition-colors hover:bg-accent', className)}
          style={{width: size, height: size, margin: innerMargin, ...style}}
        >
          <Icon name={type === 'horizontal' ? 'more' : 'menu'} size={size - 8}/>
        </div>
      </DropdownMenuTrigger>
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
                  setOpen(false)
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
  )
}

export default MenuButton
