/**
 * MenuBar 菜单栏
 *
 * 垂直菜单列表，支持选中高亮与底部「返回」按钮。已无 UI 库依赖，样式改为 Tailwind。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

interface MenuItemData {
  id: string
  label: string
  icon?: string
}

interface MenuBarProps {
  items: MenuItemData[]
  height?: number
  onSelect?: (id: string) => void
  onReturn?: () => void
  defaultSelected?: string
}

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const {items, height, onSelect, onReturn, defaultSelected} = props
  const [current, setCurrent] = useState<string>('')

  useEffect(() => {
    setCurrent(defaultSelected ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-full flex-col justify-between" style={{height}}>
      <div className="flex flex-col">
        {items.map((item) => {
          const label = item.label
          const iconName = item.icon || item.id
          const active = item.id === current
          return (
            <div
              key={item.id}
              className="cursor-pointer px-3 py-2"
              onClick={() => {
                onSelect?.(item.id)
                setCurrent(item.id)
              }}
            >
              <div
                className={cn(
                  'flex items-center gap-2 rounded px-2 py-1.5 text-sm',
                  active ? 'bg-primary/15 font-medium' : 'hover:bg-accent'
                )}
              >
                <Icon name={iconName} size={20}/>
                <span style={{letterSpacing: label.length > 2 ? 0 : '2px'}}>{label}</span>
              </div>
            </div>
          )
        })}
      </div>
      {onReturn && (
        <div className="cursor-pointer px-3 py-2" onClick={onReturn}>
          <div className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
            <Icon name="back" size={20}/>
            <span style={{letterSpacing: '2px'}}>返回</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuBar
