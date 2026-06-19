/**
 * GroupSplitter 分组分隔条
 *
 * 左侧分隔线 + 标题，用于内容区块分组。样式改为 Tailwind。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'

interface GroupSplitterProps {
  title: string
  height?: number
  paddingTop?: number
}

const GroupSplitter: React.FC<GroupSplitterProps> = (props) => {
  const {title, height = 32, paddingTop = 0} = props

  return (
    <div className="flex items-center" style={{height, marginTop: paddingTop}}>
      <span className="mr-2 inline-block h-px flex-1 bg-border"/>
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
    </div>
  )
}

export default GroupSplitter
