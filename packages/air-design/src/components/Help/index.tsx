/**
 * Help 帮助提示
 *
 * 展示 help 小图标，鼠标 hover 时以 Tooltip 显示说明文字（过长自动换行）；
 * 适用于表单标签旁、列表项说明等场景。基于 primitives/tooltip。
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/primitives/tooltip'
import './index.css'

export interface HelpProps {
  /** 提示文案（与 children 二选一，优先 text） */
  text?: React.ReactNode
  /** Tooltip 自定义内容（text 未传时使用） */
  children?: React.ReactNode
  /** 图标名，默认 help */
  icon?: string
  /** 图标尺寸，默认 14 */
  size?: number
  /** Tooltip 弹出方位，默认 top */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** 触发器外层 className */
  className?: string
}

const Help: React.FC<HelpProps> = (props) => {
  const {
    text,
    children,
    icon = 'help',
    size = 14,
    side = 'top',
    className,
  } = props

  const content = text ?? children
  if (content == null || content === '') {
    return null
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn('air-help-trigger', className)}
            style={{width: size, height: size}}
            aria-label="帮助说明"
          >
            <Icon name={icon} size={size} color="currentColor"/>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          className={cn(
            'air-help-tooltip h-auto max-w-[280px] overflow-visible whitespace-normal',
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Help
