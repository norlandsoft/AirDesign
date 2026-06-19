/**
 * TableRowMenu 行操作下拉菜单
 *
 * 表格行内悬浮显示的「更多」操作菜单。基于 primitives/dropdown-menu。
 * 兼容旧 items 结构（label/onClick/type:'split'/disabled/key），点击时把 item 与行数据回传。
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

export interface TableRowMenuItem {
  key?: string
  label?: React.ReactNode
  icon?: string
  onClick?: (item: TableRowMenuItem, data?: any) => void
  disabled?: boolean
  type?: 'split'
}

interface TableRowMenuProps {
  items: TableRowMenuItem[]
  data?: any
  className?: string
}

const TableRowMenu: React.FC<TableRowMenuProps> = (props) => {
  const {items, data} = props
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded border transition-colors',
            open || hovered ? 'border-border bg-accent' : 'border-transparent bg-transparent'
          )}
        >
          <Icon name="more" size={16}/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) =>
          item.type === 'split' ? (
            <DropdownMenuSeparator key={item.key ?? `split-${index}`}/>
          ) : (
            <DropdownMenuItem
              key={item.key ?? index}
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation()
                if (!item.disabled) item.onClick?.(item, data)
              }}
            >
              {item.icon && <Icon name={item.icon} size={14}/>}
              {item.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableRowMenu
