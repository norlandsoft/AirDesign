import {GET, POST} from '@/utils/HttpRequest';
import {
  OpenClawConfigResponse,
  OpenClawConfigSaveRequest,
} from '@/types/paas';

/**
 * OpenClaw Model
 *
 * 管理 OpenClaw 智能体平台相关的状态和业务逻辑，包括智能体管理、模型管理、
 * Markdown 文件操作、配置管理等。从 platform model 中拆分而来，实现关注点分离。
 *
 * Created by ChaiMingXu, on 2026/5/1
 */
export default {
  namespace: 'openclaw',

  state: {
    /** OpenClaw 工作目录（绝对路径） */
    openclawWorkspace: '' as string,
    /** OpenClaw 智能体列表（含 id/name/emoji/workspace/description/systemPrompt） */
    openclawAgentList: [] as any[],
    /** 可用模型选项（用于下拉选择） */
    availableModels: [] as any[],
    /** 主模型标识 */
    primaryModel: '' as string,
    /** 备用模型列表 */
    fallbackModels: [] as string[],
    /** 工作区模型列表（已添加到 openclaw.json 的模型） */
    workspaceModels: [] as any[],
  },

  effects: {
    // ==================== 配置管理 ====================

    /**
     * 获取 OpenClaw 配置（POST /admin/paas/openclaw/get）
     */
    * fetchOpenClawConfig({callback}: { callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/openclaw/get', {});
        if (resp?.success) {
          const data: OpenClawConfigResponse = resp.data || {};
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          const message = resp?.message || '获取 OpenClaw 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 OpenClaw 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 OpenClaw 配置（POST /admin/paas/openclaw/save）
     */
    * saveOpenClawConfig({payload, callback}: {
      payload: OpenClawConfigSaveRequest,
      callback?: (resp: any) => void
    }, {call}) {
      try {
        const resp = yield call(POST, '/admin/paas/openclaw/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          const message = resp?.message || '保存 OpenClaw 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '保存 OpenClaw 配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== 智能体管理 ====================

    /**
     * 获取 OpenClaw 智能体列表（POST /api/openclaw/agents/list）
     */
    * fetchOpenclawAgents({callback}: { callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/agents/list', {});
        if (resp?.success) {
          const list = resp.data || [];
          yield put({type: 'setOpenclawAgentList', payload: list});
          if (callback) callback({success: true, data: list});
          return {success: true, data: list};
        } else {
          if (callback) callback({success: false, message: resp?.message || '获取智能体列表失败'});
          return {success: false, message: resp?.message || '获取智能体列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取智能体列表失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 创建 OpenClaw 智能体（POST /api/openclaw/agents/create）
     */
    * createOpenclawAgent({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/agents/create', payload);
        if (resp?.success) {
          yield put({type: 'fetchOpenclawAgents'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '创建智能体失败'});
          return {success: false, message: resp?.message || '创建智能体失败'};
        }
      } catch (err: any) {
        const message = err?.message || '创建智能体失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 更新 OpenClaw 智能体（POST /api/openclaw/agents/update）
     */
    * updateOpenclawAgent({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/agents/update', payload);
        if (resp?.success) {
          yield put({type: 'fetchOpenclawAgents'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '更新智能体失败'});
          return {success: false, message: resp?.message || '更新智能体失败'};
        }
      } catch (err: any) {
        const message = err?.message || '更新智能体失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 删除 OpenClaw 智能体（POST /api/openclaw/agents/delete）
     */
    * deleteOpenclawAgent({payload, callback}: { payload: { agentId: string }, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/agents/delete', payload);
        if (resp?.success) {
          yield put({type: 'fetchOpenclawAgents'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '删除智能体失败'});
          return {success: false, message: resp?.message || '删除智能体失败'};
        }
      } catch (err: any) {
        const message = err?.message || '删除智能体失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== 模型管理 ====================

    /**
     * 获取可用模型选项（POST /api/openclaw/models/options）
     */
    * fetchModelOptions({callback}: { callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/models/options', {});
        if (resp?.success) {
          const models = resp.data || [];
          yield put({type: 'setAvailableModels', payload: models});
          if (callback) callback({success: true, data: models});
          return {success: true, data: models};
        } else {
          if (callback) callback({success: false, message: resp?.message || '获取模型选项失败'});
          return {success: false, message: resp?.message || '获取模型选项失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取模型选项失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取主/备模型默认配置（POST /api/openclaw/models/defaults/get）
     */
    * fetchModelDefaults({callback}: { callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/models/defaults/get', {});
        if (resp?.success) {
          const data = resp.data || {};
          yield put({type: 'setPrimaryModel', payload: data.primary || ''});
          yield put({type: 'setFallbackModels', payload: data.fallbacks || []});
          if (callback) callback({success: true, data});
          return {success: true, data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '获取模型默认配置失败'});
          return {success: false, message: resp?.message || '获取模型默认配置失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取模型默认配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 设置主/备模型默认配置（POST /api/openclaw/models/defaults/set）
     */
    * setModelDefaults({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/models/defaults/set', payload);
        if (resp?.success) {
          // 设置成功后重新获取最新值，更新 DVA 状态使 Select 组件同步显示
          yield put({type: 'fetchModelDefaults'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '设置模型默认配置失败'});
          return {success: false, message: resp?.message || '设置模型默认配置失败'};
        }
      } catch (err: any) {
        const message = err?.message || '设置模型默认配置失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 获取工作区模型列表（POST /api/openclaw/models/list）
     */
    * fetchWorkspaceModels({callback}: { callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/models/list', {});
        if (resp?.success) {
          const models = resp.data || [];
          yield put({type: 'setWorkspaceModels', payload: models});
          if (callback) callback({success: true, data: models});
          return {success: true, data: models};
        } else {
          if (callback) callback({success: false, message: resp?.message || '获取工作区模型列表失败'});
          return {success: false, message: resp?.message || '获取工作区模型列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取工作区模型列表失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 添加模型到工作区（POST /api/openclaw/models/add）
     */
    * addWorkspaceModel({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/models/add', payload);
        if (resp?.success) {
          yield put({type: 'fetchWorkspaceModels'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '添加模型失败'});
          return {success: false, message: resp?.message || '添加模型失败'};
        }
      } catch (err: any) {
        const message = err?.message || '添加模型失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 从工作区移除模型（POST /api/openclaw/models/remove）
     */
    * removeWorkspaceModel({payload, callback}: { payload: { provider: string; modelId: string }, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/openclaw/models/remove', payload);
        if (resp?.success) {
          yield put({type: 'fetchWorkspaceModels'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '移除模型失败'});
          return {success: false, message: resp?.message || '移除模型失败'};
        }
      } catch (err: any) {
        const message = err?.message || '移除模型失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== Markdown 文件操作 ====================

    /**
     * 读取 workspace 文件内容（POST /api/openclaw/markdown/get）
     */
    * markdownGet({payload, callback}: { payload: { agentId?: string; file: string }, callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/api/openclaw/markdown/get', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '读取文件失败'});
          return {success: false, message: resp?.message || '读取文件失败'};
        }
      } catch (err: any) {
        const message = err?.message || '读取文件失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 保存 workspace 文件内容（POST /api/openclaw/markdown/save）
     */
    * markdownSave({payload, callback}: { payload: { agentId?: string; file: string; content: string }, callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/api/openclaw/markdown/save', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '保存文件失败'});
          return {success: false, message: resp?.message || '保存文件失败'};
        }
      } catch (err: any) {
        const message = err?.message || '保存文件失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== AirTeams 配置 ====================

    /**
     * 获取 AirTeams 中 OpenClaw 智能体配置（GET /api/studio/config，从 openclaw.json 解析 agents.list）
     */
    * fetchAirTeamsConfig({callback}: { callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(GET, '/api/studio/config');
        if (resp?.success && resp?.data) {
          const list = (resp.data?.agents?.list || []) as any[];
          const openclawWorkspace = resp.data?._meta?.openclawWorkspace || '';
          yield put({type: 'setOpenclawAgentList', payload: list});
          yield put({type: 'setOpenclawWorkspace', payload: openclawWorkspace});
          if (callback) callback({success: true, data: list, openclawConfig: resp.data});
          return {success: true, data: list, openclawConfig: resp.data};
        } else {
          const message = resp?.message || '获取 AirTeams 配置失败';
          if (callback) callback({success: false, message});
          return {success: false, message};
        }
      } catch (err: any) {
        const message = err?.message || '获取 AirTeams 配置失败，请确认 AirTeams 服务已启动';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== AirTeams 智能体操作 ====================

    /**
     * 创建智能体（调用 AirTeams POST /api/studio/agent/create）
     * 创建后自动同步到 openclaw.json 并重启网关，然后刷新智能体列表
     */
    * createAgent({payload, callback}: {
      payload: { id: string; name?: string; identity?: { name?: string; emoji?: string } },
      callback?: (resp: any) => void
    }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/studio/agent/create', payload);
        if (resp?.success) {
          yield put({type: 'fetchAirTeamsConfig'});
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '创建智能体失败'});
          return {success: false, message: resp?.message || '创建智能体失败'};
        }
      } catch (err: any) {
        const message = err?.message || '创建智能体失败，请确认 AirTeams 服务已启动';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 删除智能体（调用 AirTeams POST /api/studio/agent/delete）
     * 同时删除 openclaw.json 中的配置和对应的工作目录，然后刷新智能体列表
     */
    * deleteAgent({payload, callback}: { payload: { id: string }, callback?: (resp: any) => void }, {call, put}) {
      try {
        const resp = yield call(POST, '/api/studio/agent/delete', payload);
        if (resp?.success) {
          yield put({type: 'fetchAirTeamsConfig'});
          if (callback) callback({success: true, data: resp.data, message: resp?.message});
          return {success: true, data: resp.data, message: resp?.message};
        } else {
          if (callback) callback({success: false, message: resp?.message || '删除智能体失败'});
          return {success: false, message: resp?.message || '删除智能体失败'};
        }
      } catch (err: any) {
        const message = err?.message || '删除智能体失败，请确认 AirTeams 服务已启动';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    // ==================== 定时任务 ====================

    /**
     * 获取定时任务列表（POST /api/studio/cron/list）
     */
    * cronList({payload, callback}: { payload?: any, callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/api/studio/cron/list', payload || {});
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '获取定时任务列表失败'});
          return {success: false, message: resp?.message || '获取定时任务列表失败'};
        }
      } catch (err: any) {
        const message = err?.message || '获取定时任务列表失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 创建定时任务（POST /api/studio/cron/create）
     */
    * cronCreate({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/api/studio/cron/create', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '创建定时任务失败'});
          return {success: false, message: resp?.message || '创建定时任务失败'};
        }
      } catch (err: any) {
        const message = err?.message || '创建定时任务失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 更新定时任务（POST /api/studio/cron/update）
     */
    * cronUpdate({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/api/studio/cron/update', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '更新定时任务失败'});
          return {success: false, message: resp?.message || '更新定时任务失败'};
        }
      } catch (err: any) {
        const message = err?.message || '更新定时任务失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },

    /**
     * 删除定时任务（POST /api/studio/cron/delete）
     */
    * cronDelete({payload, callback}: { payload: { id: string }, callback?: (resp: any) => void }, {call}) {
      try {
        const resp = yield call(POST, '/api/studio/cron/delete', payload);
        if (resp?.success) {
          if (callback) callback({success: true, data: resp.data});
          return {success: true, data: resp.data};
        } else {
          if (callback) callback({success: false, message: resp?.message || '删除定时任务失败'});
          return {success: false, message: resp?.message || '删除定时任务失败'};
        }
      } catch (err: any) {
        const message = err?.message || '删除定时任务失败';
        if (callback) callback({success: false, message});
        return {success: false, message};
      }
    },
  },

  reducers: {
    /**
     * 设置 OpenClaw 工作目录
     */
    setOpenclawWorkspace(state: any, {payload}: { payload: string }) {
      return {
        ...state,
        openclawWorkspace: payload || '',
      };
    },

    /**
     * 设置 OpenClaw 智能体列表
     */
    setOpenclawAgentList(state: any, {payload}: { payload: any[] }) {
      return {
        ...state,
        openclawAgentList: payload || [],
      };
    },

    /**
     * 设置可用模型选项
     */
    setAvailableModels(state: any, {payload}: { payload: any[] }) {
      return {
        ...state,
        availableModels: payload || [],
      };
    },

    /**
     * 设置主模型
     */
    setPrimaryModel(state: any, {payload}: { payload: string }) {
      return {
        ...state,
        primaryModel: payload || '',
      };
    },

    /**
     * 设置备用模型列表
     */
    setFallbackModels(state: any, {payload}: { payload: any[] }) {
      return {
        ...state,
        fallbackModels: payload || [],
      };
    },

    /**
     * 设置工作区模型列表
     */
    setWorkspaceModels(state: any, {payload}: { payload: any[] }) {
      return {
        ...state,
        workspaceModels: payload || [],
      };
    },
  },
};
