/**
 * NavMenu / MenuBar 导航演示页
 *
 * @author ChaiMingXu, 2026/06/25
 */
import React, {useState} from 'react'
import {GroupSplitter, MenuBar, NavMenu, type NavMenuItem, type NavMenuMode} from 'air-design'
import PageContainer from '../components/PageContainer'

const DEMO_ITEMS: NavMenuItem[] = [
  {key: 'home', icon: 'rocket', label: '工作台', shortLabel: '工作台'},
  {key: 'doc', icon: 'document', label: '文档中心', shortLabel: '文档'},
  {key: 'data', icon: 'list', label: '数据管理', shortLabel: '数据'},
  {key: 'user', icon: 'user', label: '用户中心', shortLabel: '用户'},
  {key: 'settings', icon: 'settings', label: '系统设置', shortLabel: '设置'},
]

const MENU_BAR_ITEMS = [
  {id: 'prepare', label: '准备', icon: 'block'},
  {id: 'interpret', label: '解读', icon: 'document'},
  {id: 'plan', label: '规划', icon: 'columns_2'},
  {id: 'write', label: '撰写', icon: 'edit'},
  {id: 'check', label: '检查', icon: 'check_list'},
  {id: 'output', label: '输出', icon: 'export'},
  {id: 'log', label: '日志', icon: 'logger'},
]

const NavMenuPage: React.FC = () => {
  const [mode, setMode] = useState<NavMenuMode>('icon-label')
  const [selectedKey, setSelectedKey] = useState('home')
  const [menuBarKey, setMenuBarKey] = useState('prepare')
  const [menuBarInstance, setMenuBarInstance] = useState(0)

  return (
    <PageContainer
      title="NavMenu / MenuBar 导航"
      description="NavMenu：左侧模块切换（icon 40px / icon-label 60px）。MenuBar：流程步骤导航，栏宽 60px，底部返回。"
    >
      <div className="demo-block">
        <GroupSplitter title="NavMenu 模块导航"/>
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

      <div className="demo-block">
        <GroupSplitter title="MenuBar 流程导航"/>
        <div
          className="flex overflow-hidden rounded-lg border border-border"
          style={{height: 420}}
        >
          <MenuBar
            key={menuBarInstance}
            height="100%"
            items={MENU_BAR_ITEMS}
            defaultSelected="prepare"
            onSelect={setMenuBarKey}
            onReturn={() => {
              setMenuBarKey('prepare')
              setMenuBarInstance((n) => n + 1)
            }}
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-background p-6 text-sm text-muted-foreground">
            <span>
              当前步骤：
              <strong className="ml-1 text-foreground">
                {MENU_BAR_ITEMS.find((item) => item.id === menuBarKey)?.label}
              </strong>
            </span>
            <span className="text-xs">
              key：<code className="rounded bg-muted px-1.5 py-0.5">{menuBarKey}</code>
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default NavMenuPage
