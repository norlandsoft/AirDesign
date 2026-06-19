/**
 * air-sdk 组件展示页
 *
 * Demo 专用：Mock fetch 后端，展示 air-sdk 的 Login、UserSettings、AppSwitcher。
 * Login 单独嵌入展示（不接管路由）；UserSettings/AppSwitcher 通过按钮触发。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useState} from 'react'
import {defineSdkConfig, Login, UserSettings, useUserStore} from 'air-sdk'
import {Button} from 'air-design'
import {installFetchMock} from '../sdk/fetchMock'
import PageContainer from '../components/PageContainer'

// 初始化 SDK 配置 + Mock（模块加载时执行一次）
defineSdkConfig({
  storagePrefix: 'air-design-example',
  appName: 'AirDesign Demo',
  appTagline: 'Component Library Demo',
  theme: 'teal',
})
installFetchMock()

const SdkPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const currentUser = useUserStore((s) => s.currentUser)
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)

  // 首次进入：模拟一个已登录用户，便于直接展示 UserSettings
  useEffect(() => {
    const token = sessionStorage.getItem('air-design-example-token')
    if (!token) {
      sessionStorage.setItem('air-design-example-token', 'mock-token')
      sessionStorage.setItem('air-design-example-uid', '1')
      sessionStorage.setItem('air-design-example-user', 'demo')
      useUserStore.setState({currentUser: null, isAuthenticated: true})
      useUserStore.getState().validateToken()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageContainer title="air-sdk 业务脚手架" description="Mock 后端展示 air-sdk 组件：Login 登录页、UserSettings 用户设置、AppSwitcher 应用切换。">
      <div className="demo-block">
        <h3 className="demo-section-title">当前状态</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="rounded bg-muted px-2 py-1">
            {isAuthenticated ? `已登录：${currentUser?.name ?? '加载中'}` : '未登录'}
          </span>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">组件入口</h3>
        <div className="demo-row">
          <Button type="primary" onClick={() => setShowLogin(true)}>展示登录页（Login）</Button>
          <Button onClick={() => setShowSettings(true)}>打开用户设置（UserSettings）</Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Mock 账号：<code className="rounded bg-muted px-1">demo</code> / 任意密码
        </div>
      </div>

      {/* Login 展示：嵌入一个固定高度容器 */}
      {showLogin && (
        <div className="demo-block">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="demo-section-title !mb-0 !border-0 !pb-0">Login 登录页（Canvas 星野动画）</h3>
            <Button size="sm" onClick={() => setShowLogin(false)}>收起</Button>
          </div>
          <div className="air-login-demo-frame">
            <Login/>
          </div>
        </div>
      )}

      {/* UserSettings 侧滑面板 */}
      <UserSettings visible={showSettings} onClose={() => setShowSettings(false)}/>
    </PageContainer>
  )
}

export default SdkPage
