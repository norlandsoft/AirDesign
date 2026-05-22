/**
 * Button 毛玻璃风格按钮，支持 default/primary/danger/text/link 五种类型
 * icon 支持 string（图标名，用 Icon 渲染）或 ReactNode
 * 兼容 Ant Design Button 的 htmlType/block/size/className 等属性
 * Created by ChaiMingXu
 */
import React, {FC, MouseEvent, ReactNode} from 'react'
import Icon from '../Icon'
import './index.less'

interface ButtonProps {
  type?: string
  htmlType?: 'submit' | 'reset' | 'button'
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  style?: React.CSSProperties
  disabled?: boolean
  icon?: ReactNode | string
  loading?: boolean
  block?: boolean
  size?: 'small' | 'middle' | 'large'
  className?: string
  children?: ReactNode

  [key: string]: unknown
}

const Button: FC<ButtonProps> = (props) => {
  const {
    children,
    onClick,
    type = 'default',
    htmlType,
    style = {},
    disabled = false,
    icon = null,
    loading = false,
    block,
    size,
    className,
    ...restProps
  } = props

  const isDisabled = disabled || loading
  // primary 和 danger 类型使用白色图标
  const iconColor = type === 'primary' || type === 'danger' ? '#fff' : '#123F68'
  const iconNode =
      icon == null ? null : typeof icon === 'string' ? <Icon name={icon} size={16} color={iconColor}/> : icon

  // 组合 className，支持外部传入和 block 模式
  const classList = ['air-button']
  if (!isDisabled) classList.push(`air-button-${type}`)
  if (className) classList.push(className)
  if (block) classList.push('air-button-block')

  return (
      <button
          type={htmlType}
          tabIndex={-1}
          className={classList.join(' ')}
          onClick={onClick}
          style={style}
          disabled={isDisabled}
          {...restProps}
      >
      <span>
        {iconNode}
        {children}
      </span>
      </button>
  )
}

export default Button
