/**
 * Demo 应用外壳：左侧导航 + 右侧内容区
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Routes, Route, NavLink, Navigate} from 'react-router-dom'
import {Icon} from 'air-design'

import ButtonPage from './pages/ButtonPage'
import IconPage from './pages/IconPage'
import DialogPage from './pages/DialogPage'
import SlidePanelPage from './pages/SlidePanelPage'
import MessagePage from './pages/MessagePage'
import TablePage from './pages/TablePage'
import TreePage from './pages/TreePage'
import TabPanelPage from './pages/TabPanelPage'
import ColorPickerPage from './pages/ColorPickerPage'
import FormPage from './pages/FormPage'
import SplitterPage from './pages/SplitterPage'
import FeedbackPage from './pages/FeedbackPage'

interface NavItem {
  path: string
  label: string
  icon: string
}

const NAV: NavItem[] = [
  {path: 'button', label: 'Button 按钮', icon: 'add'},
  {path: 'icon', label: 'Icon 图标', icon: 'star'},
  {path: 'dialog', label: 'Dialog 对话框', icon: 'document'},
  {path: 'slidepanel', label: 'SlidePanel 抽屉', icon: 'menu'},
  {path: 'message', label: 'Message/Notice', icon: 'share'},
  {path: 'table', label: 'Table 表格', icon: 'list'},
  {path: 'tree', label: 'Tree 树', icon: 'folder'},
  {path: 'tabpanel', label: 'TabPanel 标签页', icon: 'more'},
  {path: 'colorpicker', label: 'ColorPicker', icon: 'tag'},
  {path: 'form', label: '表单组件', icon: 'edit'},
  {path: 'splitter', label: 'Splitter 分割', icon: 'back'},
  {path: 'feedback', label: 'Spin/Loading', icon: 'refresh'},
]

const App: React.FC = () => {
  // 基础字号控制：修改 --base-font-size 即可整体缩放全站字号（驱动所有 rem）
  const [baseSize, setBaseSize] = React.useState(16)
  React.useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${baseSize}px`)
  }, [baseSize])

  return (
    <div className="flex h-full">
      {/* 侧边栏 */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <Icon name="rocket" size={20} color="var(--color-primary)"/>
            <span className="text-sm font-semibold">AirDesign Demo</span>
          </div>
        </div>

        {/* 基础字号缩放演示 */}
        <div className="border-b border-border px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>基础字号</span>
            <span className="font-mono">{baseSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setBaseSize((s) => Math.max(12, s - 1))} className="size-6 rounded bg-muted text-sm hover:bg-accent">−</button>
            <input
              type="range" min={12} max={20} value={baseSize}
              onChange={(e) => setBaseSize(Number(e.target.value))}
              className="flex-1"
            />
            <button onClick={() => setBaseSize((s) => Math.min(20, s + 1))} className="size-6 rounded bg-muted text-sm hover:bg-accent">+</button>
            <button onClick={() => setBaseSize(16)} className="rounded bg-muted px-1.5 py-0.5 text-xs hover:bg-accent">重置</button>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({isActive}) =>
                `mb-0.5 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-accent'
                }`
              }
            >
              <Icon name={item.icon} size={16}/>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 内容区 */}
      <main className="flex-1 overflow-auto p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/button" replace/>}/>
          <Route path="button" element={<ButtonPage/>}/>
          <Route path="icon" element={<IconPage/>}/>
          <Route path="dialog" element={<DialogPage/>}/>
          <Route path="slidepanel" element={<SlidePanelPage/>}/>
          <Route path="message" element={<MessagePage/>}/>
          <Route path="table" element={<TablePage/>}/>
          <Route path="tree" element={<TreePage/>}/>
          <Route path="tabpanel" element={<TabPanelPage/>}/>
          <Route path="colorpicker" element={<ColorPickerPage/>}/>
          <Route path="form" element={<FormPage/>}/>
          <Route path="splitter" element={<SplitterPage/>}/>
          <Route path="feedback" element={<FeedbackPage/>}/>
        </Routes>
      </main>
    </div>
  )
}

export default App
