/**
 * Mock 系统入口
 *
 * 汇总所有模块的 mock handlers 并注册到拦截器。
 * 在应用启动时调用 setupMock() 即可启用所有 mock。
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {enableMock, registerMocks, registerSSEMock} from './mockInterceptor';
import {userHandlers} from './handlers/user';
import {menuHandlers} from './handlers/menu';
import {chatHandlers, chatSSEHandlers} from './handlers/chat';
import {openclawHandlers} from './handlers/openclaw';
import {platformHandlers} from './handlers/platform';
import {skillHandlers} from './handlers/skill';
import {wikiHandlers} from './handlers/wiki';
import {workflowHandlers} from './handlers/workflow';
import {jobHandlers} from './handlers/jobs';

/**
 * 初始化并启用 Mock 系统
 *
 * 注册所有模块的 mock handlers 后启用全局 fetch 拦截。
 * 仅在开发环境且无后端服务时使用。
 */
export function setupMock() {
  // 注册普通接口
  registerMocks([
    ...userHandlers,
    ...menuHandlers,
    ...chatHandlers,
    ...openclawHandlers,
    ...platformHandlers,
    ...skillHandlers,
    ...wikiHandlers,
    ...workflowHandlers,
    ...jobHandlers,
  ]);

  // 注册 SSE 流式接口
  chatSSEHandlers.forEach((h) => registerSSEMock(h));

  // 启用拦截
  enableMock();
}
