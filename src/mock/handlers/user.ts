/**
 * 用户模块 mock handlers
 *
 * 模拟用户登录、注册、信息管理、设置等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok, fail, findById, listAll, create, update, remove} from '../mockStore';

// 预置用户数据
const mockUsers = [
  {id: 'admin', name: '管理员', role: 'admin', avatar: '', email: 'admin@airmachine.io', phone: '', status: 'A'},
  {id: 'user1', name: '张三', role: 'user', avatar: '', email: 'zhangsan@airmachine.io', phone: '13800000001', status: 'A'},
  {id: 'user2', name: '李四', role: 'user', avatar: '', email: 'lisi@airmachine.io', phone: '13800000002', status: 'A'},
];

const mockUserSettings: Record<string, any> = {
  user1: {userId: 'user1', displaySettings: JSON.stringify({fontSize: 16, theme: 'light'})},
  user2: {userId: 'user2', displaySettings: JSON.stringify({fontSize: 14, theme: 'dark'})},
};

export const userHandlers: MockHandler[] = [
  // ========== 登录 ==========
  {
    url: '/admin/user/login',
    method: 'POST',
    handler: (params) => {
      if (params.id === 'admin' && params.password) {
        const token = 'mock-token-admin-' + Date.now();
        return ok({
          token,
          user: {id: 'admin', name: '管理员', role: 'admin', avatar: '', email: 'admin@airmachine.io'},
        });
      }
      return fail('用户名或密码错误');
    },
  },
  {
    url: '/rest/platform/user/login',
    method: 'POST',
    handler: (params) => {
      const user = mockUsers.find((u) => u.id === params.id);
      if (user && params.password) {
        const token = `mock-token-${user.id}-` + Date.now();
        return ok({token, user});
      }
      return fail('用户名或密码错误');
    },
  },
  // ========== 验证 token ==========
  {
    url: '/rest/user/session/current',
    method: 'POST',
    handler: () => {
      const userId = sessionStorage.getItem('air-machine-user') || 'user1';
      const user = mockUsers.find((u) => u.id === userId) || mockUsers[1];
      return ok(user);
    },
  },
  // ========== 修改 admin 密码 ==========
  {
    url: '/admin/user/changePassword',
    method: 'POST',
    handler: () => ok({}, '密码修改成功'),
  },
  // ========== 用户 CRUD ==========
  {
    url: '/rest/platform/user/info',
    method: 'POST',
    handler: (params) => {
      const user = mockUsers.find((u) => u.id === params.id);
      return user ? ok(user) : fail('用户不存在');
    },
  },
  {
    url: '/rest/platform/user/list',
    method: 'POST',
    handler: () => ok({list: mockUsers, pagination: {page: 1, pageSize: 20, total: mockUsers.length}}),
  },
  {
    url: '/rest/platform/user/create',
    method: 'POST',
    handler: (params) => ok({...params, id: params.id || 'user' + Date.now()}, '创建成功'),
  },
  {
    url: '/rest/platform/user/update',
    method: 'POST',
    handler: (params) => ok({...params}, '更新成功'),
  },
  {
    url: '/rest/platform/user/delete',
    method: 'POST',
    handler: () => ok({}, '删除成功'),
  },
  {
    url: '/rest/platform/user/resetPassword',
    method: 'POST',
    handler: () => ok({}, '密码已重置为默认密码'),
  },
  // ========== 用户设置 ==========
  {
    url: '/rest/platform/user/settings/get',
    method: 'POST',
    handler: (params) => {
      const settings = mockUserSettings[params.userId] || {userId: params.userId, displaySettings: null};
      return ok(settings);
    },
  },
  {
    url: '/rest/platform/user/settings/update',
    method: 'POST',
    handler: (params) => {
      mockUserSettings[params.userId] = params;
      return ok(params);
    },
  },
];
