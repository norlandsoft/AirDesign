/**
 * PropertiesNaviBar 属性导航栏
 *
 * 属性页左侧导航，支持分组（type:'group'）与平铺项，选中态高亮；所有可选项上下间距统一 4px，分组标题略大且不可选中。
 * 可通过 width / height 设置尺寸；内容区垂直滚动（overflow-y: auto），禁用水平滚动。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

interface NavItem {
  key: string
  label: string
  type?: 'group'
  children?: NavItem[]
}

interface PropertiesNaviBarProps {
  /** 导航栏宽度 */
  width?: number | string
  /** 导航栏高度 */
  height?: number | string
  /** 内边距 */
  padding?: number | string
  data: NavItem[]
  activeKey: string
  onChange: (key: string) => void
}

const PropertiesNaviBar: React.FC<PropertiesNaviBarProps> = (props) => {
  const {width, height, padding, data, activeKey, onChange} = props

  const renderItem = (item: NavItem) => (
    <div
      key={item.key}
      className={cn(
        'flex h-9 min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded px-3 text-sm',
        item.key === activeKey ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-accent'
      )}
      onClick={() => onChange(item.key)}
    >
      <Icon name="write" size={16} className="shrink-0"/>
      <span className="truncate">{item.label}</span>
    </div>
  )

  return (
    <div
      className="min-w-0 overflow-x-hidden overflow-y-auto"
      style={{width, height, padding}}
    >
      <div className="flex min-w-0 flex-col gap-[4px]">
        {data.map((sub) =>
          sub.type === 'group' ? (
            <div key={sub.key} className="flex flex-col gap-[4px]">
              <div className="select-none px-3 py-2 text-sm font-medium text-muted-foreground">{sub.label}</div>
              {sub.children?.map((item) => renderItem(item))}
            </div>
          ) : (
            renderItem(sub)
          )
        )}
      </div>
    </div>
  )
}

export default PropertiesNaviBar
