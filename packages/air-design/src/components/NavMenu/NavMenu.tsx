/**
 * NavMenu 左侧导航菜单
 *
 * 用于全局页面模块切换，固定在页面左侧。支持两种展示模式：
 * - icon：仅图标，栏宽 40px，悬停右侧显示深色 Tooltip
 * - icon-label：图标 + 文字（纵向排列），栏宽 60px
 *
 * 选中项左侧显示主题色竖线指示，与 AirDesign 线条风格一致。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/primitives/tooltip'
import './NavMenu.css'

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
  /** icon-label 模式下的短文案（栏宽 60px 时建议提供） */
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
      <Icon
        name={item.icon}
        size={mode === 'icon' ? 18 : 16}
        color={active ? 'var(--color-primary)' : 'currentColor'}
      />
      {mode === 'icon-label' ? (
        <span className="air-nav-menu-item-label">{item.shortLabel ?? item.label}</span>
      ) : null}
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
