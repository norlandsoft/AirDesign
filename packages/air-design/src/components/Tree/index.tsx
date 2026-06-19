/**
 * Tree 树形控件
 *
 * 基于 react-arborist，复刻旧版（Semi Tree）的全部功能、样式与图标：
 * 1. 折叠/展开：默认点击节点仅展开（clickToCollapse=false），三角箭头独立切换；经 TreeApi ref 驱动。
 * 2. 展开/折叠图标：三角形，展开旋转 90°（与旧版一致）。
 * 3. 拖拽：item 可在任意位置/层级间移动，onMove 后同步 localData 并通知 onDrop/onChange。
 * 4. 节点图标：group/item 各有缺省图标（folderIcon/itemIcon，18px），node.image 可自定义。
 * 5. 菜单：group 用 groupMenu、item 用 itemMenu，node.menu 可覆盖；hover 出现「更多」按钮。
 * 6. 文字超长省略，无水平滚动条。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Tree as ArboristTree, type TreeApi} from 'react-arborist'
import type {NodeApi} from 'react-arborist'
import Icon from '@/components/Icon'
import {Input} from '@/primitives/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/primitives/dropdown-menu'
import './index.css'

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
  /** 拖拽后新树结构回调 */
  onChange?: (data: TreeNode[]) => void
  value?: string
  defaultValue?: string | string[]
  defaultExpandedKeys?: string[]
  /** 受控展开键（用于初始化） */
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
    onChange,
    defaultExpandedKeys = [],
    expandedKeys: controlled,
    onExpand,
    clickToCollapse = false,
    draggable = false,
    onDrop,
  } = props

  const apiRef = useRef<TreeApi<any> | null>(null)
  const [term, setTerm] = useState('')

  // 本地数据副本：拖拽 onMove 时更新（react-arborist 不回写 props）
  const [localData, setLocalData] = useState<TreeNode[]>(data)
  useEffect(() => {
    setLocalData(data)
  }, [data])

  const filtered = useMemo(() => filterTree(localData, term), [localData, term])

  // 初始展开映射（仅用于 react-arborist 初始化）
  const initialOpen = useMemo(() => {
    const keys = controlled ?? defaultExpandedKeys
    const map: Record<string, boolean> = {}
    keys.forEach((k) => (map[k] = true))
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  /** 收集当前所有展开键（供 onExpand 通知消费方） */
  const collectOpenKeys = (): string[] => {
    const api = apiRef.current
    if (!api) return []
    const open: string[] = []
    const visit = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (api.isOpen(n.key)) open.push(n.key)
        if (n.children) visit(n.children)
      }
    }
    visit(localData)
    return open
  }

  const Row = ({node, style}: {node: NodeApi<TreeNode>; style: React.CSSProperties}) => {
    const data = node.data
    const menu = resolveMenu(data)
    const iconName = resolveIcon(data)
    const selected = props.value === data.key
    const isInternal = node.isInternal
    const isOpen = node.isOpen
    const hasMenu = !!menu && menu.length > 0

    /** 点击节点行：仅展开（clickToCollapse=false 时不折叠已展开节点） */
    const handleRowClick = () => {
      if (isInternal) {
        if (clickToCollapse) {
          apiRef.current?.toggle(data.key)
        } else if (!isOpen) {
          apiRef.current?.open(data.key)
        }
      }
      onSelect?.(data)
      onExpand?.(collectOpenKeys())
    }

    /** 点击展开箭头：切换展开/折叠（独立于行点击逻辑） */
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isInternal) return
      apiRef.current?.toggle(data.key)
      onExpand?.(collectOpenKeys())
    }

    // 选中态背景色
    const rowStyle: React.CSSProperties = {
      ...style,
      backgroundColor: selected ? 'var(--color-accent)' : undefined,
    }

    return (
      <div
        className={'air-tree-row' + (hasMenu ? ' air-tree-row-with-menu' : '')}
        style={rowStyle}
        onMouseEnter={(e) => {
          if (!selected) e.currentTarget.style.backgroundColor = 'var(--color-accent)'
        }}
        onMouseLeave={(e) => {
          if (!selected) e.currentTarget.style.backgroundColor = 'transparent'
        }}
        onClick={handleRowClick}
      >
        {/* 展开/折叠箭头：三角形，展开旋转 90° */}
        <span
          className={'air-tree-toggle' + (!isInternal ? ' air-tree-toggle-leaf' : '')}
          onClick={handleToggle}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            className={'air-tree-toggle-icon' + (isOpen ? ' air-tree-toggle-open' : '')}
          >
            <path d="M3 1.5L7.5 5L3 8.5z"/>
          </svg>
        </span>

        {/* 节点图标 */}
        <span className="air-tree-node-icon">
          <Icon name={iconName} size={18}/>
        </span>

        {/* 节点文字（超长省略 + tooltip） */}
        <span className="air-tree-node-label" title={data.label}>{data.label}</span>

        {/* 「更多」菜单按钮（hover 显示） */}
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="air-tree-menu-button" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <span className="air-tree-menu-icon">
                  <Icon name="more" size={14}/>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menu!.map((item, i) =>
                item.type === 'divider' ? (
                  <DropdownMenuSeparator key={item.key ?? `d-${i}`}/>
                ) : (
                  <DropdownMenuItem key={item.key ?? i} onClick={(e: React.MouseEvent) => {e.stopPropagation(); handleMenu(item, data)}}>
                    {item.icon && <Icon name={item.icon} size={14}/>}
                    {item.label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  return (
    <div className="air-tree-wrapper" style={{height}}>
      {showFilter && (
        <div className="air-tree-search">
          {rootButtonClick && (
            <button type="button" className="air-tree-root-button" onClick={rootButtonClick} title="新增">
              <Icon name="add" size={20}/>
            </button>
          )}
          <Input value={term} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)} placeholder="搜索..." className="h-8"/>
        </div>
      )}
      <div className="air-tree-list" style={{height: showFilter ? height - 56 : height}}>
        <ArboristTree
          ref={apiRef as any}
          data={filtered as any}
          idAccessor="key"
          initialOpenState={initialOpen}
          rowHeight={36}
          width="100%"
          height={showFilter ? height - 56 : height}
          indent={16}
          disableDrag={!draggable}
          disableDrop={!draggable}
          onMove={(args: any) => {
            const api = apiRef.current
            if (api) {
              const next = (api.root?.children?.map((n: NodeApi<TreeNode>) => n.data) ?? localData) as TreeNode[]
              setLocalData(next)
              onChange?.(next)
            }
            onDrop?.(args)
          }}
        >
          {Row as any}
        </ArboristTree>
      </div>
    </div>
  )
}

export default AirTree
