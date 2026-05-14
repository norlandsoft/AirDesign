/**
 * UmiJS 运行时配置入口
 *
 * 在应用启动前初始化 Mock 系统，拦截所有后端 API 请求。
 * 通过 UmiJS 的 render 钩子确保 mock 在应用渲染前完成初始化。
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {setupMock} from './mock/index';

// 立即启用 mock（同步，在任何组件渲染前执行）
setupMock();

export const render = (oldRender: () => void) => {
  oldRender();
};
