import React, { useState } from 'react'
import { Button, Dropdown } from 'antd'
import Icon from '../Icon'

const TableRowMenu: React.FC<any> = (props) => {
  const { items, data = undefined } = props
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setVisible(open)
  }

  const handleMouseEnter = () => {
    setHovered(true)
  }

  const handleMouseLeave = () => {
    setHovered(false)
  }

  const menuItems = items.map((item: any, index: number) => {
    if (item.type === 'split') {
      return {
        key: item.key || `split-${index}`,
        type: 'divider' as const,
      }
    }
    return {
      key: item.key || String(index),
      disabled: item.disabled,
      label: item.label,
      onClick: () => {
        if (!item.disabled && item.onClick) item.onClick(item, data)
      },
    }
  })

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      onOpenChange={handleOpenChange}
      menu={{ items: menuItems }}
    >
      <Button
        type="text"
        onClick={(e) => {
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        icon={<Icon name={'more'} size={22} />}
        size="small"
        style={{
          background: visible || hovered ? '#eee' : 'transparent',
          border: visible || hovered ? '1px solid #e0e0e0' : 'none',
          padding: 0,
        }}
      />
    </Dropdown>
  )
}

export default TableRowMenu
