import { Button, Icon, Message } from 'air-design'

function Home() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>AirDesign</h2>
        <p>毛玻璃风格 UI 组件库，为现代 Web 应用提供优雅、美观的组件</p>
      </div>

      <div className="demo-section">
        <h3>特性</h3>
        <div className="demo-box">
          <ul style={{ lineHeight: 2, color: 'rgba(255,255,255,0.8)' }}>
            <li>毛玻璃风格设计，现代美观</li>
            <li>基于 React 开发，支持 TypeScript</li>
            <li>支持 Ant Design 生态</li>
            <li>丰富的组件库，开箱即用</li>
            <li>高度可定制化</li>
          </ul>
        </div>
      </div>

      <div className="demo-section">
        <h3>快速开始</h3>
        <div className="demo-box">
          <div className="code-block">
            <code>
              <pre>{`import { Button, Dialog, Message } from 'air-design'
import 'air-design/dist/index.css'

function App() {
  return <Button type="primary">点击我</Button>
}`}</pre>
            </code>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>快速体验</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button type="primary" icon="plus">
              主要按钮
            </Button>
            <Button icon="edit">默认按钮</Button>
            <Button type="danger" icon="delete">
              危险按钮
            </Button>
            <Button
              onClick={() => Message.success('欢迎使用 AirDesign！')}
              icon="star"
            >
              点击提示
            </Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>组件列表</h3>
        <div className="demo-box">
          <table className="props-table">
            <thead>
              <tr>
                <th>组件</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Button</td>
                <td>毛玻璃风格按钮</td>
              </tr>
              <tr>
                <td>ColorPicker</td>
                <td>颜色选择器</td>
              </tr>
              <tr>
                <td>Dialog</td>
                <td>对话框</td>
              </tr>
              <tr>
                <td>EditableLabel</td>
                <td>可编辑标签</td>
              </tr>
              <tr>
                <td>GroupSplitter</td>
                <td>分组分割</td>
              </tr>
              <tr>
                <td>Help</td>
                <td>帮助提示</td>
              </tr>
              <tr>
                <td>Icon</td>
                <td>图标组件</td>
              </tr>
              <tr>
                <td>List</td>
                <td>列表组件</td>
              </tr>
              <tr>
                <td>LoadingPanel</td>
                <td>加载面板</td>
              </tr>
              <tr>
                <td>Message</td>
                <td>全局消息</td>
              </tr>
              <tr>
                <td>Notification</td>
                <td>通知提醒</td>
              </tr>
              <tr>
                <td>SlidePanel</td>
                <td>滑动面板</td>
              </tr>
              <tr>
                <td>Splitter</td>
                <td>分割器</td>
              </tr>
              <tr>
                <td>TabPanel</td>
                <td>标签页面板</td>
              </tr>
              <tr>
                <td>Table</td>
                <td>表格组件</td>
              </tr>
              <tr>
                <td>Tree</td>
                <td>树形组件</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Home
