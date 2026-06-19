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
          {key: '1-1-3', label: 'index.css', type: 'item'},
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
    <PageContainer title="Tree 树" description="基于 react-arborist，支持搜索过滤、节点菜单、展开折叠。">
      <div className="demo-block">
        <Tree
          data={DATA}
          height={400}
          showFilter
          rootButtonClick={() => alert('新增节点')}
          folderIcon="folder"
          itemIcon="document"
          groupMenu={[
            {label: '新增子项', onClick: () => alert('新增子项')},
            {label: '重命名', onClick: () => alert('重命名')},
            {label: '删除', onClick: () => alert('删除')},
          ]}
          itemMenu={[
            {label: '打开', onClick: () => alert('打开')},
            {label: '删除', onClick: () => alert('删除')},
          ]}
          defaultExpandedKeys={['1', '1-1']}
          onSelect={(node) => console.log('selected', node)}
        />
      </div>
    </PageContainer>
  )
}

export default TreePage
