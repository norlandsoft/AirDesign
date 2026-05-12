import { useState } from 'react';
import { Table, TableRowMenu, Button, Message } from '@/components/AirDesign';

const columns = [
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '年龄', dataIndex: 'age', width: 80 },
  { title: '地址', dataIndex: 'address' },
  { title: '状态', dataIndex: 'status', width: 100 },
];

const mockData = Array.from({ length: 86 }, (_, i) => ({
  key: String(i + 1),
  name: `用户 ${i + 1}`,
  age: 20 + (i % 30),
  address: `北京市朝阳区某某路 ${i + 1} 号`,
  status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '离线' : '未激活',
}));

const rowMenuItems = [
  { label: '查看详情', onClick: (data: any) => Message.info(`查看: ${data.name}`) },
  { label: '编辑', onClick: (data: any) => Message.info(`编辑: ${data.name}`) },
  { type: 'split' as const },
  { label: '删除', onClick: (data: any) => Message.warning(`删除: ${data.name}`) },
];

export default function TableDemoPage() {
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const enrichedColumns = [
    ...columns,
    {
      title: '操作',
      dataIndex: 'actions',
      width: 60,
      render: (_: any, record: any) => (
        <TableRowMenu items={rowMenuItems} data={record} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 16px' }}>表格场景</h2>
      <p style={{ color: '#666', margin: '0 0 16px' }}>
        Table + TableRowMenu + Pagination 组合，模拟数据管理界面
      </p>
      <div style={{ flex: 1 }}>
        <Table
          data={mockData}
          columns={enrichedColumns}
          height={600}
          headerPanel={() => (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>用户列表</span>
              <div style={{ flex: 1 }} />
              <Button type="primary" onClick={() => Message.success('新增用户')}>新增</Button>
            </div>
          )}
          pagination={{ size: 'small', pageSize: 10, showTotal: (total: number) => `共 ${total} 条` }}
          onItemClick={(record: any) => setSelectedRow(record)}
          showEmpty={mockData.length === 0}
        />
      </div>
      {selectedRow && (
        <div style={{ padding: '8px 0', color: '#888', fontSize: '0.85rem' }}>
          当前选中: {selectedRow.name} — {selectedRow.address}
        </div>
      )}
    </div>
  );
}
