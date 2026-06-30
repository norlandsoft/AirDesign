/**
 * List 列表控件
 *
 * 可选标题栏 + 可选行列表，支持行选中、自定义左侧渲染、标签渲染、行右键菜单。
 * 已无 UI 库依赖（仅用 Icon/Help/MenuButton），样式改为 Tailwind。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useState} from 'react'
import Icon from '@/components/Icon'
import Help from '@/components/Help'
import MenuButton from '@/components/Button/MenuButton'
import {cn} from '@/lib/cn'

interface ListItemProps {
  id: string
  label?: string
  name?: string
  value: string
  icon?: string
  description?: string
  menu?: any
}

interface ListProps {
  title?: string
  buttonPanel?: React.ReactNode
  data?: ListItemProps[]
  rowSelectable?: boolean
  onRowClick?: (item: ListItemProps) => void
  selectedRow?: ListItemProps
  itemIcon?: string
  leftRender?: (item: ListItemProps) => React.ReactNode
  tagRender?: (item: ListItemProps) => React.ReactNode
  itemMenu?: (item: ListItemProps) => any
  width?: number
  height?: number
  labelMaxWidth?: number
}

const List: React.FC<ListProps> = (props) => {
  const {
    data,
    rowSelectable = true,
    onRowClick = () => {},
    selectedRow,
    itemIcon = 'item',
    leftRender,
    tagRender,
    itemMenu,
    title,
    buttonPanel,
    width,
    height,
    labelMaxWidth,
  } = props

  const hasHeader = title || buttonPanel
  const [current, setCurrent] = useState<ListItemProps | undefined>(undefined)

  useEffect(() => {
    setCurrent(selectedRow)
  }, [selectedRow])

  return (
    <div className="flex flex-col" style={{width, height}}>
      {hasHeader && (
        <div className="flex h-[3.125rem] shrink-0 items-center justify-between border-b px-3">
          {title && <span className="text-sm font-medium">{title}</span>}
          {buttonPanel}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {data && data.length > 0 && data.map((item, index) => {
          const selected = current && item.id === current.id
          return (
            <div
              key={index}
              className={cn(
                'flex h-9 items-center justify-between px-3 text-sm',
                rowSelectable && 'cursor-pointer',
                selected ? 'bg-accent' : 'hover:bg-accent/50'
              )}
              style={labelMaxWidth ? undefined : undefined}
              onClick={() => {
                if (rowSelectable) {
                  setCurrent(item)
                  onRowClick(item)
                }
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                {leftRender ? (
                  leftRender(item)
                ) : (
                  <Icon name={item.icon ?? itemIcon} size={16}/>
                )}
                <span className="truncate" style={{maxWidth: labelMaxWidth}}>{item.name ?? item.label}</span>
                {item.description && <Help icon="tags" text={item.description}/>}
              </div>
              <div className="flex items-center gap-2">
                {tagRender && tagRender(item)}
                {itemMenu && <MenuButton size={22} items={itemMenu(item)}/>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List
