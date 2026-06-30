/**
 * Tree 树形控件
 *
 * 基于 react-arborist，完整迁移 JettoAuthor（Semi Tree）的功能、样式与交互：
 * 1. 折叠/展开：clickToCollapse 控制点击行行为；三角箭头独立切换。
 * 2. 受控/非受控 expandedKeys、value/defaultValue，autoExpandParent 自动展开父链。
 * 3. 搜索过滤：内置 searchTerm 匹配 label，过滤时自动展开命中节点的祖先。
 * 4. 拖拽：dragHandle 挂载行元素，onMove 同步 localData 并触发 onChange/onDrop。
 * 5. 节点图标：group/item 缺省图标（folderIcon/itemIcon），node.image 可覆盖。
 * 6. 菜单：groupMenu/itemMenu，node.menu 可覆盖；hover 显示「更多」按钮。
 * 7. disabled 节点：group 点击标签展开；item 带 menu 时保留特殊点击逻辑。
 * 8. group 节点默认不可选中，但点击/箭头仍可展开/折叠。
 * 9. checkable：多选勾选框模式（兼容 Semi multiple）。
 * 10. 文字超长省略 + Tooltip，无水平滚动条。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Tree as ArboristTree, type TreeApi} from 'react-arborist'
import type {NodeApi} from 'react-arborist'
import Icon from '@/components/Icon'
import {Input} from '@/primitives/input'
import {Checkbox} from '@/primitives/checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/primitives/dropdown-menu'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/primitives/tooltip'
import {cn} from '@/lib/cn'
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
  /** 受控展开键 */
  expandedKeys?: string[]
  onExpand?: (keys: string[]) => void
  /** true 时点击已展开节点会折叠；false（默认）时点击只展开、不折叠 */
  clickToCollapse?: boolean
  draggable?: boolean
  onDrop?: (info: any) => void
  autoExpandParent?: boolean
  /** 阻止菜单按钮点击事件冒泡（默认 true，与 JettoAuthor 一致） */
  stopMenuEventPropagation?: boolean
  checkable?: boolean
  /** group 节点是否允许选中，默认 false（与 JettoAuthor 业务一致） */
  groupSelectable?: boolean
}

/** 按 key 查找节点 */
function findNodeByKey(nodes: TreeNode[], key: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.key === key) return n
    if (n.children) {
      const found = findNodeByKey(n.children, key)
      if (found) return found
    }
  }
  return undefined
}

/** 收集树中所有 internal 节点 key */
function collectInternalKeys(nodes: TreeNode[]): string[] {
  const keys: string[] = []
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      if (n.children && n.children.length > 0) {
        keys.push(n.key)
        walk(n.children)
      }
    }
  }
  walk(nodes)
  return keys
}

const SEARCH_BAR_HEIGHT = 60
const ROW_HEIGHT = 32

/** 判断节点是否允许选中（group 默认不可选，disabled 不可选） */
function isNodeSelectable(node: TreeNode, groupSelectable: boolean): boolean {
  if (node.disabled) return false
  if (node.type === 'group' && !groupSelectable) return false
  return true
}

