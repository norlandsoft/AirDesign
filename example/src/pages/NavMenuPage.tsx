/**
 * NavMenu 导航菜单演示页
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {NavMenu, type NavMenuItem, type NavMenuMode} from 'air-design'
import PageContainer from '../components/PageContainer'

const DEMO_ITEMS: NavMenuItem[] = [
  {key: 'home', icon: 'rocket', label: '工作台', shortLabel: '工作台'},
  {key: 'doc', icon: 'document', label: '文档中心', shortLabel: '文档'},
  {key: 'data', icon: 'list', label: '数据管理', shortLabel: '数据'},
  {key: 'user', icon: 'user', label: '用户中心', shortLabel: '用户'},
  {key: 'settings', icon: 'settings', label: '系统设置', shortLabel: '设置'},
]

const NavMenuPage: React.FC = () => {
  const [mode, setMode] = useState<NavMenuMode>('icon-label')
  const [selectedKey, setSelectedKey] = useState('home')

  return (
    <PageContainer
      title="NavMenu 导航菜单"
      description="左侧模块切换导航。icon 模式宽 40px；icon-label 模式宽 60px，背景块 48×48（1:1）。"
    >
      <div className="demo-block">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-md border px-3 py-1.5 text-sm ${
              mode === 'icon' ? 'border-primary bg-primary/5 text-primary' : 'border-border'
            }`}
            onClick={() => setMode('icon')}
          >
            仅图标（40px）
          </button>
          <button
            type="button"
            className={`rounded-md border px-3 py-1.5 text-sm ${
              mode === 'icon-label' ? 'border-primary bg-primary/5 text-primary' : 'border-border'
            }`}
            onClick={() => setMode('icon-label')}
          >
            图标+文字（60px）
          </button>
        </div>

        <div
          className="flex overflow-hidden rounded-lg border border-border"
          style={{height: 360}}
        >
          <NavMenu
            mode={mode}
            items={DEMO_ITEMS}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
          <div className="flex flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
            当前模块：{DEMO_ITEMS.find((item) => item.key === selectedKey)?.label}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default NavMenuPage
