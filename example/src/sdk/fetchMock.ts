/**
 * air-sdk Demo 的 fetch Mock
 *
 * 拦截 air-sdk 用到的后端端点，返回模拟响应，使 Login/UserSettings 等组件无需真实后端即可交互。
 * 安装：在 SdkPage 渲染前调用 installFetchMock()；无需卸载（Demo 专用）。
 *
 * @author ChaiMingXu, 2026/06/19
 */

const MOCK_USER = {
  id: 1,
  loginId: 'demo',
  name: '示例用户',
  email: 'demo@airdesign.dev',
  phone: '13800000000',
  avatar: 'u01',
  status: '启用',
  role: '管理员',
  createTime: '2026-01-01 10:00:00',
}

const ok = (data?: any) => ({success: true, data: data ?? null, message: ''})
const fail = (message: string) => ({success: false, data: null, message})

/** 内存中的用户设置（可被 updateUserSettings 修改） */
let mockSettings = JSON.stringify({fontSize: 15})

export function installFetchMock() {
  const originalFetch = window.fetch
  const mocked: typeof window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input?.url ?? '')
    const body = init?.body ? safeJson(init.body) : {}

    // 登录
    if (url.endsWith('/admin/user/login') || url.endsWith('/api/v1/auth/login')) {
      if (body?.id === 'demo' && body?.password) {
        return mockResponse(ok({token: 'mock-token', user: MOCK_USER}))
      }
      return mockResponse(fail('用户名或密码错误'))
    }
    // Token 校验
    if (url.endsWith('/api/v1/auth/current')) {
      return mockResponse(ok(MOCK_USER))
    }
    // 用户信息更新
    if (url.endsWith('/api/v1/user/update')) {
      Object.assign(MOCK_USER, body)
      return mockResponse(ok(MOCK_USER))
    }
    // 用户设置：获取
    if (url.endsWith('/api/v1/user/settings/get')) {
      return mockResponse(ok({id: 1, userId: MOCK_USER.id, settings: mockSettings}))
    }
    // 用户设置：更新
    if (url.endsWith('/api/v1/user/settings/update')) {
      mockSettings = body.settings ?? mockSettings
      return mockResponse(ok({id: 1, userId: MOCK_USER.id, settings: mockSettings}))
    }
    // 修改密码
    if (url.endsWith('/api/v1/user/password')) {
      return mockResponse(ok({}))
    }
    // SSO 中转
    if (url.endsWith('/api/v1/transfer/apply')) {
      return mockResponse(ok({transferToken: 'mock-transfer-token'}))
    }
    if (url.endsWith('/api/v1/transfer/accept')) {
      return mockResponse(ok({token: 'mock-token', user: MOCK_USER}))
    }
    // 服务列表
    if (url.endsWith('/api/v1/service/list')) {
      return mockResponse(ok([
        {appName: '测试管理平台', serviceUrl: {origin: 'https://tm.norland.dev'}, description: 'Test Management'},
        {appName: '接口测试平台', serviceUrl: {origin: 'https://apitest.norland.dev'}, description: 'API Testing'},
      ]))
    }

    // 其余请求透传给原生 fetch
    return originalFetch(input, init)
  }
  window.fetch = mocked
}

function safeJson(body: any): any {
  if (typeof body !== 'string') return body
  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}

function mockResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {'Content-Type': 'application/json'},
  })
}
