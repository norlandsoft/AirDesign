/**
 * Mock 拦截器
 *
 * 通过重写全局 window.fetch 实现接口拦截，使前端项目可脱离后端独立运行。
 * 拦截器会按注册顺序匹配 URL，命中则返回 mock 数据，未命中则调用原始 fetch。
 *
 * 设计思路：
 * - 不修改任何业务代码，仅在应用入口处启用拦截
 * - 每个 handler 返回标准格式 { success: boolean, data: any, message?: string }
 * - 支持 SSE 流式响应的 mock
 *
 * @author ChaiMingXu, on 2026/05/14
 */

/** Mock handler：URL 匹配字符串或正则，处理函数返回响应数据 */
export interface MockHandler {
  /** URL 匹配规则，支持精确字符串或正则表达式 */
  url: string | RegExp;
  /** HTTP 方法，默认 POST */
  method?: string;
  /** 处理函数，接收请求参数，返回 mock 数据 */
  handler: (params: any, url: string) => any;
}

/** SSE Mock handler：模拟流式响应 */
export interface SSEMockHandler {
  /** URL 匹配规则 */
  url: string | RegExp;
  /** 模拟流式输出，通过 callback 逐段返回数据，最后调用 done() */
  handler: (params: any, url: string, callback: (chunk: string) => void, done: () => void) => void;
}

const mockHandlers: MockHandler[] = [];
const sseMockHandlers: SSEMockHandler[] = [];

/** 原始 fetch 引用 */
const originalFetch = window.fetch.bind(window);

/** 注册普通接口的 mock handler */
export function registerMock(handler: MockHandler) {
  mockHandlers.push(handler);
}

/** 批量注册 mock handlers */
export function registerMocks(handlers: MockHandler[]) {
  mockHandlers.push(...handlers);
}

/** 注册 SSE 流式接口的 mock handler */
export function registerSSEMock(handler: SSEMockHandler) {
  sseMockHandlers.push(handler);
}

/**
 * 匹配 URL 是否符合规则
 */
function matchUrl(pattern: string | RegExp, url: string): boolean {
  if (typeof pattern === 'string') {
    return url === pattern;
  }
  return pattern.test(url);
}

/**
 * 解析请求体
 */
function parseBody(body: any): any {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

/**
 * 创建模拟的 fetch Response 对象
 */
function createMockResponse(data: any): Response {
  const jsonStr = JSON.stringify(data);
  const blob = new Blob([jsonStr], {type: 'application/json'});
  return new Response(blob, {
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'application/json;charset=UTF-8',
      'Content-Length': String(jsonStr.length),
    }),
  });
}

/**
 * 拦截后的 fetch 实现
 *
 * 依次检查所有注册的 mock handlers：
 * 1. 匹配 URL 和 HTTP 方法
 * 2. 如果命中，调用 handler 获取 mock 数据并返回 Response
 * 3. 如果未命中，调用原始 fetch
 */
async function mockedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : (input as Request).url;
  const method = (init?.method || 'GET').toUpperCase();

  // 仅拦截 POST 和 GET 请求（项目中的 API 全部是这两种）
  if (method === 'POST' || method === 'GET') {
    const params = method === 'POST' ? parseBody(init?.body) : {};

    for (const mock of mockHandlers) {
      const mockMethod = (mock.method || 'POST').toUpperCase();
      if (matchUrl(mock.url, url) && mockMethod === method) {
        try {
          const result = mock.handler(params, url);
          // 支持 handler 返回 Promise（异步场景）
          const data = result instanceof Promise ? await result : result;
          return createMockResponse(data);
        } catch (e) {
          console.error(`[Mock] handler 执行错误: ${url}`, e);
          return createMockResponse({success: false, message: 'Mock handler 执行错误'});
        }
      }
    }
  }

  // 未命中任何 mock，调用原始 fetch
  return originalFetch(input, init);
}

/**
 * SSE mock 实现
 *
 * 模拟 SSE 流式响应，将 mock handler 的输出转换为 SSE data: 格式，
 * 通过 setTimeout 模拟异步逐段输出
 */
export function mockSSEPost(
    url: string,
    params: any,
    callback: (data: string) => void,
    idleTimeout: number = 120000
) {
  for (const mock of sseMockHandlers) {
    if (matchUrl(mock.url, url)) {
      // 找到匹配的 SSE mock handler
      mock.handler(params, url, (chunk: string) => {
        callback(chunk);
      }, () => {
        // 流结束，不做额外处理
      });
      return;
    }
  }

  // 未匹配到 SSE mock，输出警告
  console.warn(`[Mock SSE] 未匹配到 mock: ${url}`);
  callback('<|ERR|>');
}

/**
 * 启用 mock 拦截
 *
 * 重写 window.fetch 为 mock 版本，同时标记 SSE_POST 可通过
 * mockSSEPost 来判断是否需要拦截
 */
export function enableMock() {
  window.fetch = mockedFetch;
  // 标记 mock 已启用，供 HttpRequest.ts 检查
  (window as any).__MOCK_ENABLED__ = true;
  console.log('[Mock] 拦截器已启用，所有 API 请求将使用 mock 数据');
}
