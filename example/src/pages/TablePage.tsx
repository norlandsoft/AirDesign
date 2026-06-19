/**
 * Table 表格 Demo
 *
 * @author ChaiMingXu, 2026/06/19
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

const DATA: Row[] = Array.from({length: 20}, (_, i) => ({
  key: String(i),
  name: `用户 ${i + 1}`,
  age: 20 + (i % 30),
  role: i % 3 === 0 ? '管理员' : '普通用户',
  status: i % 2 === 0 ? '启用' : '禁用',
}))

const TablePage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Row | null>(null)

  const columns = [
    {dataIndex: 'name', title: '姓名', render: (v: string) => <strong>{v}</strong>},
    {dataIndex: 'age', title: '年龄', width: 80},
    {dataIndex: 'role', title: '角色'},
    {dataIndex: 'status', title: '状态'},
    {
      title: '操作',
      width: 60,
      render: (_: any, record: Row) => (
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

  return (
    <PageContainer title="Table 表格" description="基于 TanStack Table，支持行点击、行操作菜单、分页、空状态。">
      <div className="demo-block">
        <div className="text-sm text-muted-foreground" style={{marginBottom: 12}}>
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
    </PageContainer>
  )
}

export default TablePage
