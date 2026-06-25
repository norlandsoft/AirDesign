/**
 * MenuBar 菜单栏
 *
 * 窄宽垂直侧栏：上图标下文字、深绿配色；选中项浅绿灰圆角高亮；底部可选「返回」按钮。
 *
 * @author ChaiMingXu, 2026/06/25
 */
import React, {useEffect, useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import './index.css'

interface MenuItemData {
  id: string
  label: string
  icon?: string
}

interface MenuBarProps {
  items: MenuItemData[]
  height?: number | string
  width?: number | string
  onSelect?: (id: string) => void
  onReturn?: () => void
  defaultSelected?: string
}

/** 菜单项图标与文字色 */
const MENU_ICON_COLOR = '#2D5A41'

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const {items, height, width, onSelect, onReturn, defaultSelected} = props
  const [current, setCurrent] = useState<string>('')

  useEffect(() => {
    setCurrent(defaultSelected ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rootStyle: React.CSSProperties = {
    ...(height != null ? {height} : {}),
    ...(width != null ? {width, minWidth: width} : {}),
  }

  return (
    <div className="air-menu-bar" style={rootStyle}>
      <nav className="air-menu-bar-nav" aria-label="菜单">
        {items.map((item) => {
          const iconName = item.icon || item.id
          const active = item.id === current
          return (
            <button
              key={item.id}
              type="button"
              className={cn('air-menu-bar-item', active && 'air-menu-bar-item-active')}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                onSelect?.(item.id)
                setCurrent(item.id)
              }}
            >
              <Icon name={iconName} size={22} color={MENU_ICON_COLOR}/>
              <span className="air-menu-bar-item-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {onReturn ? (
        <button type="button" className="air-menu-bar-item air-menu-bar-return" onClick={onReturn}>
          <Icon name="back" size={22} color={MENU_ICON_COLOR}/>
          <span className="air-menu-bar-item-label">返回</span>
        </button>
      ) : null}
    </div>
  )
}

export default MenuBar
