/**
 * Demo 应用外壳：上下结构布局
 * - 上方 40px header
 * - 下方左右分栏：左侧功能列表导航 + 右侧组件展示区
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
    <div className="flex h-full flex-col">
      {/* 上方 header：40px */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <Icon name="rocket" size={18} color="var(--color-primary)"/>
          <span className="text-sm font-semibold">AirDesign Demo</span>
        </div>
        {/* 基础字号缩放 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">基础字号 {baseSize}px</span>
          <button onClick={() => setBaseSize((s) => Math.max(12, s - 1))} className="size-6 rounded bg-muted text-xs hover:bg-accent">−</button>
          <input
            type="range" min={12} max={20} value={baseSize}
            onChange={(e) => setBaseSize(Number(e.target.value))}
            className="w-24"
          />
          <button onClick={() => setBaseSize((s) => Math.min(20, s + 1))} className="size-6 rounded bg-muted text-xs hover:bg-accent">+</button>
          <button onClick={() => setBaseSize(16)} className="rounded bg-muted px-1.5 py-0.5 text-xs hover:bg-accent">重置</button>
        </div>
      </header>

      {/* 下方左右分栏 */}
      <div className="flex min-h-0 flex-1">
        {/* 左侧功能列表 */}
        <aside className="w-52 shrink-0 overflow-auto border-r border-border bg-card">
          <nav className="p-2">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({isActive}) =>
                  `mb-0.5 flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
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

        {/* 右侧组件展示区 */}
        <main className="min-w-0 flex-1 overflow-auto p-8">
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
    </div>
  )
}

export default App
