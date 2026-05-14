/**
 * 工作室模块 mock handlers
 *
 * 模拟工作（Job）管理、执行控制、资产管理、看板、存储等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok, fail} from '../mockStore';

// 工作列表
let jobList = [
  {id: 'job_1', title: '示例工作', description: '这是一个示例工作室工作', status: 'A', priority: 'medium', sessionStatus: undefined, createdAt: '2026-05-01', updatedAt: '2026-05-14'},
  {id: 'job_2', title: '数据分析任务', description: '对销售数据进行分析', status: 'A', priority: 'high', sessionStatus: undefined, createdAt: '2026-05-10', updatedAt: '2026-05-14'},
];

// 工作日志
let jobLogs: Record<string, any[]> = {
  job_1: [
    {id: 'log_1', jobId: 'job_1', sessionId: 'session_1', content: '开始执行工作...', level: 'INFO', createdAt: '2026-05-14 10:00:00'},
  ],
};

// 运行中的任务
let runningContexts: any[] = [];

// 仓库列表
let repoList = [
  {id: 1, full_name: 'studio/demo-project', name: 'demo-project', description: '示例项目', default_branch: 'main', owner: {login: 'studio'}},
];

// 看板数据
let kanbanStatuses = [
  {id: 'Todo', name: '待办', jobId: null},
  {id: 'InProgress', name: '进行中', jobId: null},
  {id: 'Done', name: '已完成', jobId: null},
];
let kanbanActions: any[] = [];

// 存储文件
let storageFiles = [
  {id: 'file_1', name: '示例文件.txt', size: 1024, type: 'text/plain', createdAt: '2026-05-14'},
];

export const jobHandlers: MockHandler[] = [
  // ========== 工作 CRUD ==========
  {
    url: '/rest/platform/job/list', method: 'POST',
    handler: () => ok({jobs: jobList}),
  },
  {
    url: '/rest/platform/job/get', method: 'POST',
    handler: (params) => {
      const job = jobList.find((j) => j.id === params.id);
      return job ? ok(job) : fail('工作不存在');
    },
  },
  {
    url: '/rest/platform/job/create', method: 'POST',
    handler: (params) => {
      const job = {id: 'job_' + Date.now(), ...params, status: 'A', createdAt: new Date().toISOString()};
      jobList.push(job);
      return ok(job);
    },
  },
  {
    url: '/rest/platform/job/update', method: 'POST',
    handler: (params) => {
      const idx = jobList.findIndex((j) => j.id === params.id);
      if (idx >= 0) jobList[idx] = {...jobList[idx], ...params};
      return ok(jobList[idx]);
    },
  },
  {
    url: '/rest/platform/job/delete', method: 'POST',
    handler: (params) => {
      jobList = jobList.filter((j) => j.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== 工作日志 ==========
  {
    url: '/rest/platform/job/log/list', method: 'POST',
    handler: (params) => ok({logs: jobLogs[params.jobId] || []}),
  },
  {
    url: '/rest/platform/job/log/create', method: 'POST',
    handler: (params) => {
      const log = {id: 'log_' + Date.now(), ...params, createdAt: new Date().toISOString()};
      if (!jobLogs[params.jobId]) jobLogs[params.jobId] = [];
      jobLogs[params.jobId].push(log);
      return ok(log);
    },
  },

  // ========== 执行控制 ==========
  {
    url: '/rest/studio/job/start', method: 'POST',
    handler: (params) => {
      const ctx = {jobId: params.id, jobTitle: params.jobTitle || '未命名', status: 'R', statusMessage: 'Mock 模式：模拟执行中', progress: 50, startTime: Date.now()};
      runningContexts.push(ctx);
      return ok(ctx);
    },
  },
  {url: '/rest/studio/job/pause', method: 'POST', handler: () => ok({}, '已暂停')},
  {url: '/rest/studio/job/resume', method: 'POST', handler: () => ok({}, '已恢复')},
  {url: '/rest/studio/job/cancel', method: 'POST', handler: () => ok({}, '已取消')},
  {url: '/rest/studio/job/retry', method: 'POST', handler: () => ok({}, '已重试')},
  {
    url: '/rest/studio/job/status', method: 'POST',
    handler: (params) => ok({jobId: params.id, status: 'C', progress: 100}),
  },
  {
    url: '/rest/studio/job/running', method: 'POST',
    handler: () => ok(runningContexts),
  },
  {
    url: '/rest/studio/job/engine', method: 'POST',
    handler: () => ok({status: 'running', version: 'mock-1.0.0'}),
  },
  {
    url: '/rest/studio/job/force-clear', method: 'POST',
    handler: () => ok({}, '已清除'),
  },
  {
    url: '/rest/studio/job/cleanup-stale', method: 'POST',
    handler: () => ok({cleaned: 0}),
  },

  // ========== 资产仓库 ==========
  {
    url: '/rest/platform/job/asset/list', method: 'POST',
    handler: () => ok(repoList),
  },
  {
    url: '/rest/platform/job/asset/delete', method: 'POST',
    handler: (params) => {
      repoList = repoList.filter((r) => r.full_name !== `${params.owner}/${params.repo}`);
      return ok({}, '删除成功');
    },
  },

  // ========== 看板 ==========
  {
    url: '/rest/platform/kanban/board', method: 'POST',
    handler: () => ok({statuses: kanbanStatuses, actions: kanbanActions}),
  },
  {
    url: '/rest/platform/action/create', method: 'POST',
    handler: (params) => {
      const action = {id: 'action_' + Date.now(), ...params};
      kanbanActions.push(action);
      return ok(action);
    },
  },
  {
    url: '/rest/platform/action/update', method: 'POST',
    handler: (params) => {
      const idx = kanbanActions.findIndex((a) => a.id === params.id);
      if (idx >= 0) kanbanActions[idx] = {...kanbanActions[idx], ...params};
      return ok(kanbanActions[idx]);
    },
  },
  {
    url: '/rest/platform/action/delete', method: 'POST',
    handler: (params) => {
      kanbanActions = kanbanActions.filter((a) => a.id !== params.id);
      return ok({}, '删除成功');
    },
  },
  {
    url: '/rest/platform/action/reorder', method: 'POST',
    handler: () => ok({}),
  },
  {
    url: '/rest/platform/action/move', method: 'POST',
    handler: () => ok({}),
  },
  {
    url: '/rest/platform/actionStatusLog/list', method: 'POST',
    handler: () => ok([]),
  },
  {
    url: '/rest/platform/actionStatusLog/changeStatus', method: 'POST',
    handler: () => ok({}),
  },

  // ========== Session ==========
  {
    url: '/rest/platform/job/session/list', method: 'POST',
    handler: () => ok({sessions: []}),
  },
  {
    url: '/rest/platform/job/session/delete', method: 'POST',
    handler: () => ok({}, '删除成功'),
  },

  // ========== 存储 ==========
  {
    url: '/rest/platform/storage/upload', method: 'POST',
    handler: () => ok({id: 'file_' + Date.now()}, '上传成功'),
  },
  {
    url: '/rest/platform/storage/list', method: 'POST',
    handler: () => ok(storageFiles),
  },
  {
    url: '/rest/platform/storage/delete', method: 'POST',
    handler: (params) => {
      storageFiles = storageFiles.filter((f) => f.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== 文件上传/下载 ==========
  {
    url: '/rest/file/upload', method: 'POST',
    handler: () => ok({id: 'file_' + Date.now()}, '上传成功'),
  },
];
