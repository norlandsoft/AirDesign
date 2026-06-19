/**
 * Help 帮助提示
 *
 * 在图标上悬浮显示文字说明，底层基于 primitives/tooltip。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import Icon from '@/components/Icon'
import {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from '@/primitives/tooltip'

interface HelpProps {
  icon?: string
  size?: number
  text?: string
}

const Help: React.FC<HelpProps> = (props) => {
  const {icon = 'help', size = 14, text = ''} = props

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help" style={{width: size, height: size}}>
            <Icon name={icon} size={size}/>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Help
