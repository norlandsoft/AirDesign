import { Routes, Route, NavLink } from 'react-router-dom'
import Button from './pages/Button'
import ColorPicker from './pages/ColorPicker'
import Dialog from './pages/Dialog'
import EditableLabel from './pages/EditableLabel'
import GroupSplitter from './pages/GroupSplitter'
import Help from './pages/Help'
import Icon from './pages/Icon'
import List from './pages/List'
import LoadingPanel from './pages/LoadingPanel'
import Message from './pages/Message'
import Notification from './pages/Notification'
import SlidePanel from './pages/SlidePanel'
import Splitter from './pages/Splitter'
import TabPanel from './pages/TabPanel'
import Table from './pages/Table'
import Tree from './pages/Tree'
import Home from './pages/Home'

const components = [
  { path: '/', name: '首页', component: Home },
  { path: '/button', name: 'Button 按钮', component: Button },
  { path: '/colorpicker', name: 'ColorPicker 颜色选择器', component: ColorPicker },
  { path: '/dialog', name: 'Dialog 对话框', component: Dialog },
  { path: '/editablelabel', name: 'EditableLabel 可编辑标签', component: EditableLabel },
  { path: '/groupsplitter', name: 'GroupSplitter 分组分割', component: GroupSplitter },
  { path: '/help', name: 'Help 帮助', component: Help },
  { path: '/icon', name: 'Icon 图标', component: Icon },
  { path: '/list', name: 'List 列表', component: List },
  { path: '/loadingpanel', name: 'LoadingPanel 加载面板', component: LoadingPanel },
  { path: '/message', name: 'Message 消息', component: Message },
  { path: '/notification', name: 'Notification 通知', component: Notification },
  { path: '/slidepanel', name: 'SlidePanel 滑动面板', component: SlidePanel },
  { path: '/splitter', name: 'Splitter 分割器', component: Splitter },
  { path: '/tabpanel', name: 'TabPanel 标签页', component: TabPanel },
  { path: '/table', name: 'Table 表格', component: Table },
  { path: '/tree', name: 'Tree 树形', component: Tree },
]

function App() {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>AirDesign</h1>
          <p>毛玻璃风格 UI 组件库</p>
        </div>
        <nav className="sidebar-nav">
          {components.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Routes>
          {components.map((item) => (
            <Route key={item.path} path={item.path} element={<item.component />} />
          ))}
        </Routes>
      </main>
    </>
  )
}

export default App
