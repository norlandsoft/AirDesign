import {POST} from '@/utils/HttpRequest';
import {
  LangModelCreateRequest,
  LangModelProviderResponse,
  LangModelQueryRequest,
  LangModelResponse,
  LangModelUpdateRequest,
} from '@/types/langModel';

/**
 * 语言模型Model
 *
 * 管理AI语言模型相关的状态和业务逻辑，包括模型的增删改查、启用禁用等。
 * 设计思路：Model 仅维护状态与接口调用，页面通过 dispatch 交互。
 *
 * @author ChaiMingXu
 * Created by ChaiMingXu, on 2026-02-08
 */
export default {
  namespace: 'llm',

  state: {
    // 模型列表
    modelList: [] as LangModelResponse[],
    // 供应商列表
    providerList: [] as LangModelProviderResponse[],
    // 加载状态
    loading: false as boolean,
  },

  effects: {
    /**
     * 获取模型列表
     */
    * fetchModels(
        {payload, callback}: { payload?: LangModelQueryRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/list', payload || {});

      if (resp?.success) {
        const modelList: LangModelResponse[] = resp.data || [];
        yield put({
          type: 'setModelList',
          payload: modelList,
        });
      }

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 获取启用的模型列表
     */
    * fetchActiveModels(
        {callback}: { callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/active', {});
      if (resp?.success) {
        const modelList: LangModelResponse[] = resp.data || [];
        yield put({
          type: 'setModelList',
          payload: modelList,
        });
        if (callback) {
          callback({success: true, data: modelList});
        }
      }
    },

    /**
     * 创建模型
     */
    * createModel(
        {payload, callback}: { payload: LangModelCreateRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/create', payload);

      // 刷新模型列表
      yield put({
        type: 'fetchModels',
        payload: {},
      });

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 更新模型
     */
    * updateModel(
        {payload, callback}: { payload: LangModelUpdateRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/update', payload);

      // 刷新模型列表
      yield put({
        type: 'fetchModels',
        payload: {},
      });

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 删除模型
     */
    * deleteModel(
        {payload, callback}: { payload: LangModelQueryRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/delete', payload);

      if (resp?.success) {
        // 刷新模型列表
        yield put({
          type: 'fetchModels',
          payload: {},
        });
      }

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 启用模型
     */
    * enableModel(
        {payload, callback}: { payload: LangModelQueryRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/enable', payload);

      if (resp?.success) {
        // 刷新模型列表
        yield put({
          type: 'fetchModels',
          payload: {},
        });
      }

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 禁用模型
     */
    * disableModel(
        {payload, callback}: { payload: LangModelQueryRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/disable', payload);

      if (resp?.success) {
        // 刷新模型列表
        yield put({
          type: 'fetchModels',
          payload: {},
        });
      }

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 设置默认模型
     */
    * setDefaultModel(
        {payload, callback}: { payload: LangModelQueryRequest, callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/setDefault', payload);

      if (resp?.success) {
        // 刷新模型列表
        yield put({
          type: 'fetchModels',
          payload: {},
        });
      }

      if (callback) {
        callback(resp);
      }
    },

    /**
     * 获取供应商列表
     */
    * fetchSuppliers(
        {callback}: { callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/model/providers', {});
      if (resp?.success) {
        const providerList: LangModelProviderResponse[] = resp.data || [];
        yield put({
          type: 'setProviderList',
          payload: providerList,
        });
      }
      if (callback) callback(resp);
    },

  },

  reducers: {
    /**
     * 设置模型列表
     */
    setModelList(state, {payload}) {
      return {
        ...state,
        modelList: payload,
      };
    },

    /**
     * 设置供应商列表
     */
    setProviderList(state, {payload}) {
      return {
        ...state,
        providerList: payload,
      };
    },

    /**
     * 设置加载状态
     */
    setLoading(state, {payload}) {
      return {
        ...state,
        loading: payload,
      };
    },
  },
};

