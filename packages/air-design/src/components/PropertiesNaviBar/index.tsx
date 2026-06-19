/**
 * PropertiesNaviBar 属性导航栏
 *
 * 属性页左侧导航，支持分组（type:'group'）与平铺项，选中态高亮。
 * 已无 UI 库依赖，样式改为 Tailwind。
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
  width?: number | string
  height?: number | string
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
        'flex h-9 cursor-pointer items-center gap-2 rounded px-3 text-sm',
        item.key === activeKey ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-accent'
      )}
      onClick={() => onChange(item.key)}
    >
      <Icon name="write" size={16}/>
      {item.label}
    </div>
  )

  return (
    <div className="overflow-auto" style={{width, height, padding}}>
      {data.map((sub) =>
        sub.type === 'group' ? (
          <div key={sub.key} className="mb-2">
            <div className="px-3 py-1 text-xs font-medium text-muted-foreground">{sub.label}</div>
            {sub.children?.map((item) => renderItem(item))}
          </div>
        ) : (
          renderItem(sub)
        )
      )}
    </div>
  )
}

export default PropertiesNaviBar
