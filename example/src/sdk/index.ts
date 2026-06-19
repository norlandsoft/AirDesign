/**
 * air-sdk 初始化：配置 + Mock fetch + 用户状态种子
 *
 * 在 App 加载前执行一次，为 UserSettings/AppSwitcher 提供运行环境。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {defineSdkConfig, useUserStore} from 'air-sdk'
import {installFetchMock} from './fetchMock'

defineSdkConfig({
  storagePrefix: 'air-design-example',
  appName: 'AirDesign Demo',
  appTagline: 'Component Library Demo',
  theme: 'teal',
})

installFetchMock()

// 模拟一个已登录用户，便于直接展示 UserSettings
const token = sessionStorage.getItem('air-design-example-token')
if (!token) {
  sessionStorage.setItem('air-design-example-token', 'mock-token')
  sessionStorage.setItem('air-design-example-uid', '1')
  sessionStorage.setItem('air-design-example-user', 'demo')
}

// 预置 currentUser（UserSettings 依赖它）
useUserStore.setState({
  currentUser: {
    id: 1,
    loginId: 'demo',
    name: '示例用户',
    email: 'demo@airdesign.dev',
    phone: '13800000000',
    avatar: 'u01',
    status: '启用',
    role: '管理员',
    createTime: '2026-01-01 10:00:00',
  } as any,
  isAuthenticated: true,
})
