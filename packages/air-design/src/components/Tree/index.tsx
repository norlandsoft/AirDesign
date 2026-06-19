/**
 * Tree 树形控件
 *
 * 基于 react-arborist 重写（替代 Semi Tree）。保留旧版业务 API：
 * data（key/label/type:group|item/image/children/menu/disabled）/ showFilter / folderIcon / itemIcon /
 * groupMenu / itemMenu / rootButtonClick / menuItemClick / onSelect / onChange / value /
 * defaultExpandedKeys / expandedKeys(受控) / onExpand / clickToCollapse / draggable / onDrop /
 * autoExpandParent / checkable。
 *
 * 每个节点渲染：图标 + 标题（超长省略 + tooltip）+ 悬浮「更多」下拉菜单。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useMemo, useState} from 'react'
import {Tree as ArboristTree} from 'react-arborist'
import type {NodeApi} from 'react-arborist'
import Icon from '@/components/Icon'
import {Input} from '@/primitives/input'
import IconButton from '@/components/Button/IconButton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/primitives/dropdown-menu'
import {cn} from '@/lib/cn'

export interface TreeNode {
  key: string
  label: string
  type?: 'group' | 'item'
  image?: string
  children?: TreeNode[]
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
  folderIcon?: string
  itemIcon?: string
  groupMenu?: TreeMenuItem[]
  itemMenu?: TreeMenuItem[]
  rootButtonClick?: () => void
  menuItemClick?: (item: TreeMenuItem, data: TreeNode) => void
  onSelect?: (node: TreeNode) => void
  onChange?: (keys: string[]) => void
  value?: string
  defaultValue?: string | string[]
  defaultExpandedKeys?: string[]
  expandedKeys?: string[]
  onExpand?: (keys: string[]) => void
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
    checkable = false,
  } = props

  const [term, setTerm] = useState('')
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedKeys)
  const expanded = controlled ?? internalExpanded
  const setExpanded = (keys: string[]) => {
    if (controlled === undefined) setInternalExpanded(keys)
    onExpand?.(keys)
  }

  const filtered = useMemo(() => filterTree(data, term), [data, term])

  // react-arborist 初始展开映射：{ [nodeId]: true }。仅用于初始化，内部展开状态由其自管
  const initialOpen = useMemo(() => {
    const map: Record<string, boolean> = {}
    expanded.forEach((k) => (map[k] = true))
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 同步新增展开键
  useEffect(() => {
    if (controlled === undefined) setInternalExpanded(defaultExpandedKeys)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExpandedKeys.join(',')])

  /** 节点菜单（优先 node.menu，其次按 type 取 groupMenu/itemMenu） */
  const resolveMenu = (node: TreeNode): TreeMenuItem[] | undefined => {
    if (node.menu) return node.menu
    if (node.type === 'group') return groupMenu
    return itemMenu
  }

  const handleMenu = (item: TreeMenuItem, data: TreeNode) => {
    item.onClick?.(item, data)
    menuItemClick?.(item, data)
  }

  const Row = ({node, style}: {node: NodeApi<TreeNode>; style: React.CSSProperties}) => {
    const data = node.data
    const menu = resolveMenu(data)
    const icon = data.image ? data.image : data.type === 'group' ? folderIcon : itemIcon
    const selected = props.value === data.key

    return (
      <div
        style={style}
        className={cn(
          'group flex h-9 items-center gap-1 pr-2 text-sm',
          selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
        )}
        onClick={() => {
          if (!clickToCollapse) {
            if (node.isInternal && !expanded.includes(data.key)) setExpanded([...expanded, data.key])
          } else {
            node.toggle()
          }
          onSelect?.(data)
        }}
      >
        {/* 展开/折叠箭头 */}
        <span className="inline-flex w-4 justify-center text-muted-foreground">
          {node.isInternal ? (
            <Icon name="arrow_down" size={12} className={cn('transition-transform', node.isOpen ? '' : '-rotate-90')}/>
          ) : null}
        </span>
        <Icon name={icon} size={16}/>
        <span className="flex-1 truncate">{data.label}</span>
        {menu && menu.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex size-5 items-center justify-center rounded opacity-0 hover:bg-background group-hover:opacity-100"
              >
                <Icon name="more" size={14}/>
              </button>
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
          initialOpenState={initialOpen}
          onToggle={(id: string) => {
            // 同步展开键集合并通知消费方（react-arborist 自身维护内部展开状态）
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
