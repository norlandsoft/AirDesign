/**
 * 聊天和 LLM 模块 mock handlers
 *
 * 模拟对话、话题、模型管理、提示词等接口
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {MockHandler, SSEMockHandler} from '../mockInterceptor';
import {ok, fail} from '../mockStore';

// 内存数据
let topicList: any[] = [
  {id: 'topic_1', title: '示例对话', createdAt: '2026-05-14 10:00:00', updatedAt: '2026-05-14 10:30:00'},
];
let chatMessages: Record<string, any[]> = {
  topic_1: [
    {id: 'msg_1', role: 'user', content: '你好，请介绍一下你自己'},
    {id: 'msg_2', role: 'assistant', content: '你好！我是 AirMachine 智能助手，这是一个 Mock 模式的示例回复。实际部署时，我会连接到大语言模型为您提供真实的 AI 对话服务。'},
  ],
};
let chatDocs: any[] = [];
let chatSettings: any = {};
let modelSettings: any = {};

// 模型列表
const mockModels = [
  {id: 'model_1', name: 'GPT-4o', provider: 'openai', enabled: true, isDefault: true},
  {id: 'model_2', name: 'Claude 3.5 Sonnet', provider: 'anthropic', enabled: true, isDefault: false},
  {id: 'model_3', name: 'DeepSeek V3', provider: 'deepseek', enabled: true, isDefault: false},
  {id: 'model_4', name: 'Qwen-Max', provider: 'aliyun', enabled: false, isDefault: false},
];

const mockProviders = [
  {id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com'},
  {id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com'},
  {id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com'},
  {id: 'aliyun', name: '阿里云', baseUrl: 'https://dashscope.aliyuncs.com'},
];

// 提示词列表
const mockPrompts = [
  {id: 'prompt_1', name: '通用助手', content: '你是一个友好的AI助手，请用中文回答问题。', category: 'system', isDefault: true},
  {id: 'prompt_2', name: '代码助手', content: '你是一个专业的编程助手，精通多种编程语言。', category: 'system', isDefault: false},
  {id: 'prompt_3', name: '翻译助手', content: '你是一个翻译助手，帮助用户进行中英文互译。', category: 'system', isDefault: false},
];

export const chatHandlers: MockHandler[] = [
  // ========== 聊天 ==========
  {
    url: '/rest/lang/chat/completion',
    method: 'POST',
    handler: (params) => {
      return ok({
        id: 'resp_' + Date.now(),
        role: 'assistant',
        content: `[Mock 回复] 收到您的问题："${params?.content?.substring(0, 50) || ''}"。这是 Mock 模式下的模拟回复。`,
      });
    },
  },
  {
    url: '/rest/lang/chat/list',
    method: 'POST',
    handler: (params) => ok(chatMessages[params?.topicId || 'topic_1'] || []),
  },
  {
    url: '/rest/lang/chat/docs/save',
    method: 'POST',
    handler: (params) => {
      chatDocs.push({...params, id: 'doc_' + Date.now()});
      return ok({}, '上传成功');
    },
  },
  {
    url: '/rest/lang/chat/docs/list',
    method: 'POST',
    handler: () => ok(chatDocs),
  },
  {
    url: '/rest/lang/chat/docs/delete',
    method: 'POST',
    handler: (params) => {
      chatDocs = chatDocs.filter((d) => d.id !== params.id);
      return ok({}, '删除成功');
    },
  },
  // ========== 聊天设置 ==========
  {
    url: '/rest/lang/chat/setting/info',
    method: 'POST',
    handler: () => ok(chatSettings),
  },
  {
    url: '/rest/lang/chat/setting/save',
    method: 'POST',
    handler: (params) => {
      chatSettings = {...chatSettings, ...params};
      return ok(chatSettings);
    },
  },
  {
    url: '/rest/lang/chat/setting/model/info',
    method: 'POST',
    handler: (params) => ok(modelSettings),
  },
  {
    url: '/rest/lang/chat/setting/model/save',
    method: 'POST',
    handler: (params) => {
      modelSettings = {...modelSettings, ...params};
      return ok(modelSettings);
    },
  },
  // ========== 话题 ==========
  {
    url: '/rest/lang/topic/list',
    method: 'POST',
    handler: () => ok(topicList),
  },
  {
    url: '/rest/lang/topic/create',
    method: 'POST',
    handler: (params) => {
      const topic = {id: 'topic_' + Date.now(), title: params?.title || '新对话', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()};
      topicList.unshift(topic);
      chatMessages[topic.id] = [];
      return ok(topic);
    },
  },
  {
    url: '/rest/lang/topic/update',
    method: 'POST',
    handler: (params) => {
      const topic = topicList.find((t) => t.id === params.id);
      if (topic) Object.assign(topic, params);
      return ok(topic);
    },
  },
  {
    url: '/rest/lang/topic/delete',
    method: 'POST',
    handler: (params) => {
      topicList = topicList.filter((t) => t.id !== params.id);
      delete chatMessages[params.id];
      return ok({}, '删除成功');
    },
  },
  {
    url: '/rest/lang/topic/export',
    method: 'POST',
    handler: (params) => {
      const topic = topicList.find((t) => t.id === params.id);
      const messages = chatMessages[params.id] || [];
      return ok({topic, messages});
    },
  },
  // ========== 模型管理 ==========
  {
    url: '/rest/lang/model/list',
    method: 'POST',
    handler: () => ok(mockModels),
  },
  {
    url: '/rest/lang/model/active',
    method: 'POST',
    handler: () => ok(mockModels.filter((m) => m.enabled)),
  },
  {
    url: '/rest/lang/model/create',
    method: 'POST',
    handler: (params) => ok({...params, id: 'model_' + Date.now()}, '创建成功'),
  },
  {
    url: '/rest/lang/model/update',
    method: 'POST',
    handler: (params) => ok({...params}, '更新成功'),
  },
  {
    url: '/rest/lang/model/delete',
    method: 'POST',
    handler: () => ok({}, '删除成功'),
  },
  {
    url: '/rest/lang/model/enable',
    method: 'POST',
    handler: (params) => {
      const m = mockModels.find((m) => m.id === params.id);
      if (m) m.enabled = true;
      return ok({}, '已启用');
    },
  },
  {
    url: '/rest/lang/model/disable',
    method: 'POST',
    handler: (params) => {
      const m = mockModels.find((m) => m.id === params.id);
      if (m) m.enabled = false;
      return ok({}, '已禁用');
    },
  },
  {
    url: '/rest/lang/model/setDefault',
    method: 'POST',
    handler: (params) => {
      mockModels.forEach((m) => m.isDefault = m.id === params.id);
      return ok({}, '设置成功');
    },
  },
  {
    url: '/rest/lang/model/providers',
    method: 'POST',
    handler: () => ok(mockProviders),
  },
  // ========== 提示词 ==========
  {
    url: '/rest/lang/prompt/list',
    method: 'POST',
    handler: () => ok(mockPrompts),
  },
  {
    url: '/rest/lang/prompt/get',
    method: 'POST',
    handler: (params) => {
      const p = mockPrompts.find((p) => p.id === params.id);
      return p ? ok(p) : fail('未找到提示词');
    },
  },
  {
    url: '/rest/lang/prompt/update',
    method: 'POST',
    handler: (params) => {
      const p = mockPrompts.find((p) => p.id === params.id);
      if (p) Object.assign(p, params);
      return ok(p);
    },
  },
];

// SSE 流式回复 mock
export const chatSSEHandlers: SSEMockHandler[] = [
  {
    url: '/rest/lang/completion',
    handler: (params, url, callback, done) => {
      const mockReply = `这是 Mock 模式的流式回复。

您发送的内容是："${params?.content?.substring(0, 100) || ''}"

---

**注意**：当前为纯前端 Mock 模式，未连接实际大模型。

在真实环境中，此处将显示 AI 模型的实时流式输出。`;

      // 模拟逐字输出
      let index = 0;
      const interval = setInterval(() => {
        if (index < mockReply.length) {
          const chunkSize = Math.min(2, mockReply.length - index);
          callback(mockReply.substring(index, index + chunkSize));
          index += chunkSize;
        } else {
          clearInterval(interval);
          done();
        }
      }, 30);
    },
  },
];
