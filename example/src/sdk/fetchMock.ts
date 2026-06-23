/**
 * example 的 fetch Mock（供 air-kit UserSettings 交互）
 *
 * 拦截 air-kit 用户相关端点，返回模拟响应，无需真实后端。
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

let mockSettings = JSON.stringify({fontSize: 15})

const ok = (data?: any) => ({success: true, data: data ?? null, message: ''})

export function installFetchMock() {
  const originalFetch = window.fetch
  const mocked: typeof window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : ((input as any)?.url ?? '')
    const body = init?.body ? safeJson(init.body) : {}

    if (url.endsWith('/api/v1/auth/current')) return mockResponse(ok(MOCK_USER))
    if (url.endsWith('/api/v1/user/update')) {
      Object.assign(MOCK_USER, body)
      return mockResponse(ok(MOCK_USER))
    }
    if (url.endsWith('/api/v1/user/settings/get')) {
      return mockResponse(ok({id: 1, userId: MOCK_USER.id, settings: mockSettings}))
    }
    if (url.endsWith('/api/v1/user/settings/update')) {
      mockSettings = body.settings ?? mockSettings
      return mockResponse(ok({id: 1, userId: MOCK_USER.id, settings: mockSettings}))
    }
    if (url.endsWith('/api/v1/user/password')) return mockResponse(ok({}))
    if (url.endsWith('/api/v1/service/list')) {
      return mockResponse(ok([
        {appName: '测试管理平台', serviceUrl: {origin: 'https://tm.norland.dev'}, description: 'Test Management'},
        {appName: '接口测试平台', serviceUrl: {origin: 'https://apitest.norland.dev'}, description: 'API Testing'},
      ]))
    }

    return originalFetch(input as any, init)
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
