/**
 * ToggleButton 切换按钮
 *
 * 带 selected 选中态的图标按钮。选中时高亮背景，未选中时透明。
 * 外观支持 circle/square/default，基于设计 Token。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

interface ToggleButtonProps {
  icon: string
  size?: number
  shape?: 'circle' | 'square' | 'default'
  selected: boolean
  onClick?: () => void
  border?: boolean
  /** 选中态背景色（Token 友好，默认 accent） */
  selectedColor?: string
  className?: string
}

const ToggleButton: React.FC<ToggleButtonProps> = (props) => {
  const {
    icon,
    size = 24,
    shape = 'default',
    selected,
    onClick,
    border = false,
    selectedColor = 'var(--color-accent)',
    className,
  } = props

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center transition-colors',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        border && 'border border-border',
        !selected && 'border border-transparent',
        className
      )}
      style={{
        height: size,
        width: size,
        backgroundColor: selected ? selectedColor : 'transparent',
      }}
      data-selected={selected || undefined}
    >
      <Icon name={icon} size={size - 12}/>
    </button>
  )
}

export default ToggleButton
