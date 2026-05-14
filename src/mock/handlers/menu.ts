/**
 * 菜单和全局配置模块 mock handlers
 *
 * 模拟系统菜单、应用信息等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok} from '../mockStore';

// 菜单数据
const normalMenuList = [
  {id: 'menu_home', name: '首页', icon: 'home', role: 'user', sortOrder: 1},
  {id: 'menu_chat', name: '对话', icon: 'chat', role: 'user', sortOrder: 2},
  {id: 'menu_wiki', name: '知识库', icon: 'wiki', role: 'user', sortOrder: 3},
  {id: 'menu_workflow', name: '工作流', icon: 'workflow', role: 'user', sortOrder: 4},
  {id: 'menu_jobs', name: '工作室', icon: 'jobs', role: 'user', sortOrder: 5},
  {id: 'menu_skill', name: '技能', icon: 'skill', role: 'user', sortOrder: 6},
  {id: 'menu_setting', name: '设置', icon: 'setting', role: 'user', sortOrder: 7},
];

const adminMenuList = [
  {id: 'menu_home', name: '首页', icon: 'home', role: 'admin', sortOrder: 1},
  {id: 'menu_paas', name: '平台管理', icon: 'admin', role: 'admin', sortOrder: 2},
  {id: 'menu_setting', name: '设置', icon: 'setting', role: 'admin', sortOrder: 3},
];

export const menuHandlers: MockHandler[] = [
  {
    url: '/admin/menu',
    method: 'POST',
    handler: () => ok(adminMenuList),
  },
  {
    url: '/rest/platform/menu/list',
    method: 'POST',
    handler: () => ok(normalMenuList),
  },
  {
    url: '/rest/framework/app/info',
    method: 'POST',
    handler: () => ok({
      name: 'AirMachine',
      version: '1.0.0',
      description: '企业级智能中台',
      logo: '/favicon.svg',
    }),
  },
];
