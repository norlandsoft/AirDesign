/**
 * Tree 树 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Tree} from 'air-design'
import type {TreeNode} from 'air-design'
import PageContainer from '../components/PageContainer'

const DATA: TreeNode[] = [
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
          {key: '1-1-3', label: 'index.css', type: 'item', image: 'tag'},
        ],
      },
      {
        key: '1-2',
        label: 'docs 文档',
        type: 'group',
        children: [
          {key: '1-2-1', label: 'architecture.md', type: 'item'},
          {key: '1-2-2', label: 'usage-manual.md', type: 'item'},
        ],
      },
      {key: '1-3', label: 'package.json', type: 'item'},
    ],
  },
]

const TreePage: React.FC = () => {
  return (
    <PageContainer title="Tree 树" description="基于 react-arborist：搜索过滤、展开折叠（默认只展开）、节点拖拽、自定义图标、group/item 分类菜单。">
      <div className="demo-block">
        <div className="mb-3 text-xs text-muted-foreground">
          点击节点仅展开（不折叠）；点击左侧三角箭头切换展开/折叠；拖拽 item 可跨位置/层级移动；hover 节点显示「更多」菜单
        </div>
        <div style={{width: 220}}>
        <Tree
          data={DATA}
          height={420}
          showFilter
          draggable
          rootButtonClick={() => alert('新增节点')}
          folderIcon="folder"
          itemIcon="document"
          clickToCollapse={false}
          groupMenu={[
            {label: '新增子项', icon: 'add', onClick: (i, n) => alert(`在「${n.label}」下新增子项`)},
            {label: '重命名', icon: 'edit', onClick: (i, n) => alert(`重命名「${n.label}」`)},
            {type: 'divider'},
            {label: '删除', icon: 'delete', onClick: (i, n) => alert(`删除「${n.label}」`)},
          ]}
          itemMenu={[
            {label: '打开', icon: 'document', onClick: (i, n) => alert(`打开「${n.label}」`)},
            {label: '复制', icon: 'copy', onClick: (i, n) => alert(`复制「${n.label}」`)},
            {type: 'divider'},
            {label: '删除', icon: 'delete', onClick: (i, n) => alert(`删除「${n.label}」`)},
          ]}
          defaultExpandedKeys={['1', '1-1']}
          onSelect={(node) => console.log('selected', node)}
          onDrop={(info) => console.log('drop', info)}
        />
        </div>
      </div>
    </PageContainer>
  )
}

export default TreePage
