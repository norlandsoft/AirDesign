import React, { useState } from 'react'
import { Button, Dropdown, Input, Tree, Typography } from 'antd'
import Icon from '../Icon'
import './index.less'

interface TreeProps {
  data: any[]
  height?: number
  showFilter?: boolean
  folderIcon?: string
  itemIcon?: string
  groupMenu?: any[]
  itemMenu?: any[]
  rootButtonClick?: () => void
  menuItemClick?: (info: any, data: any) => void
  onSelect?: (info: any) => void
  onChange?: (info: any) => void
  value?: string
  defaultValue?: string | string[]
  defaultExpandedKeys?: string[]
  expandedKeys?: string[]
  onExpand?: (expandedKeys: string[]) => void
  clickToCollapse?: boolean
  draggable?: boolean
  onDrop?: (info: any) => void
  autoExpandParent?: boolean
  stopMenuEventPropagation?: boolean
  checkable?: boolean
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
    value,
    defaultValue,
    defaultExpandedKeys = [],
    expandedKeys: controlledExpandedKeys,
    onExpand: onExpandCallback,
    clickToCollapse = false,
    draggable = false,
    onDrop,
    autoExpandParent = false,
    stopMenuEventPropagation = true,
    checkable = false,
  } = props

  const [internalKeys, setInternalKeys] = useState(defaultExpandedKeys)
  const [searchValue, setSearchValue] = useState('')

  const keys = controlledExpandedKeys !== undefined ? controlledExpandedKeys : internalKeys
  const setKeys = (newKeys: string[]) => {
    if (controlledExpandedKeys === undefined) {
      setInternalKeys(newKeys)
    }
    onExpandCallback?.(newKeys)
  }

  const handleRootButtonClick = () => {
    rootButtonClick?.()
  }

  const handleMenuItemClick = (info: any, nodeData: any) => {
    menuItemClick?.(info, nodeData)
  }

  const buildMenuItems = (menu: any[], nodeData: any) => {
    return menu.map((item) => {
      if (item.type === 'divider') {
        return { key: `divider-${item.key}`, type: 'divider' as const }
      }
      return {
        key: item.key,
        label: item.label,
        style: { minWidth: '100px' },
        onClick: () => handleMenuItemClick(item, nodeData),
      }
    })
  }

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    const key = selectedKeys[0] as string
    const node = info.node
    if (!clickToCollapse) {
      const found = keys.find((item) => item === key)
      if (!found && node.children) {
        setKeys(keys.concat([key]))
      }
    }
    onSelect?.(node)
  }

  const handleExpand = (expandedKeys: React.Key[]) => {
    setKeys(expandedKeys as string[])
  }

  const getParentKeys = (key: string, tree: any[]): string[] => {
    const parents: string[] = []
    const find = (nodes: any[], path: string[]): boolean => {
      for (const node of nodes) {
        if (node.key === key) {
          parents.push(...path)
          return true
        }
        if (node.children && find(node.children, [...path, node.key])) {
          return true
        }
      }
      return false
    }
    find(tree, [])
    return parents
  }

  const handleSearch = (val: string) => {
    setSearchValue(val)
    if (val) {
      const matchedKeys: string[] = []
      const findMatches = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.label?.toLowerCase().includes(val.toLowerCase())) {
            matchedKeys.push(node.key)
          }
          if (node.children) {
            findMatches(node.children)
          }
        }
      }
      findMatches(data)
      const expandKeys = new Set(keys)
      matchedKeys.forEach((key) => {
        getParentKeys(key, data).forEach((pk) => expandKeys.add(pk))
      })
      setKeys(Array.from(expandKeys))
    }
  }

  const titleRender = (nodeData: any) => {
    const data = nodeData
    const hasMenu =
      (data.type === 'group' && (data.menu || groupMenu)) ||
      (data.type === 'item' && (data.menu || itemMenu)) ||
      (data.type !== 'group' && data.type !== 'item' && itemMenu)

    const handleLabelClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (data.disabled) {
        if (data.type === 'group') {
          setKeys(keys.concat([data.key]))
        } else if (data.menu) {
          setKeys(keys.concat([data.key]))
        }
      }
    }

    const menuData = data.menu
      ? buildMenuItems(data.menu, data)
      : data.type === 'group'
        ? groupMenu
          ? buildMenuItems(groupMenu, data)
          : null
        : itemMenu
          ? buildMenuItems(itemMenu, data)
          : null

    return (
      <div
        className={'air-tree-label' + (hasMenu ? ' air-tree-label-with-button' : '')}
        onClick={data.disabled ? handleLabelClick : undefined}
      >
        <div className={'air-tree-node-icon'}>
          {data.image ? (
            <Icon name={data.image} size={18} />
          ) : (
            <Icon name={data.type === 'group' ? folderIcon : itemIcon} size={18} />
          )}
        </div>
        <Typography.Text ellipsis={{ tooltip: data.label }}>{data.label}</Typography.Text>
        {hasMenu && menuData ? (
          <Dropdown trigger={['click']} placement="bottomRight" menu={{ items: menuData }}>
            <Button
              type="text"
              onClick={(e) => {
                if (stopMenuEventPropagation) {
                  e.stopPropagation()
                  e.nativeEvent.stopImmediatePropagation()
                }
              }}
              icon={<Icon name={'more'} size={20} />}
              size="small"
            />
          </Dropdown>
        ) : null}
      </div>
    )
  }

  return (
    <div className={'air-tree-wrapper'} style={{ height: height }}>
      {showFilter && rootButtonClick ? (
        <Button className={'air-tree-root-button'} type="text" onClick={handleRootButtonClick}>
          <Icon name={'add'} size={20} thickness={2} />
        </Button>
      ) : null}
      {showFilter && (
        <div className={'air-tree-search-wrapper'} style={{ paddingLeft: rootButtonClick ? '40px' : '12px' }}>
          <Input
            placeholder="搜索..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>
      )}
      <Tree
        treeData={data}
        className={'air-tree'}
        fieldNames={{ title: 'label', key: 'key', children: 'children' }}
        titleRender={titleRender}
        onSelect={handleSelect}
        onExpand={handleExpand}
        expandedKeys={keys}
        expandAction={clickToCollapse ? 'click' : undefined}
        draggable={draggable}
        onDrop={onDrop}
        checkable={checkable}
        multiple={checkable}
        defaultSelectedKeys={defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : undefined}
        virtual
        height={showFilter ? height - 60 : height}
        autoExpandParent={autoExpandParent}
        selectedKeys={value ? [value] : undefined}
      />
    </div>
  )
}

export default AirTree
