/**
 * MenuBar 菜单栏
 *
 * 窄宽垂直侧栏（60px），与 NavMenu icon-label 模式一致：项内 48×48 背景块、设计 Token 配色；
 * 上图标下文字，底部可选「返回」按钮（与主菜单项同尺寸）。
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

/** 渲染菜单项按钮（主菜单与返回按钮共用） */
const MenuBarItemButton: React.FC<{
  icon: string
  label: string
  active?: boolean
  className?: string
  ariaCurrent?: boolean
  onClick?: () => void
}> = ({icon, label, active, className, ariaCurrent, onClick}) => (
  <button
    type="button"
    className={cn('air-menu-bar-item', active && 'air-menu-bar-item-active', className)}
    aria-current={ariaCurrent ? 'page' : undefined}
    aria-label={label}
    onClick={onClick}
  >
    <span className="air-menu-bar-item-inner">
      <Icon name={icon} size={20} color="var(--color-primary)"/>
      <span className="air-menu-bar-item-label">{label}</span>
    </span>
  </button>
)

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
            <MenuBarItemButton
              key={item.id}
              icon={iconName}
              label={item.label}
              active={active}
              ariaCurrent={active}
              onClick={() => {
                onSelect?.(item.id)
                setCurrent(item.id)
              }}
            />
          )
        })}
      </nav>

      {onReturn ? (
        <MenuBarItemButton
          className="air-menu-bar-return"
          icon="back"
          label="返回"
          onClick={onReturn}
        />
      ) : null}
    </div>
  )
}

export default MenuBar
