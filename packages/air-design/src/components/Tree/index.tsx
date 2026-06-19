/**
 * Tree 树形控件
 *
 * 基于 react-arborist 重写，对齐旧版（Semi Tree）业务 API 与交互：
 * 1. 折叠/展开：默认点击节点仅展开（clickToCollapse=false 时点击已展开节点不折叠），
 *    展开箭头独立控制折叠；
 * 2. 展开/折叠箭头样式：三角形，展开时旋转 90°（与旧版一致）；
 * 3. 拖拽：item 可在任意位置/层级间移动（draggable + onDrop）；
 * 4. 节点图标：group/item 各有缺省图标（folderIcon/itemIcon），node.image 可自定义；
 * 5. 菜单：group 用 groupMenu、item 用 itemMenu，node.menu 可覆盖；hover 出现「更多」按钮。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useMemo, useState} from 'react'
import {Tree as ArboristTree} from 'react-arborist'
import type {NodeApi} from 'react-arborist'
import Icon from '@/components/Icon'
import {Input} from '@/components/primitives/input'
import IconButton from '@/components/Button/IconButton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/primitives/dropdown-menu'
import {cn} from '@/lib/cn'

export interface TreeNode {
  key: string
  label: string
  type?: 'group' | 'item'
  /** 自定义图标名（覆盖 folderIcon/itemIcon） */
  image?: string
  children?: TreeNode[]
  /** 节点级菜单（覆盖 groupMenu/itemMenu） */
  menu?: TreeMenuItem[]
  disabled?: boolean
  [key: string]: any
}

export interface TreeMenuItem {
  key?: string
  label?: React.ReactNode
  icon?: string
  type?: 'divider'
  onClick?: (item: TreeMenuItem, data: TreeNode) => void
}

interface TreeProps {
  data: TreeNode[]
  height?: number
  showFilter?: boolean
  /** group 缺省图标名 */
  folderIcon?: string
  /** item 缺省图标名 */
  itemIcon?: string
  /** group 节点菜单 */
  groupMenu?: TreeMenuItem[]
  /** item 节点菜单 */
  itemMenu?: TreeMenuItem[]
  rootButtonClick?: () => void
  /** 菜单项点击回调（item, data） */
  menuItemClick?: (item: TreeMenuItem, data: TreeNode) => void
  onSelect?: (node: TreeNode) => void
  onChange?: (keys: string[]) => void
  value?: string
  defaultValue?: string | string[]
  defaultExpandedKeys?: string[]
  /** 受控展开键 */
  expandedKeys?: string[]
  onExpand?: (keys: string[]) => void
  /** true 时点击已展开节点会折叠；false（默认）时点击只展开、不折叠 */
  clickToCollapse?: boolean
  draggable?: boolean
  onDrop?: (info: any) => void
  autoExpandParent?: boolean
  checkable?: boolean
}

/** 扁平化搜索：保留命中节点及其祖先链 */
function filterTree(nodes: TreeNode[], term: string): TreeNode[] {
  if (!term) return nodes
  const lower = term.toLowerCase()
  const walk = (list: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = []
    for (const node of list) {
      const matched = node.label.toLowerCase().includes(lower)
      const children = node.children ? walk(node.children) : []
      if (matched || children.length) {
        result.push({...node, children: children.length ? children : node.children})
      }
    }
    return result
  }
  return walk(nodes)
}

