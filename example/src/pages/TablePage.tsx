/**
 * Table 表格 Demo
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {Table, TableRowMenu} from 'air-design'
import PageContainer from '../components/PageContainer'

interface Row {
  key: string
  name: string
  age: number
  role: string
  status: string
}

interface PromptRow {
  key: string
  name: string
  code: string
  description: string
}

const DATA: Row[] = Array.from({length: 20}, (_, i) => ({
  key: String(i),
  name: `用户 ${i + 1}`,
  age: 20 + (i % 30),
  role: i % 3 === 0 ? '管理员' : '普通用户',
  status: i % 2 === 0 ? '启用' : '禁用',
}))

const PROMPT_DATA: PromptRow[] = [
  {
    key: '1',
    name: '聊天系统提示词',
    code: 'CHAT_SYSTEM_PROMPT',
    description: 'AI对话助手的角色、行为规范与输出要求，支持占位符 {{date}}',
  },
  {
    key: '2',
    name: '话题标题生成',
    code: 'CHAT_TOPIC_NAME_PROMPT',
    description: '话题标题生成 user 提示词；与用户首条输入通过 {{content}} 合并后以 user 角色发送',
  },
]

const TablePage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [borderedPage, setBorderedPage] = useState(1)
  const [selected, setSelected] = useState<Row | null>(null)

  const columns = [
    {dataIndex: 'name', title: '姓名', render: (v: string) => <strong>{v}</strong>},
    {dataIndex: 'age', title: '年龄', width: 80},
    {dataIndex: 'role', title: '角色'},
    {dataIndex: 'status', title: '状态'},
    {
      title: '操作',
      width: 60,
      render: (_: unknown, record: Row) => (
        <TableRowMenu
          data={record}
          items={[
            {key: 'edit', label: '编辑', icon: 'edit', onClick: () => alert(`编辑 ${record.name}`)},
            {key: 'delete', label: '删除', icon: 'delete', onClick: () => alert(`删除 ${record.name}`)},
          ]}
        />
      ),
    },
  ]

  const borderedColumns = [
    {
      dataIndex: 'name',
      title: '名称 / ID',
      width: '38%',
      render: (_: string, record: PromptRow) => (
        <div>
          <div className="text-sm text-foreground">{record.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{record.code}</div>
        </div>
      ),
    },
    {
      dataIndex: 'description',
      title: '描述',
      render: (v: string) => <span className="text-sm leading-relaxed text-foreground">{v}</span>,
    },
  ]

  return (
    <PageContainer title="Table 表格" description="基于 TanStack Table，支持 bordered 网格样式、行点击、行操作菜单、分页与空状态。">
      <div className="demo-block">
        <div className="mb-3 text-sm font-medium">带边框（bordered）</div>
        <Table
          data={PROMPT_DATA}
          columns={borderedColumns}
          height={360}
          bordered
          pagination={{total: PROMPT_DATA.length, pageSize: 10, currentPage: borderedPage, onChange: setBorderedPage}}
          showEmpty
        />
      </div>

      <div className="demo-block">
        <div className="mb-3 text-sm font-medium">无边框 + 分页</div>
        <div className="mb-3 text-sm text-muted-foreground">
          {selected ? `已选中：${selected.name}` : '点击任意行选中'}
        </div>
        <Table
          data={DATA}
          columns={columns}
          height={420}
          onItemClick={(record: Row) => setSelected(record)}
          pagination={{total: 100, pageSize: 10, currentPage: page, onChange: setPage}}
          showEmpty
        />
      </div>

      <div className="demo-block">
        <div className="mb-3 text-sm font-medium">带边框、无分页</div>
        <Table
          data={PROMPT_DATA}
          columns={borderedColumns}
          height={280}
          bordered
          showEmpty
        />
      </div>
    </PageContainer>
  )
}

export default TablePage
