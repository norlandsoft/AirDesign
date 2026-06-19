/**
 * TabPanel 标签页 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {TabPanel} from 'air-design'
import PageContainer from '../components/PageContainer'

const TabPanelPage: React.FC = () => {
  const [current, setCurrent] = useState<any>(null)

  const items = [
    {key: 't1', label: '概览', icon: 'list', closable: false, children: <div className="p-4 text-sm">概览内容区</div>},
    {key: 't2', label: '配置', icon: 'settings', closable: true, children: <div className="p-4 text-sm">配置内容区</div>},
    {key: 't3', label: '这是一个很长很长的标签标题用于演示省略', icon: 'edit', closable: true, children: <div className="p-4 text-sm">长标题内容区</div>},
  ]

  return (
    <PageContainer title="TabPanel 标签页" description="可关闭标签，超长标题 tooltip 显示完整名称。">
      <div className="demo-block">
        <TabPanel
          height={400}
          width={800}
          items={items}
          currentTab={current || items[0]}
          onChangeTab={setCurrent}
          onRemoveTab={(t) => alert(`关闭 ${t?.label}`)}
        />
      </div>
    </PageContainer>
  )
}

export default TabPanelPage
