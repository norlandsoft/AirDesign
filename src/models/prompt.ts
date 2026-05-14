import {POST} from '@/utils/HttpRequest';
import {LangPromptQueryRequest, LangPromptResponse, LangPromptUpdateRequest,} from '@/types/prompt';

/**
 * 提示词管理 Model
 * 仅支持列表、单条查询与内容更新，不支持新增、删除
 *
 * @author ChaiMingXu
 */
export default {
  namespace: 'prompt',

  state: {
    promptList: [] as LangPromptResponse[],
    loading: false,
  },

  reducers: {
    setPromptList(_, {payload}: { payload: LangPromptResponse[] }) {
      return {promptList: payload || [], loading: false};
    },
  },

  effects: {
    * fetchList(
        {payload, callback}: { payload?: LangPromptQueryRequest; callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/prompt/list', payload || {});
      if (resp?.success) {
        const list: LangPromptResponse[] = resp.data || [];
        yield put({type: 'setPromptList', payload: list});
      }
      if (callback) callback(resp);
    },

    * update(
        {payload, callback}: { payload: LangPromptUpdateRequest; callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp = yield call(POST, '/rest/lang/prompt/update', payload);
      if (resp?.success) {
        yield put({type: 'fetchList', payload: {}});
      }
      if (callback) callback(resp);
    },

    * get(
        {payload, callback}: { payload: LangPromptQueryRequest; callback?: (resp: any) => void },
        {call}
    ) {
      const resp = yield call(POST, '/rest/lang/prompt/get', payload);
      if (callback) callback(resp);
    },
  },
};
