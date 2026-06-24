/**
 * PropertiesNaviBar 属性导航栏 Demo
 *
 * 展示分组/平铺导航项及选中态，模拟属性页左侧导航 + 右侧内容区布局。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useMemo, useState} from 'react'
import {GroupSplitter, PropertiesNaviBar} from 'air-design'
import PageContainer from '../components/PageContainer'

/** Demo 导航数据：含分组与平铺项 */
const NAV_DATA = [
  {key: 'overview', label: '概览'},
  {
    key: 'basic',
    label: '基础设置',
    type: 'group' as const,
    children: [
      {key: 'basic-info', label: '基本信息'},
      {key: 'basic-display', label: '显示选项'},
      {key: 'basic-notify', label: '通知偏好'},
    ],
  },
  {
    key: 'advanced',
    label: '高级设置',
    type: 'group' as const,
    children: [
      {key: 'advanced-security', label: '安全策略'},
      {key: 'advanced-api', label: 'API 密钥'},
      {key: 'advanced-audit', label: '审计日志'},
    ],
  },
  {key: 'about', label: '关于'},
]

/** 根据 key 查找展示文案 */
function findNavLabel(key: string): string {
  for (const item of NAV_DATA) {
    if (item.key === key) return item.label
    if (item.type === 'group') {
      const child = item.children?.find((c) => c.key === key)
      if (child) return child.label
    }
  }
  return key
}

const PropertiesNaviBarPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('basic-info')

  const activeLabel = useMemo(() => findNavLabel(activeKey), [activeKey])

  return (
    <PageContainer
      title="PropertiesNaviBar 属性导航"
      description="属性页左侧导航栏，支持分组（type: group）与平铺项，选中项高亮；常与右侧属性表单组合使用。"
    >
      <div className="demo-block">
        <GroupSplitter title="属性页布局"/>
        <div
          className="flex overflow-hidden rounded-lg border border-border bg-card"
          style={{height: 420}}
        >
          <div className="shrink-0 border-r border-border bg-muted/30 py-3">
            <PropertiesNaviBar
              width={200}
              height="100%"
              padding="0 8px"
              data={NAV_DATA}
              activeKey={activeKey}
              onChange={setActiveKey}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col p-6">
            <h3 className="mb-2 text-base font-semibold text-foreground">{activeLabel}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              当前选中项 key：<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{activeKey}</code>
            </p>
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
              此处渲染「{activeLabel}」对应的属性表单内容
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default PropertiesNaviBarPage
