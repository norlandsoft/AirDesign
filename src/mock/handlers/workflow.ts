/**
 * 工作流模块 mock handlers
 *
 * 模拟工作流 CRUD、Action、Edge、任务执行、日志等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok, fail} from '../mockStore';

// 工作流列表
let workflowList = [
  {
    id: 'wf_1', name: '示例工作流', description: '这是一个示例工作流', status: 'D',
    createdAt: '2026-04-01 10:00:00', updatedAt: '2026-05-14 10:00:00',
  },
];

// 工作流 Action
let workflowActions: Record<string, any> = {
  wf_1: [
    {id: 'act_1', flowId: 'wf_1', name: '开始', type: 'start', position: {x: 100, y: 100}, config: {}},
    {id: 'act_2', flowId: 'wf_1', name: 'LLM 调用', type: 'llm', position: {x: 300, y: 100}, config: {model: 'gpt-4o', prompt: '请回答用户问题'}},
    {id: 'act_3', flowId: 'wf_1', name: '结束', type: 'end', position: {x: 500, y: 100}, config: {}},
  ],
};

// 工作流 Edge
let workflowEdges: Record<string, any[]> = {
  wf_1: [
    {id: 'edge_1', source: 'act_1', target: 'act_2'},
    {id: 'edge_2', source: 'act_2', target: 'act_3'},
  ],
};

// 任务日志
let taskLogs: Record<string, any[]> = {};

// 工作流执行设置
let workflowProps: Record<string, any> = {};

export const workflowHandlers: MockHandler[] = [
  // ========== 工作流 CRUD ==========
  {
    url: '/rest/workflow/list', method: 'POST',
    handler: () => ok(workflowList),
  },
  {
    url: '/rest/workflow/info', method: 'POST',
    handler: (params) => {
      const wf = workflowList.find((w) => w.id === params.id);
      return wf ? ok(wf) : fail('工作流不存在');
    },
  },
  {
    url: '/rest/workflow/save', method: 'POST',
    handler: (params) => {
      const idx = workflowList.findIndex((w) => w.id === params.id);
      if (idx >= 0) {
        workflowList[idx] = {...workflowList[idx], ...params};
        return ok(workflowList[idx]);
      }
      const wf = {id: 'wf_' + Date.now(), ...params, createdAt: new Date().toISOString()};
      workflowList.push(wf);
      return ok(wf);
    },
  },
  {
    url: '/rest/workflow/delete', method: 'POST',
    handler: (params) => {
      workflowList = workflowList.filter((w) => w.id !== params.id);
      return ok({}, '删除成功');
    },
  },
  {
    url: '/rest/workflow/export', method: 'POST',
    handler: (params) => {
      const wf = workflowList.find((w) => w.id === params.id);
      return wf ? ok({workflow: wf, actions: workflowActions[params.id] || [], edges: workflowEdges[params.id] || []}) : fail('工作流不存在');
    },
  },
  {
    url: '/rest/workflow/import/preview', method: 'POST',
    handler: () => ok({workflows: []}),
  },
  {
    url: '/rest/workflow/import/execute', method: 'POST',
    handler: () => ok({}, '导入成功'),
  },

  // ========== Action ==========
  {
    url: '/rest/workflow/action/info', method: 'POST',
    handler: (params) => ok(workflowActions[params.flowId] || []),
  },
  {
    url: '/rest/workflow/action/save', method: 'POST',
    handler: (params) => {
      const flowId = params.flowId;
      if (!workflowActions[flowId]) workflowActions[flowId] = [];
      const idx = workflowActions[flowId].findIndex((a: any) => a.id === params.id);
      if (idx >= 0) {
        workflowActions[flowId][idx] = {...workflowActions[flowId][idx], ...params};
      } else {
        workflowActions[flowId].push({id: 'act_' + Date.now(), ...params});
      }
      return ok(params);
    },
  },
  {
    url: '/rest/workflow/action/delete', method: 'POST',
    handler: (params) => {
      const flowId = params.flowId;
      if (workflowActions[flowId]) {
        workflowActions[flowId] = workflowActions[flowId].filter((a: any) => a.id !== params.id);
      }
      return ok({}, '删除成功');
    },
  },

  // ========== Edge ==========
  {
    url: '/rest/workflow/edges', method: 'POST',
    handler: (params) => ok(workflowEdges[params.flowId] || []),
  },
  {
    url: '/rest/workflow/edge/save', method: 'POST',
    handler: (params) => {
      const flowId = params.flowId;
      if (!workflowEdges[flowId]) workflowEdges[flowId] = [];
      workflowEdges[flowId].push({id: 'edge_' + Date.now(), ...params});
      return ok(params);
    },
  },
  {
    url: '/rest/workflow/edge/delete', method: 'POST',
    handler: (params) => {
      const flowId = params.flowId;
      if (workflowEdges[flowId]) {
        workflowEdges[flowId] = workflowEdges[flowId].filter((e: any) => e.id !== params.id);
      }
      return ok({}, '删除成功');
    },
  },

  // ========== 任务执行 ==========
  {
    url: '/rest/workflow/run', method: 'POST',
    handler: (params) => ok({taskId: 'task_' + Date.now(), status: 'R'}, '工作流已启动'),
  },
  {
    url: '/rest/workflow/task/stop', method: 'POST',
    handler: () => ok({}, '任务已停止'),
  },
  {
    url: '/rest/workflow/task/status', method: 'POST',
    handler: (params) => ok({taskId: params.taskId, status: 'C', progress: 100}),
  },
  {
    url: '/rest/workflow/task/running', method: 'POST',
    handler: () => ok(null),
  },
  {
    url: '/rest/workflow/task/result', method: 'POST',
    handler: () => ok({status: 'C', result: 'Mock 执行结果'}),
  },
  {
    url: '/rest/workflow/status', method: 'POST',
    handler: () => ok({status: 'C'}),
  },

  // ========== 日志 ==========
  {
    url: '/rest/workflow/log/flow', method: 'POST',
    handler: () => ok([]),
  },
  {
    url: '/rest/workflow/log/task', method: 'POST',
    handler: (params) => ok(taskLogs[params.taskId] || []),
  },
  {
    url: '/rest/workflow/log/agentStreamReceived', method: 'POST',
    handler: () => ok({}),
  },
  {
    url: '/rest/workflow/log/task/delete', method: 'POST',
    handler: () => ok({}, '删除成功'),
  },
  {
    url: '/rest/workflow/log/clear', method: 'POST',
    handler: () => ok({}, '清除成功'),
  },

  // ========== 执行设置 ==========
  {
    url: '/rest/workflow/props/get', method: 'POST',
    handler: (params) => ok(workflowProps[params.flowId] || {}),
  },
  {
    url: '/rest/workflow/props/save', method: 'POST',
    handler: (params) => {
      workflowProps[params.flowId] = params;
      return ok(params);
    },
  },
];
