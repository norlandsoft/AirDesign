/**
 * Tree 树 Demo
 *
 * 左侧：各属性开关/选项，用于交互验证 Tree 组件能力。
 * 右侧：带边框的 Tree 预览区，实时反映属性变化。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useMemo, useState} from 'react'
import {
  Tree,
  Switch,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  GroupSplitter,
} from 'air-design'
import type {TreeNode} from 'air-design'
import PageContainer from '../components/PageContainer'

/** 演示用树数据 */
const INITIAL_DATA: TreeNode[] = [
  {
    key: '1',
    label: '项目根目录',
    type: 'group',
    children: [
      {
        key: '1-1',
        label: 'src 源码',
        type: 'group',
        children: [
          {key: '1-1-1', label: 'main.ts', type: 'item'},
          {key: '1-1-2', label: 'App.tsx', type: 'item'},
          {
            key: '1-1-3',
            label: 'index.css（超长文件名演示省略号效果）',
            type: 'item',
            image: 'tag',
          },
        ],
      },
      {
        key: '1-2',
        label: 'docs 文档（disabled）',
        type: 'group',
        disabled: true,
        children: [
          {key: '1-2-1', label: 'architecture.md', type: 'item'},
          {key: '1-2-2', label: 'usage-manual.md', type: 'item'},
        ],
      },
      {key: '1-3', label: 'package.json', type: 'item'},
    ],
  },
]

const GROUP_MENU = [
  {label: '新增子项', icon: 'add', onClick: (_i: unknown, n: TreeNode) => alert(`在「${n.label}」下新增`)},
  {label: '重命名', icon: 'edit', onClick: (_i: unknown, n: TreeNode) => alert(`重命名「${n.label}」`)},
  {type: 'divider' as const},
  {label: '删除', icon: 'delete', onClick: (_i: unknown, n: TreeNode) => alert(`删除「${n.label}」`)},
]

const ITEM_MENU = [
  {label: '打开', icon: 'document', onClick: (_i: unknown, n: TreeNode) => alert(`打开「${n.label}」`)},
  {label: '复制', icon: 'copy', onClick: (_i: unknown, n: TreeNode) => alert(`复制「${n.label}」`)},
  {type: 'divider' as const},
  {label: '删除', icon: 'delete', onClick: (_i: unknown, n: TreeNode) => alert(`删除「${n.label}」`)},
]

const ICON_OPTIONS = [
  {value: 'folder', label: 'folder'},
  {value: 'document', label: 'document'},
  {value: 'tag', label: 'tag'},
  {value: 'skill', label: 'skill'},
  {value: 'work_flow', label: 'work_flow'},
]

/** 左侧单行选项：标签 + 控件 */
const OptionRow: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
)

