/**
 * OpenClaw 智能体平台 mock handlers
 *
 * 模拟智能体管理、模型配置、Markdown 文件操作、定时任务等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler} from '../mockInterceptor';
import {ok, fail} from '../mockStore';

// 智能体列表
let agentList = [
  {id: 'agent_1', name: '通用助手', emoji: '🤖', description: '通用对话助手', systemPrompt: '你是一个友好的AI助手'},
  {id: 'agent_2', name: '代码专家', emoji: '💻', description: '编程辅助助手', systemPrompt: '你是一个编程专家'},
];

// 模型选项
const modelOptions = [
  {provider: 'openai', modelId: 'gpt-4o', name: 'GPT-4o'},
  {provider: 'anthropic', modelId: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet'},
  {provider: 'deepseek', modelId: 'deepseek-chat', name: 'DeepSeek V3'},
];

// Markdown 文件内容
let markdownFiles: Record<string, string> = {
  'README.md': '# AirMachine 智能体\n\n这是一个 Mock 环境的示例文件。',
};

// 定时任务
let cronList: any[] = [];

// 主/备模型配置
let modelDefaults = {primary: 'gpt-4o', fallbacks: ['deepseek-chat']};

// 工作区模型
let workspaceModels = [
  {provider: 'openai', modelId: 'gpt-4o', name: 'GPT-4o'},
];

// OpenClaw 配置
let openclawConfig: any = {};

export const openclawHandlers: MockHandler[] = [
  // ========== 配置 ==========
  {
    url: '/admin/paas/openclaw/get',
    method: 'POST',
    handler: () => ok(openclawConfig),
  },
  {
    url: '/admin/paas/openclaw/save',
    method: 'POST',
    handler: (params) => {
      openclawConfig = {...openclawConfig, ...params};
      return ok(openclawConfig, '保存成功');
    },
  },

  // ========== 智能体 CRUD ==========
  {
    url: '/api/openclaw/agents/list',
    method: 'POST',
    handler: () => ok(agentList),
  },
  {
    url: '/api/openclaw/agents/create',
    method: 'POST',
    handler: (params) => {
      const agent = {id: 'agent_' + Date.now(), ...params};
      agentList.push(agent);
      return ok(agent);
    },
  },
  {
    url: '/api/openclaw/agents/update',
    method: 'POST',
    handler: (params) => {
      const idx = agentList.findIndex((a) => a.id === params.id);
      if (idx >= 0) agentList[idx] = {...agentList[idx], ...params};
      return ok(agentList[idx]);
    },
  },
  {
    url: '/api/openclaw/agents/delete',
    method: 'POST',
    handler: (params) => {
      agentList = agentList.filter((a) => a.id !== params.agentId);
      return ok({}, '删除成功');
    },
  },

  // ========== 模型管理 ==========
  {
    url: '/api/openclaw/models/options',
    method: 'POST',
    handler: () => ok(modelOptions),
  },
  {
    url: '/api/openclaw/models/defaults/get',
    method: 'POST',
    handler: () => ok(modelDefaults),
  },
  {
    url: '/api/openclaw/models/defaults/set',
    method: 'POST',
    handler: (params) => {
      modelDefaults = {...params};
      return ok(modelDefaults);
    },
  },
  {
    url: '/api/openclaw/models/list',
    method: 'POST',
    handler: () => ok(workspaceModels),
  },
  {
    url: '/api/openclaw/models/add',
    method: 'POST',
    handler: (params) => {
      workspaceModels.push(params);
      return ok(params);
    },
  },
  {
    url: '/api/openclaw/models/remove',
    method: 'POST',
    handler: (params) => {
      workspaceModels = workspaceModels.filter(
          (m) => !(m.provider === params.provider && m.modelId === params.modelId)
      );
      return ok({}, '移除成功');
    },
  },

  // ========== Markdown ==========
  {
    url: '/api/openclaw/markdown/get',
    method: 'POST',
    handler: (params) => ok({file: params.file, content: markdownFiles[params.file] || ''}),
  },
  {
    url: '/api/openclaw/markdown/save',
    method: 'POST',
    handler: (params) => {
      markdownFiles[params.file] = params.content;
      return ok({}, '保存成功');
    },
  },

  // ========== AirTeams ==========
  {
    url: '/api/studio/config',
    method: 'GET',
    handler: () => ok({
      agents: {list: agentList},
      _meta: {openclawWorkspace: '/workspace/openclaw'},
    }),
  },
  {
    url: '/api/studio/agent/create',
    method: 'POST',
    handler: (params) => {
      const agent = {id: params.id, name: params?.identity?.name || params.id, emoji: params?.identity?.emoji || '🤖'};
      agentList.push(agent);
      return ok(agent);
    },
  },
  {
    url: '/api/studio/agent/delete',
    method: 'POST',
    handler: (params) => {
      agentList = agentList.filter((a) => a.id !== params.id);
      return ok({}, '删除成功');
    },
  },

  // ========== 定时任务 ==========
  {
    url: '/api/studio/cron/list',
    method: 'POST',
    handler: () => ok(cronList),
  },
  {
    url: '/api/studio/cron/create',
    method: 'POST',
    handler: (params) => {
      const cron = {id: 'cron_' + Date.now(), ...params};
      cronList.push(cron);
      return ok(cron);
    },
  },
  {
    url: '/api/studio/cron/update',
    method: 'POST',
    handler: (params) => {
      const idx = cronList.findIndex((c) => c.id === params.id);
      if (idx >= 0) cronList[idx] = {...cronList[idx], ...params};
      return ok(cronList[idx]);
    },
  },
  {
    url: '/api/studio/cron/delete',
    method: 'POST',
    handler: (params) => {
      cronList = cronList.filter((c) => c.id !== params.id);
      return ok({}, '删除成功');
    },
  },
];
