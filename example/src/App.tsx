/**
 * Demo 应用外壳：上下结构布局
 * - 上方 40px header
 * - 下方左右分栏：左侧功能列表导航 + 右侧组件展示区
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Routes, Route, NavLink, Navigate} from 'react-router-dom'
import {Icon, SlidePanel} from 'air-design'
import {UserSettings, useUserStore} from 'air-kit'
import './sdk'  // air-kit 初始化（配置 + Mock + 用户状态）

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
import TagPage from './pages/TagPage'
import AvatarPage from './pages/AvatarPage'
import GridPage from './pages/GridPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'
import CodeEditorPage from './pages/CodeEditorPage'
import RichEditorPage from './pages/RichEditorPage'

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
  {path: 'tag', label: 'Tag 标签', icon: 'tag'},
  {path: 'avatar', label: 'Avatar 头像', icon: 'user'},
  {path: 'grid', label: 'Grid 栅格', icon: 'columns_2'},
  {path: 'upload', label: '文件上传', icon: 'upload'},
  {path: 'login', label: '登录页', icon: 'user'},
  {path: 'codeeditor', label: 'CodeEditor', icon: 'document'},
  {path: 'richeditor', label: 'RichEditor', icon: 'edit'},
]

const App: React.FC = () => {
  // 基础字号控制：修改 --base-font-size 即可整体缩放全站字号（驱动所有 rem）
  const [baseSize, setBaseSize] = React.useState(16)
  React.useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${baseSize}px`)
  }, [baseSize])

  // 用户面板（点击头像展开侧滑）
  const [userPanelOpen, setUserPanelOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const currentUser = useUserStore((s) => s.currentUser)
  const avatarText = currentUser?.name?.[0] ?? 'U'

  return (
    <div className="flex h-full flex-col">
      {/* 上方 header：40px */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <Icon name="rocket" size={18} color="var(--color-primary)"/>
          <span className="text-sm font-semibold">AirDesign Demo</span>
        </div>
        <div className="flex items-center gap-3">
          {/* 基础字号缩放 */}
          <span className="text-xs text-muted-foreground">字号 {baseSize}px</span>
          <button onClick={() => setBaseSize((s) => Math.max(12, s - 1))} className="size-6 rounded bg-muted text-xs hover:bg-accent">−</button>
          <input
            type="range" min={12} max={20} value={baseSize}
            onChange={(e) => setBaseSize(Number(e.target.value))}
            className="w-20"
          />
          <button onClick={() => setBaseSize((s) => Math.min(20, s + 1))} className="size-6 rounded bg-muted text-xs hover:bg-accent">+</button>
          {/* 用户头像：点击展开用户侧边栏 */}
          <button
            onClick={() => setUserPanelOpen(true)}
            className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-transform hover:scale-105"
            title={currentUser?.name ?? '用户'}
          >
            {avatarText}
          </button>
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
        <main className="min-w-0 flex-1 overflow-auto" style={{padding: 24}}>
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
            <Route path="tag" element={<TagPage/>}/>
            <Route path="avatar" element={<AvatarPage/>}/>
            <Route path="grid" element={<GridPage/>}/>
            <Route path="upload" element={<UploadPage/>}/>
            <Route path="login" element={<LoginPage/>}/>
            <Route path="codeeditor" element={<CodeEditorPage/>}/>
            <Route path="richeditor" element={<RichEditorPage/>}/>
          </Routes>
        </main>
      </div>

      {/* 用户侧边栏：点击头像展开，含用户信息 + 设置入口 */}
      <SlidePanel
        open={userPanelOpen}
        type="small"
        title="账户"
        hasCloseButton
        hasButtonBar={false}
        onClose={() => setUserPanelOpen(false)}
      >
        <div className="flex flex-col gap-4 py-2">
          {/* 用户信息卡片 */}
          <div className="rounded-lg border border-border p-4 text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
              {avatarText}
            </div>
            <div className="text-sm font-medium">{currentUser?.name ?? '用户'}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">@{currentUser?.loginId ?? 'unknown'}</div>
            <div className="mt-2 flex justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-2 py-0.5">{currentUser?.role ?? ''}</span>
              <span className="rounded bg-muted px-2 py-0.5">{currentUser?.status ?? ''}</span>
            </div>
          </div>

          {/* 设置入口 */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
            >
              <Icon name="settings" size={16}/>
              用户设置
            </button>
          </div>
        </div>
      </SlidePanel>

      {/* 用户设置（air-kit UserSettings 组件） */}
      <UserSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  )
}

export default App
