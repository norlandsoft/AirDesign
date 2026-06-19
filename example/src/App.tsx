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
  return (
    <div className="flex h-full">
      {/* 侧边栏 */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Icon name="rocket" size={20} color="var(--color-primary)"/>
          <span className="text-sm font-semibold">AirDesign Demo</span>
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
