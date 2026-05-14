/**
 * 平台管理模块 mock handlers
 *
 * 模拟数据字典、自定义字段、PaaS 配置等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok} from '../mockStore';

// 数据字典类型
let dictTypes = [
  {id: 'dt_1', name: '任务优先级', code: 'priority', status: 'A'},
  {id: 'dt_2', name: '任务状态', code: 'task_status', status: 'A'},
];

// 数据字典项
let dictItems = [
  {id: 'di_1', typeId: 'dt_1', name: '紧急', code: 'urgent', sortOrder: 1, status: 'A'},
  {id: 'di_2', typeId: 'dt_1', name: '高', code: 'high', sortOrder: 2, status: 'A'},
  {id: 'di_3', typeId: 'dt_1', name: '中', code: 'medium', sortOrder: 3, status: 'A'},
  {id: 'di_4', typeId: 'dt_1', name: '低', code: 'low', sortOrder: 4, status: 'A'},
  {id: 'di_5', typeId: 'dt_2', name: '待办', code: 'todo', sortOrder: 1, status: 'A'},
  {id: 'di_6', typeId: 'dt_2', name: '进行中', code: 'in_progress', sortOrder: 2, status: 'A'},
  {id: 'di_7', typeId: 'dt_2', name: '已完成', code: 'done', sortOrder: 3, status: 'A'},
];

// 自定义字段
let customFields = [
  {id: 'cf_1', name: '截止日期', code: 'due_date', type: 'date', required: false, status: 'A'},
  {id: 'cf_2', name: '负责人', code: 'assignee', type: 'user', required: false, status: 'A'},
];

// PaaS 配置存储
const paasConfigs: Record<string, any> = {
  database: {host: 'localhost', port: 5432, name: 'airmachine', username: 'postgres'},
  redis: {host: 'localhost', port: 6379, password: ''},
  libreoffice: {enabled: false, url: 'http://localhost:9980'},
  mineru: {enabled: false, url: 'http://localhost:8888'},
  searxng: {enabled: false, url: 'http://localhost:8080'},
  gitea: {enabled: false, url: 'http://localhost:3000', token: ''},
  storage: {type: 'local', path: '/data/storage'},
  webcrawler: {enabled: false, maxDepth: 3, timeout: 30000},
};

// 通用 PaaS 配置 CRUD
function paasGetHandler(service: string) {
  return () => ok(paasConfigs[service] || {});
}
function paasSaveHandler(service: string) {
  return (params: any) => {
    paasConfigs[service] = {...paasConfigs[service], ...params};
    return ok(paasConfigs[service], '保存成功');
  };
}

export const platformHandlers: MockHandler[] = [
  // ========== 字典类型 ==========
  {url: '/rest/platform/dictType/list', method: 'POST', handler: () => ok(dictTypes)},
  {
    url: '/rest/platform/dictType/create', method: 'POST',
    handler: (params) => {
      const dt = {id: 'dt_' + Date.now(), ...params};
      dictTypes.push(dt);
      return ok(dt);
    },
  },
  {
    url: '/rest/platform/dictType/update', method: 'POST',
    handler: (params) => {
      const idx = dictTypes.findIndex((d) => d.id === params.id);
      if (idx >= 0) dictTypes[idx] = {...dictTypes[idx], ...params};
      return ok(dictTypes[idx]);
    },
  },
  {
    url: '/rest/platform/dictType/delete', method: 'POST',
    handler: (params) => {
      dictTypes = dictTypes.filter((d) => d.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== 字典项 ==========
  {url: '/rest/platform/dictItem/list', method: 'POST', handler: () => ok(dictItems)},
  {
    url: '/rest/platform/dictItem/listByTypeId', method: 'POST',
    handler: (params) => ok(dictItems.filter((d) => d.typeId === params.typeId)),
  },
  {
    url: '/rest/platform/dictItem/create', method: 'POST',
    handler: (params) => {
      const di = {id: 'di_' + Date.now(), ...params};
      dictItems.push(di);
      return ok(di);
    },
  },
  {
    url: '/rest/platform/dictItem/update', method: 'POST',
    handler: (params) => {
      const idx = dictItems.findIndex((d) => d.id === params.id);
      if (idx >= 0) dictItems[idx] = {...dictItems[idx], ...params};
      return ok(dictItems[idx]);
    },
  },
  {
    url: '/rest/platform/dictItem/delete', method: 'POST',
    handler: (params) => {
      dictItems = dictItems.filter((d) => d.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== 自定义字段 ==========
  {url: '/rest/platform/customField/list', method: 'POST', handler: () => ok(customFields)},
  {
    url: '/rest/platform/customField/create', method: 'POST',
    handler: (params) => {
      const cf = {id: 'cf_' + Date.now(), ...params};
      customFields.push(cf);
      return ok(cf);
    },
  },
  {
    url: '/rest/platform/customField/update', method: 'POST',
    handler: (params) => {
      const idx = customFields.findIndex((f) => f.id === params.id);
      if (idx >= 0) customFields[idx] = {...customFields[idx], ...params};
      return ok(customFields[idx]);
    },
  },
  {
    url: '/rest/platform/customField/delete', method: 'POST',
    handler: (params) => {
      customFields = customFields.filter((f) => f.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== PaaS 配置 ==========
  {url: '/admin/paas/database/get', method: 'POST', handler: paasGetHandler('database')},
  {url: '/admin/paas/database/save', method: 'POST', handler: paasSaveHandler('database')},
  {url: '/admin/paas/redis/get', method: 'POST', handler: paasGetHandler('redis')},
  {url: '/admin/paas/redis/save', method: 'POST', handler: paasSaveHandler('redis')},
  {url: '/admin/paas/libreoffice/get', method: 'POST', handler: paasGetHandler('libreoffice')},
  {url: '/admin/paas/libreoffice/save', method: 'POST', handler: paasSaveHandler('libreoffice')},
  {url: '/admin/paas/mineru/get', method: 'POST', handler: paasGetHandler('mineru')},
  {url: '/admin/paas/mineru/save', method: 'POST', handler: paasSaveHandler('mineru')},
  {url: '/admin/paas/searxng/get', method: 'POST', handler: paasGetHandler('searxng')},
  {url: '/admin/paas/searxng/save', method: 'POST', handler: paasSaveHandler('searxng')},
  {url: '/admin/paas/gitea/get', method: 'POST', handler: paasGetHandler('gitea')},
  {url: '/admin/paas/gitea/save', method: 'POST', handler: paasSaveHandler('gitea')},
  {url: '/admin/paas/storage/get', method: 'POST', handler: paasGetHandler('storage')},
  {url: '/admin/paas/storage/save', method: 'POST', handler: paasSaveHandler('storage')},
  {url: '/admin/paas/webcrawler/get', method: 'POST', handler: paasGetHandler('webcrawler')},
  {url: '/admin/paas/webcrawler/save', method: 'POST', handler: paasSaveHandler('webcrawler')},
  {
    url: '/admin/paas/config/all', method: 'POST',
    handler: () => ok(Object.entries(paasConfigs).map(([key, value]) => ({service: key, config: value}))),
  },
];
