import React, { useState } from 'react'
import { Dropdown } from 'antd'
import Icon from '../Icon'
import './MenuButton.less'

interface MenuButtonProps {
  size?: number
  items: any
  type?: 'horizontal' | 'vertical'
  transClickEvent?: boolean
  innerMargin?: number
  style?: any
}

const MenuButton: React.FC<MenuButtonProps> = (props) => {
  const {
    size = 24,
    items,
    type = 'horizontal',
    transClickEvent = false,
    innerMargin = 4,
    style,
  } = props

  const [visible, setVisible] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setVisible(open)
  }

  const menuItems = items
    .map((item: any, index: number) => {
      if (item.type === 'split') {
        return {
          key: `split-${index}`,
          type: 'divider' as const,
        }
      }
      if (item.disabled) return null
      return {
        key: String(index),
        label: item.label,
        onClick: () => {
          if (item.onClick) {
            item.onClick()
          }
          setVisible(false)
        },
      }
    })
    .filter(Boolean)

  return (
    <Dropdown
      trigger={['click']}
      open={visible}
      onOpenChange={handleOpenChange}
      menu={{ items: menuItems }}
    >
      <div
        className={'air-menu-button'}
        style={{ width: size, height: size, lineHeight: size, margin: innerMargin, ...style }}
        onClick={(e) => {
          if (!transClickEvent) {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
          }
        }}
      >
        <Icon name={type === 'horizontal' ? 'more' : 'menu'} size={size - 8} />
      </div>
    </Dropdown>
  )
}

export default MenuButton