/** 自定义 Row：不绑定 node.handleClick，展开/折叠与选中由 Node 渲染器自行处理 */
function TreeRow({
  attrs,
  innerRef,
  children,
}: {
  node: NodeApi<TreeNode>
  attrs: React.HTMLAttributes<HTMLDivElement>
  innerRef: (el: HTMLDivElement | null) => void
  children: React.ReactElement
}) {
  return (
    <div {...attrs} ref={innerRef} onFocus={(e) => e.stopPropagation()}>
      {children}
    </div>
  )
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
    value,
    defaultValue,
    defaultExpandedKeys = [],
    expandedKeys: controlledExpandedKeys,
    onExpand,
    clickToCollapse = false,
    draggable = false,
    onDrop,
    autoExpandParent = false,
    stopMenuEventPropagation = true,
    checkable = false,
    groupSelectable = false,
  } = props

  const apiRef = useRef<TreeApi<TreeNode> | null>(null)
  const prevValueRef = useRef<string | undefined>(undefined)
  /** patchExpandedKey 期间跳过 onToggle 触发的 sync，避免与受控 expandedKeys 冲突 */
  const suppressExpandSyncRef = useRef(false)
  const [term, setTerm] = useState('')
  const [localData, setLocalData] = useState<TreeNode[]>(data)

  // 非受控展开键
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(defaultExpandedKeys)
  const expandedKeys = controlledExpandedKeys !== undefined ? controlledExpandedKeys : internalExpandedKeys

  const setExpandedKeys = useCallback(
    (keys: string[] | ((prev: string[]) => string[])) => {
      const current = controlledExpandedKeys !== undefined ? controlledExpandedKeys : internalExpandedKeys
      const newKeys = typeof keys === 'function' ? keys(current) : keys
      if (controlledExpandedKeys === undefined) {
        setInternalExpandedKeys(newKeys)
      }
      onExpand?.(newKeys)
    },
    [controlledExpandedKeys, internalExpandedKeys, onExpand]
  )

  const setExpandedKeysRef = useRef(setExpandedKeys)
  setExpandedKeysRef.current = setExpandedKeys

  /** 展开/折叠单个节点，同步 expandedKeys 与 TreeApi（避免 toggle 后 collectOpenKeys 滞后导致无法折叠） */
  const patchExpandedKey = useCallback(
    (key: string, open: boolean) => {
      suppressExpandSyncRef.current = true
      setExpandedKeys((prev) =>
        open ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter((k) => k !== key)
      )
      const api = apiRef.current
      if (api) {
        if (open) api.open(key)
        else api.close(key)
      }
      requestAnimationFrame(() => {
        suppressExpandSyncRef.current = false
      })
    },
    [setExpandedKeys]
  )

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const listHeight = showFilter ? height - SEARCH_BAR_HEIGHT : height

  // 初始展开映射（react-arborist 初始化用）
  const initialOpen = useMemo(() => {
    const map: Record<string, boolean> = {}
    expandedKeys.forEach((k) => (map[k] = true))
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 受控 expandedKeys 同步到 TreeApi */
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const allInternal = collectInternalKeys(localData)
    for (const key of allInternal) {
      const shouldOpen = expandedKeys.includes(key)
      const isOpen = api.isOpen(key)
      if (shouldOpen && !isOpen) api.open(key)
      if (!shouldOpen && isOpen) api.close(key)
    }
  }, [expandedKeys, localData])

  /** 传给 react-arborist 的 selection：跳过不可选中的 group */
  const selectionKey = useMemo(() => {
    if (value === undefined) return undefined
    const target = findNodeByKey(localData, value)
    if (target && !isNodeSelectable(target, groupSelectable)) return undefined
    return value
  }, [value, localData, groupSelectable])

  /** 受控 value 变化时同步（仅 value 变更时执行，避免折叠时 select→scrollTo→openParents 重新展开） */
  useEffect(() => {
    if (value === undefined) return
    if (prevValueRef.current === value) return
    prevValueRef.current = value

    const api = apiRef.current
    if (!api) return
    const target = findNodeByKey(localData, value)
    if (target && !isNodeSelectable(target, groupSelectable)) return

    if (autoExpandParent) {
      api.openParents(value)
      requestAnimationFrame(() => {
        const open: string[] = []
        for (const key of collectInternalKeys(localData)) {
          if (api.isOpen(key)) open.push(key)
        }
        setExpandedKeysRef.current(open)
      })
    }
  }, [value, autoExpandParent, localData, groupSelectable])

  /** defaultValue 初始化选中（跳过 group 节点） */
  useEffect(() => {
    const api = apiRef.current
    if (!api || !defaultValue) return
    const selectId = (id: string) => {
      const target = findNodeByKey(localData, id)
      if (target && !isNodeSelectable(target, groupSelectable)) return
      api.selectMulti(id, {focus: false})
    }
    if (Array.isArray(defaultValue)) {
      defaultValue.forEach(selectId)
    } else {
      const target = findNodeByKey(localData, defaultValue)
      if (target && !isNodeSelectable(target, groupSelectable)) return
      api.select(defaultValue, {focus: false})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 节点菜单：优先 node.menu，其次按 type 取 groupMenu/itemMenu；无 type 时用 itemMenu */
  const resolveMenu = (node: TreeNode): TreeMenuItem[] | undefined => {
    if (node.menu) return node.menu
    if (node.type === 'group') return groupMenu
    if (node.type === 'item') return itemMenu
    return itemMenu
  }

  /** 节点图标 */
  const resolveIcon = (node: TreeNode): string =>
    node.image ?? (node.type === 'group' ? folderIcon : itemIcon)

  /** 是否显示菜单按钮 */
  const hasMenu = (node: TreeNode): boolean => {
    const menu = resolveMenu(node)
    return !!menu && menu.length > 0
  }

  const handleMenu = (item: TreeMenuItem, nodeData: TreeNode) => {
    item.onClick?.(item, nodeData)
    menuItemClick?.(item, nodeData)
  }

  /** 拖拽后提取新树结构 */
  const extractTreeData = (): TreeNode[] => {
    const api = apiRef.current
    if (!api?.root?.children) return localData
    return api.root.children.map((n: NodeApi<TreeNode>) => n.data) as TreeNode[]
  }

  /** 展开/折叠后通知外部（搜索过滤等场景，由 react-arborist 内部触发时使用） */
  const syncExpandedFromApi = () => {
    if (suppressExpandSyncRef.current) return
    requestAnimationFrame(() => {
      if (suppressExpandSyncRef.current) return
      const api = apiRef.current
      if (!api) return
      const open: string[] = []
      for (const key of collectInternalKeys(localData)) {
        if (api.isOpen(key)) open.push(key)
      }
      setExpandedKeysRef.current(open)
    })
  }

  /** disabled 节点标签点击（与 JettoAuthor 一致） */
  const handleDisabledLabelClick = (e: React.MouseEvent, nodeData: TreeNode) => {
    e.stopPropagation()
    if (nodeData.type === 'group' && !expandedKeys.includes(nodeData.key)) {
      patchExpandedKey(nodeData.key, true)
    }
  }

  const Row = ({
    node,
    style,
    dragHandle,
  }: {
    node: NodeApi<TreeNode>
    style: React.CSSProperties
    dragHandle?: (el: HTMLDivElement | null) => void
  }) => {
    const nodeData = node.data
    const menu = resolveMenu(nodeData)
    const iconName = resolveIcon(nodeData)
    const selectable = isNodeSelectable(nodeData, groupSelectable)
    const selected = selectable && (value !== undefined ? value === nodeData.key : node.isSelected)
    const isInternal = node.isInternal
    const isOpen = node.isOpen
    const showMenu = hasMenu(nodeData)
    const disabled = !!nodeData.disabled
    const isGroup = nodeData.type === 'group'

    /** 点击节点行：内部节点始终可展开/折叠；选中/onSelect 仅对可选节点生效 */
    const handleRowClick = (e: React.MouseEvent) => {
      if (disabled) return

      if (isInternal) {
        if (clickToCollapse) {
          patchExpandedKey(nodeData.key, !isOpen)
        } else if (!isOpen) {
          patchExpandedKey(nodeData.key, true)
        }
      }

      if (!selectable) {
        e.stopPropagation()
        return
      }

      if (checkable) {
        node.selectMulti()
      } else {
        node.select()
      }

      onSelect?.(nodeData)
    }

    /** 点击展开箭头：与 groupSelectable 无关，始终切换展开状态 */
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isInternal || disabled) return
      patchExpandedKey(nodeData.key, !isOpen)
    }

    /** 勾选框切换（group 不显示勾选框） */
    const handleCheck = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (disabled || !selectable) return
      if (node.isSelected) {
        node.deselect()
      } else {
        node.selectMulti()
      }
      onSelect?.(nodeData)
    }

    const rowStyle: React.CSSProperties = {
      ...style,
      backgroundColor: selected ? 'var(--color-accent)' : undefined,
    }

    return (
      <div
        ref={dragHandle}
        className={cn(
          'air-tree-row',
          showMenu && 'air-tree-row-with-menu',
          disabled && 'air-tree-row-disabled',
          isGroup && !groupSelectable && 'air-tree-row-group'
        )}
        style={rowStyle}
        onClick={handleRowClick}
      >
        {/* 勾选框（checkable 模式） */}
        {checkable && selectable && (
          <span className="air-tree-checkbox" onClick={handleCheck}>
            <Checkbox checked={node.isSelected} disabled={disabled} tabIndex={-1}/>
          </span>
        )}

        {/* 展开/折叠箭头 */}
        <span
          className={cn('air-tree-toggle', !isInternal && 'air-tree-toggle-leaf')}
          onClick={handleToggle}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            className={cn('air-tree-toggle-icon', isOpen && 'air-tree-toggle-open')}
          >
            <path d="M3 1.5L7.5 5L3 8.5z"/>
          </svg>
        </span>

        {/* 标签区：图标 + 文字 + 菜单按钮 */}
        <div
          className={cn('air-tree-label', showMenu && 'air-tree-label-with-button')}
          onClick={disabled ? (e) => handleDisabledLabelClick(e, nodeData) : undefined}
        >
          <span className="air-tree-node-icon">
            <Icon name={iconName} size={18}/>
          </span>

          <Tooltip>
              <TooltipTrigger asChild>
                <span className="air-tree-node-label">{nodeData.label}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {nodeData.label}
              </TooltipContent>
            </Tooltip>

          {showMenu && menu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="air-tree-menu-button"
                  onClick={(e: React.MouseEvent) => {
                    if (stopMenuEventPropagation) {
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                    }
                  }}
                >
                  <Icon name="more" size={14}/>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[6.25rem]">
                {menu.map((item, i) =>
                  item.type === 'divider' ? (
                    <DropdownMenuSeparator key={item.key ?? `d-${i}`}/>
                  ) : (
                    <DropdownMenuItem
                      key={item.key ?? i}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        handleMenu(item, nodeData)
                      }}
                    >
                      {item.icon && <Icon name={item.icon} size={14}/>}
                      {item.label}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={400}>
    <div
      className="air-tree-wrapper"
      style={{
        height,
        ...(draggable ? {overflow: 'auto'} : {}),
      }}
    >
      {showFilter && (
        <div
          className="air-tree-search"
          style={{paddingLeft: rootButtonClick ? 44 : 12}}
        >
          {rootButtonClick && (
            <button type="button" className="air-tree-root-button" onClick={rootButtonClick} title="新增">
              <Icon name="add" size={18}/>
            </button>
          )}
          <Input
            value={term}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)}
            placeholder="搜索..."
            className="air-tree-search-input"
          />
        </div>
      )}
      <div className="air-tree-list" style={{height: listHeight}}>
        <ArboristTree
          ref={apiRef as any}
          data={localData as any}
          idAccessor="key"
          initialOpenState={initialOpen}
          rowHeight={ROW_HEIGHT}
          width="100%"
          height={listHeight}
          indent={16}
          disableDrag={!draggable ? true : (nodeData: TreeNode) => !!nodeData?.disabled}
          disableDrop={!draggable}
          disableMultiSelection={!checkable}
          disableSelect={(nodeData: TreeNode) =>
            !!nodeData?.disabled || (nodeData?.type === 'group' && !groupSelectable)
          }
          renderRow={TreeRow as any}
          {...(selectionKey !== undefined ? {selection: selectionKey} : {})}
          searchTerm={showFilter ? term : ''}
          searchMatch={((n: NodeApi<TreeNode>, t: string) =>
            (n.data?.label ?? '').toLowerCase().includes(t.toLowerCase())) as any}
          onToggle={() => syncExpandedFromApi()}
          onMove={(args) => {
            const next = extractTreeData()
            setLocalData(next)
            onChange?.(next)
            onDrop?.(args)
          }}
        >
          {Row as any}
        </ArboristTree>
      </div>
    </div>
    </TooltipProvider>
  )
}

export default AirTree