const TreePage: React.FC = () => {
  // Tree 属性
  const [height, setHeight] = useState(480)
  const [treeWidth, setTreeWidth] = useState(320)
  const [showFilter, setShowFilter] = useState(true)
  const [showRootButton, setShowRootButton] = useState(true)
  const [draggable, setDraggable] = useState(true)
  const [clickToCollapse, setClickToCollapse] = useState(false)
  const [checkable, setCheckable] = useState(false)
  const [groupSelectable, setGroupSelectable] = useState(false)
  const [autoExpandParent, setAutoExpandParent] = useState(false)
  const [showGroupMenu, setShowGroupMenu] = useState(true)
  const [showItemMenu, setShowItemMenu] = useState(true)
  const [folderIcon, setFolderIcon] = useState('folder')
  const [itemIcon, setItemIcon] = useState('document')

  // 受控状态
  const [treeData, setTreeData] = useState<TreeNode[]>(INITIAL_DATA)
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1', '1-1'])
  const [selectedKey, setSelectedKey] = useState('1-1-1')
  const [lastEvent, setLastEvent] = useState('—')

  const groupMenu = useMemo(() => (showGroupMenu ? GROUP_MENU : undefined), [showGroupMenu])
  const itemMenu = useMemo(() => (showItemMenu ? ITEM_MENU : undefined), [showItemMenu])

  const resetState = () => {
    setTreeData(INITIAL_DATA)
    setExpandedKeys(['1', '1-1'])
    setSelectedKey('1-1-1')
    setLastEvent('已重置')
  }

  return (
    <PageContainer
      title="Tree 树"
      description="左侧调整属性，右侧实时预览。group 默认不可选中，三角箭头可独立折叠。"
    >
      <div className="demo-block" style={{padding: 16}}>
        <div className="flex gap-5 items-start">
          {/* 左侧：属性面板 */}
          <aside
            className="shrink-0 rounded-lg border border-border bg-card p-4"
            style={{width: 280}}
          >
            <GroupSplitter title="尺寸"/>
            <OptionRow label="高度">
              <Input
                type="number"
                min={200}
                max={700}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 480)}
                className="h-8 w-20 text-right"
              />
            </OptionRow>
            <OptionRow label="宽度">
              <Input
                type="number"
                min={180}
                max={500}
                value={treeWidth}
                onChange={(e) => setTreeWidth(Number(e.target.value) || 320)}
                className="h-8 w-20 text-right"
              />
            </OptionRow>

            <GroupSplitter title="搜索"/>
            <OptionRow label="showFilter">
              <Switch checked={showFilter} onCheckedChange={(v) => setShowFilter(!!v)}/>
            </OptionRow>
            <OptionRow label="rootButton">
              <Switch
                checked={showRootButton}
                disabled={!showFilter}
                onCheckedChange={(v) => setShowRootButton(!!v)}
              />
            </OptionRow>

            <GroupSplitter title="交互"/>
            <OptionRow label="draggable">
              <Switch checked={draggable} onCheckedChange={(v) => setDraggable(!!v)}/>
            </OptionRow>
            <OptionRow label="clickToCollapse">
              <Switch checked={clickToCollapse} onCheckedChange={(v) => setClickToCollapse(!!v)}/>
            </OptionRow>
            <OptionRow label="checkable">
              <Switch checked={checkable} onCheckedChange={(v) => setCheckable(!!v)}/>
            </OptionRow>
            <OptionRow label="groupSelectable">
              <Switch checked={groupSelectable} onCheckedChange={(v) => setGroupSelectable(!!v)}/>
            </OptionRow>
            <OptionRow label="autoExpandParent">
              <Switch checked={autoExpandParent} onCheckedChange={(v) => setAutoExpandParent(!!v)}/>
            </OptionRow>

            <GroupSplitter title="菜单"/>
            <OptionRow label="groupMenu">
              <Switch checked={showGroupMenu} onCheckedChange={(v) => setShowGroupMenu(!!v)}/>
            </OptionRow>
            <OptionRow label="itemMenu">
              <Switch checked={showItemMenu} onCheckedChange={(v) => setShowItemMenu(!!v)}/>
            </OptionRow>

            <GroupSplitter title="图标"/>
            <OptionRow label="folderIcon">
              <Select value={folderIcon} onValueChange={setFolderIcon}>
                <SelectTrigger className="h-8 w-28">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </OptionRow>
            <OptionRow label="itemIcon">
              <Select value={itemIcon} onValueChange={setItemIcon}>
                <SelectTrigger className="h-8 w-28">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </OptionRow>

            <GroupSplitter title="操作"/>
            <button
              type="button"
              className="mt-1 w-full rounded border border-border px-3 py-1.5 text-sm hover:bg-accent"
              onClick={resetState}
            >
              重置数据与状态
            </button>
          </aside>

          {/* 右侧：Tree 预览 */}
          <div className="min-w-0 flex-1">
            <div
              className="overflow-hidden rounded-lg border border-border bg-card"
              style={{width: treeWidth, maxWidth: '100%'}}
            >
              <Tree
                data={treeData}
                height={height}
                showFilter={showFilter}
                draggable={draggable}
                clickToCollapse={clickToCollapse}
                checkable={checkable}
                groupSelectable={groupSelectable}
                autoExpandParent={autoExpandParent}
                folderIcon={folderIcon}
                itemIcon={itemIcon}
                rootButtonClick={showFilter && showRootButton ? () => {
                  setLastEvent('rootButtonClick')
                  alert('新增根节点')
                } : undefined}
                groupMenu={groupMenu}
                itemMenu={itemMenu}
                value={selectedKey}
                expandedKeys={expandedKeys}
                onExpand={(keys) => {
                  setExpandedKeys(keys)
                  setLastEvent(`onExpand: [${keys.join(', ')}]`)
                }}
                onSelect={(node) => {
                  setSelectedKey(node.key)
                  setLastEvent(`onSelect: ${node.key} (${node.label})`)
                }}
                onChange={(data) => {
                  setTreeData(data)
                  setLastEvent('onChange: 树结构已更新')
                }}
                onDrop={() => setLastEvent('onDrop: 拖拽完成')}
              />
            </div>

            {/* 状态反馈 */}
            <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">selectedKey: </span>
                {selectedKey || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">expandedKeys: </span>
                {expandedKeys.length ? expandedKeys.join(', ') : '—'}
              </div>
              <div>
                <span className="text-muted-foreground">lastEvent: </span>
                {lastEvent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default TreePage
