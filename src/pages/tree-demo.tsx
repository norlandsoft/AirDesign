import { useState } from 'react';
import { Tree, Message } from '@/components/AirDesign';

const mockTreeData = [
  {
    key: 'project',
    label: 'AirDesign 项目',
    children: [
      {
        key: 'src',
        label: 'src',
        children: [
          { key: 'components', label: 'components', children: [
            { key: 'button', label: 'Button.tsx' },
            { key: 'table', label: 'Table.tsx' },
            { key: 'tree', label: 'Tree.tsx' },
            { key: 'dialog', label: 'Dialog.tsx' },
          ]},
          { key: 'pages', label: 'pages', children: [
            { key: 'home', label: 'index.tsx' },
            { key: 'table-page', label: 'table-demo.tsx' },
            { key: 'tree-page', label: 'tree-demo.tsx' },
          ]},
          { key: 'layouts', label: 'layouts', children: [
            { key: 'layout', label: 'index.tsx' },
          ]},
          { key: 'global-less', label: 'global.less' },
        ],
      },
      {
        key: 'public',
        label: 'public',
        children: [
          { key: 'fonts', label: 'fonts', children: [
            { key: 'grotesk', label: 'space-grotesk.woff2' },
            { key: 'jetbrains', label: 'jetbrains-mono.woff2' },
          ]},
        ],
      },
      { key: 'package-json', label: 'package.json' },
      { key: 'tsconfig', label: 'tsconfig.json' },
      { key: 'umirc', label: '.umirc.ts' },
    ],
  },
];

const groupMenu = [
  { label: '新建文件夹', onClick: () => Message.info('新建文件夹') },
  { label: '重命名', onClick: () => Message.info('重命名') },
  { type: 'split' as const },
  { label: '删除', onClick: () => Message.warning('删除') },
];

const itemMenu = [
  { label: '打开', onClick: () => Message.info('打开文件') },
  { label: '复制路径', onClick: () => Message.info('复制路径') },
  { type: 'split' as const },
  { label: '删除', onClick: () => Message.warning('删除文件') },
];

export default function TreeDemoPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 16px' }}>树形场景</h2>
      <p style={{ color: '#666', margin: '0 0 16px' }}>
        Tree + 搜索 + 右键菜单 + 拖拽，模拟文件管理器
      </p>
      <div style={{ flex: 1 }}>
        <Tree
          data={mockTreeData}
          height={500}
          showFilter
          folderIcon="folder"
          itemIcon="document"
          groupMenu={groupMenu}
          itemMenu={itemMenu}
          onSelect={(node: any) => setSelectedNode(node)}
          menuItemClick={(info: any, data: any) => {
            Message.info(`菜单: ${info.label}, 节点: ${data?.label || data?.key}`);
          }}
          draggable
          onDrop={(info: any) => {
            Message.info(`拖拽: ${info.dragNode?.label} → ${info.node?.label}`);
          }}
          clickToCollapse
          defaultExpandedKeys={['project', 'src', 'components']}
        />
      </div>
      {selectedNode && (
        <div style={{ padding: '8px 0', color: '#888', fontSize: '0.85rem' }}>
          选中: {selectedNode.label || selectedNode.key}
        </div>
      )}
    </div>
  );
}