const AirTree: React.FC<TreeProps> = (props) => {
  const {
    data,
    height = 200,
    showFilter = false,
    folderIcon = 'folder',
    itemIcon = 'document',
    groupMenu,
    itemMenu,
    rootButtonClick,
    menuItemClick,
    onSelect,
    defaultExpandedKeys = [],
    expandedKeys: controlled,
    onExpand,
    clickToCollapse = false,
    draggable = false,
    onDrop,
  } = props

  const [term, setTerm] = useState('')
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedKeys)
  const expanded = controlled ?? internalExpanded
  const setExpanded = (keys: string[]) => {
    if (controlled === undefined) setInternalExpanded(keys)
    onExpand?.(keys)
  }

  const filtered = useMemo(() => filterTree(data, term), [data, term])

  // react-arborist 初始展开映射：{ [nodeId]: true }，仅用于初始化（内部展开状态由其自管）
  const initialOpen = useMemo(() => {
    const map: Record<string, boolean> = {}
    expanded.forEach((k) => (map[k] = true))
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (controlled === undefined) setInternalExpanded(defaultExpandedKeys)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExpandedKeys.join(',')])

  /** 节点菜单：优先 node.menu，其次按 type 取 groupMenu/itemMenu */
  const resolveMenu = (node: TreeNode): TreeMenuItem[] | undefined => {
    if (node.menu) return node.menu
    if (node.type === 'group') return groupMenu
    return itemMenu
  }

  /** 节点图标：node.image 优先，否则按 type 取 folderIcon/itemIcon */
  const resolveIcon = (node: TreeNode): string => node.image ?? (node.type === 'group' ? folderIcon : itemIcon)

  const handleMenu = (item: TreeMenuItem, data: TreeNode) => {
    item.onClick?.(item, data)
    menuItemClick?.(item, data)
  }

  const Row = ({node, style}: {node: NodeApi<TreeNode>; style: React.CSSProperties}) => {
    const data = node.data
    const menu = resolveMenu(data)
    const iconName = resolveIcon(data)
    const selected = props.value === data.key
    const isOpen = node.isOpen
    const isInternal = node.isInternal
    const isExpanded = expanded.includes(data.key)

    /** 点击节点行：仅展开（clickToCollapse=false 时不折叠已展开节点） */
    const handleRowClick = () => {
      if (isInternal) {
        if (clickToCollapse) {
          // 切换展开/折叠
          setExpanded(isExpanded ? expanded.filter((k) => k !== data.key) : [...expanded, data.key])
        } else if (!isExpanded) {
          // 只展开，不折叠
          setExpanded([...expanded, data.key])
        }
      }
      onSelect?.(data)
    }

    /** 点击展开箭头：切换展开/折叠（独立于行点击逻辑） */
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isInternal) return
      setExpanded(isExpanded ? expanded.filter((k) => k !== data.key) : [...expanded, data.key])
    }

    return (
      <div
        style={style}
        className={cn(
          'group flex h-9 items-center gap-1 pr-2 text-sm',
          selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
        )}
        onClick={handleRowClick}
      >
        {/* 展开/折叠箭头：三角形，展开旋转 90° */}
        <span
          className={cn('inline-flex w-4 shrink-0 items-center justify-center', isInternal ? 'cursor-pointer text-muted-foreground' : 'opacity-0')}
          onClick={handleToggle}
        >
          {isInternal && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              className={cn('transition-transform duration-150', isExpanded ? 'rotate-90' : '')}
            >
              <path d="M3 1.5L7.5 5L3 8.5z"/>
            </svg>
          )}
        </span>

        {/* 节点图标 */}
        <Icon name={iconName} size={16}/>

        {/* 节点文字（超长省略 + tooltip） */}
        <span className="flex-1 truncate" title={data.label}>{data.label}</span>

        {/* 「更多」菜单按钮（hover 出现） */}
        {menu && menu.length > 0 && (
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="inline-flex size-5 cursor-pointer items-center justify-center rounded hover:bg-background">
                  <Icon name="more" size={14}/>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menu.map((item, i) =>
                  item.type === 'divider' ? (
                    <DropdownMenuSeparator key={item.key ?? `d-${i}`}/>
                  ) : (
                    <DropdownMenuItem key={item.key ?? i} onClick={(e) => {e.stopPropagation(); handleMenu(item, data)}}>
                      {item.icon && <Icon name={item.icon} size={14}/>}
                      {item.label}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{height}}>
      {showFilter && (
        <div className="flex items-center gap-2 px-3 py-2">
          {rootButtonClick && (
            <IconButton icon="add" size={28} tooltip="新增" onClick={rootButtonClick}/>
          )}
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="搜索..." className="h-8"/>
        </div>
      )}
      <div style={{height: showFilter ? height - 56 : height}}>
        <ArboristTree
          data={filtered as any}
          idAccessor="key"
          initialOpenState={initialOpen}
          onToggle={(id: string) => {
            // react-arborist 内部箭头切换：同步到受控展开键集合并通知消费方
            const isOpen = expanded.includes(id)
            setExpanded(isOpen ? expanded.filter((k) => k !== id) : [...expanded, id])
          }}
          rowHeight={36}
          width="100%"
          height={showFilter ? height - 56 : height}
          indent={16}
          disableDrag={!draggable}
          disableDrop={!draggable}
          onMove={(args: any) => onDrop?.(args)}
        >
          {Row as any}
        </ArboristTree>
      </div>
    </div>
  )
}

export default AirTree
