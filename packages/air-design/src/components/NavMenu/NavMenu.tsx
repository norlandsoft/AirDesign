/**
 * NavMenu 左侧导航菜单
 *
 * 用于全局页面模块切换，固定在页面左侧。支持两种展示模式：
 * - icon：仅图标，栏宽固定 40px（不随字号档位变化），图标 20px，悬停右侧显示深色 Tooltip
 * icon-label：图标 + 文字纵向排列，栏宽固定 60px，图标 20px，背景块 48×48（1:1）。
 *
 * icon-label 选中/悬停以圆角背景块高亮；icon 模式保留左侧竖线指示。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/primitives/tooltip'
import './NavMenu.css'

/** NavMenu 菜单项图标尺寸（icon / icon-label 模式统一） */
const NAV_MENU_ICON_SIZE = 20

/** 导航展示模式 */
export type NavMenuMode = 'icon' | 'icon-label'

/** 导航项配置 */
export interface NavMenuItem {
  /** 唯一标识 */
  key: string
  /** 图标名（Icon 组件） */
  icon: string
  /** 菜单文案；icon 模式下悬停右侧 Tooltip 展示 */
  label: string
  /** icon-label 模式下的短文案（建议 2～4 字） */
  shortLabel?: string
  /** 是否禁用 */
  disabled?: boolean
}

export interface NavMenuProps {
  /** 菜单项列表 */
  items: NavMenuItem[]
  /** 展示模式，默认 icon-label */
  mode?: NavMenuMode
  /** 受控选中项 key */
  selectedKey?: string
  /** 非受控默认选中项 */
  defaultSelectedKey?: string
  /** 选中变化回调 */
  onSelect?: (key: string) => void
  className?: string
  style?: React.CSSProperties
}

const NavMenu: React.FC<NavMenuProps> = ({
  items,
  mode = 'icon-label',
  selectedKey: selectedKeyProp,
  defaultSelectedKey = '',
  onSelect,
  className,
  style,
}) => {
  const [innerKey, setInnerKey] = useState(defaultSelectedKey)
  const selectedKey = selectedKeyProp ?? innerKey

  const handleSelect = (key: string, disabled?: boolean) => {
    if (disabled) return
    if (selectedKeyProp == null) setInnerKey(key)
    onSelect?.(key)
  }

  const renderItemButton = (item: NavMenuItem, active: boolean) => (
    <button
      type="button"
      className={cn('air-nav-menu-item', active && 'air-nav-menu-item-active')}
      disabled={item.disabled}
      aria-current={active ? 'page' : undefined}
      aria-label={mode === 'icon' ? item.label : undefined}
      onClick={() => handleSelect(item.key, item.disabled)}
    >
      <span className="air-nav-menu-item-inner">
        <Icon
          name={item.icon}
          size={NAV_MENU_ICON_SIZE}
          color={mode === 'icon-label' ? 'var(--color-primary)' : active ? 'var(--color-primary)' : 'currentColor'}
          className="air-nav-menu-item-icon"
        />
        {mode === 'icon-label' ? (
          <span className="air-nav-menu-item-label">{item.shortLabel ?? item.label}</span>
        ) : null}
      </span>
    </button>
  )

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        className={cn(
          'air-nav-menu',
          mode === 'icon' ? 'air-nav-menu--icon' : 'air-nav-menu--icon-label',
          className
        )}
        style={style}
        aria-label="模块导航"
      >
        {items.map((item) => {
          const active = item.key === selectedKey
          const button = renderItemButton(item, active)

          if (mode !== 'icon') {
            return <React.Fragment key={item.key}>{button}</React.Fragment>
          }

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="air-nav-menu-tooltip">
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}

export default NavMenu
