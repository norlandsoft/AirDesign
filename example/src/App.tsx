/**
 * Demo 应用外壳：上下结构布局
 * - 上方 40px header
 * - 下方左右分栏：左侧 NavMenu 导航 + 右侧组件展示区
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React from 'react'
import {Routes, Route, Navigate, useLocation, useNavigate} from 'react-router-dom'
import {Icon, NavMenu, SlidePanel, Avatar, type NavMenuItem, type NavMenuMode} from 'air-design'
import {UserSettings, useUserStore, getAvatarUrl} from 'air-kit'
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
import DatePickerPage from './pages/DatePickerPage'
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
import NavMenuPage from './pages/NavMenuPage'
import PropertiesNaviBarPage from './pages/PropertiesNaviBarPage'
import InfoPagePage from './pages/InfoPagePage'

const NAV: NavMenuItem[] = [
  {key: 'button', icon: 'add', label: 'Button 按钮', shortLabel: '按钮'},
  {key: 'icon', icon: 'star', label: 'Icon 图标', shortLabel: '图标'},
  {key: 'dialog', icon: 'document', label: 'Dialog 对话框', shortLabel: '对话框'},
  {key: 'slidepanel', icon: 'menu', label: 'SlidePanel 抽屉', shortLabel: '抽屉'},
  {key: 'message', icon: 'share', label: 'Message/Notice', shortLabel: '消息'},
  {key: 'table', icon: 'list', label: 'Table 表格', shortLabel: '表格'},
  {key: 'tree', icon: 'folder', label: 'Tree 树', shortLabel: '树'},
  {key: 'tabpanel', icon: 'more', label: 'TabPanel 标签页', shortLabel: '标签'},
  {key: 'colorpicker', icon: 'tag', label: 'ColorPicker', shortLabel: '取色'},
  {key: 'datepicker', icon: 'calendar', label: 'DatePicker 日期', shortLabel: '日期'},
  {key: 'form', icon: 'edit', label: '表单组件', shortLabel: '表单'},
  {key: 'splitter', icon: 'back', label: 'Splitter 分割', shortLabel: '分割'},
  {key: 'feedback', icon: 'refresh', label: 'Spin/Loading', shortLabel: '加载'},
  {key: 'infopage', icon: 'sign_info', label: 'InfoPage 信息页', shortLabel: '信息'},
  {key: 'tag', icon: 'tag', label: 'Tag 标签', shortLabel: '标签'},
  {key: 'avatar', icon: 'user', label: 'Avatar 头像', shortLabel: '头像'},
  {key: 'grid', icon: 'columns_2', label: 'Grid 栅格', shortLabel: '栅格'},
  {key: 'upload', icon: 'upload', label: '文件上传', shortLabel: '上传'},
  {key: 'login', icon: 'user', label: '登录页', shortLabel: '登录'},
  {key: 'navmenu', icon: 'menu', label: 'NavMenu/MenuBar', shortLabel: '导航'},
  {key: 'propertiesnav', icon: 'project_settings', label: 'PropertiesNaviBar', shortLabel: '属性'},
  {key: 'codeeditor', icon: 'document', label: 'CodeEditor', shortLabel: '代码'},
  {key: 'richeditor', icon: 'edit', label: 'RichEditor', shortLabel: '富文本'},
]

const App: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedKey = location.pathname.replace(/^\//, '') || 'button'

  const [baseSize, setBaseSize] = React.useState(16)
  const [navMode, setNavMode] = React.useState<NavMenuMode>('icon-label')

  React.useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${baseSize}px`)
  }, [baseSize])

  const [userPanelOpen, setUserPanelOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const currentUser = useUserStore((s) => s.currentUser)
  const avatarText = currentUser?.name?.[0] ?? 'U'

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <Icon name="rocket" size={18} color="var(--color-primary)"/>
          <span className="text-sm font-semibold">AirDesign Demo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5 text-xs">
            <button
              type="button"
              className={`rounded px-2 py-0.5 ${navMode === 'icon' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              onClick={() => setNavMode('icon')}
            >
              图标
            </button>
            <button
              type="button"
              className={`rounded px-2 py-0.5 ${navMode === 'icon-label' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              onClick={() => setNavMode('icon-label')}
            >
              图标+文字
            </button>
          </div>
          <span className="text-xs text-muted-foreground">字号 {baseSize}px</span>
          <button onClick={() => setBaseSize((s) => Math.max(12, s - 1))} className="size-6 rounded bg-muted text-xs hover:bg-accent">−</button>
          <input
            type="range" min={12} max={20} value={baseSize}
            onChange={(e) => setBaseSize(Number(e.target.value))}
            className="w-20"
          />
          <button onClick={() => setBaseSize((s) => Math.min(20, s + 1))} className="size-6 rounded bg-muted text-xs hover:bg-accent">+</button>
          <Avatar
            src={getAvatarUrl(currentUser?.avatar)}
            size={28}
            className="af-header-avatar cursor-pointer transition-transform hover:scale-105"
            onClick={() => setUserPanelOpen(true)}
            alt={currentUser?.name ?? '用户'}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <NavMenu
          mode={navMode}
          items={NAV}
          selectedKey={selectedKey}
          onSelect={(key) => navigate(`/${key}`)}
        />

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
            <Route path="datepicker" element={<DatePickerPage/>}/>
            <Route path="form" element={<FormPage/>}/>
            <Route path="splitter" element={<SplitterPage/>}/>
            <Route path="feedback" element={<FeedbackPage/>}/>
            <Route path="infopage" element={<InfoPagePage/>}/>
            <Route path="tag" element={<TagPage/>}/>
            <Route path="avatar" element={<AvatarPage/>}/>
            <Route path="grid" element={<GridPage/>}/>
            <Route path="upload" element={<UploadPage/>}/>
            <Route path="login" element={<LoginPage/>}/>
            <Route path="navmenu" element={<NavMenuPage/>}/>
            <Route path="propertiesnav" element={<PropertiesNaviBarPage/>}/>
            <Route path="codeeditor" element={<CodeEditorPage/>}/>
            <Route path="richeditor" element={<RichEditorPage/>}/>
          </Routes>
        </main>
      </div>

      <SlidePanel
        open={userPanelOpen}
        type="small"
        title="账户"
        hasCloseButton
        hasButtonBar={false}
        onClose={() => setUserPanelOpen(false)}
      >
        <div className="flex flex-col gap-4 py-2">
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

      <UserSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  )
}

export default App
