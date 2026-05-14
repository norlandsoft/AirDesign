import {POST, SSE_POST} from "@/utils/HttpRequest";
import {randomString} from "@/utils/StringUtils";

export default {
  namespace: 'chat',
  state: {
    // topic
    topicList: [],
    currentTopic: null,

    // 对话列表
    chatList: [],
    lastContent: '',

    // 是否正在加载流式响应
    loading: false,

    // 聊天模式：quick-快速模式，expert-专家模式
    chatMode: 'quick'
  },

  effects: {
    // 发送问题
    * completion({payload, callback}: any, {call, put}: any) {
      // 保存问题到本地列表
      yield put({
        type: 'saveChatMessage',
        payload
      });

      // 发送问题
      const resp = yield POST('/rest/lang/chat/completion', payload);
      if (!resp.success) {
        // 保存错误信息
        yield put({
          type: 'saveChatMessage',
          payload: {
            id: randomString(12),
            role: 'assistant',
            content: '> 服务器故障，请稍后再试'
          }
        });
      }

      if (callback) {
        callback(resp);
      }
    },

    // SSE方式获取回复（POST方式）
    * streamCompletion({payload, callback}: any, {}: any) {
      // 使用 POST 方式获取流式回复
      yield SSE_POST('/rest/lang/completion', payload, callback);
    },

    // 获取当前topic下的聊天记录历史
    * fetchChatList({payload}: any, {call, put}: any) {
      const resp = yield POST('/rest/lang/chat/list', payload);
      if (resp.success) {
        yield put({
          type: 'saveChatMessageList',
          payload: resp.data
        });
      }
    },

    // 获取话题列表
    * fetchTopicList(_: any, {call, put}: any) {
      const resp = yield POST('/rest/lang/topic/list', {});
      if (resp.success) {
        yield put({
          type: 'saveTopicList',
          payload: resp.data
        });
      }
    },

    // 创建话题
    * createTopic({payload, callback}: any, {put}: any) {
      const resp = yield POST('/rest/lang/topic/create', payload || {});
      if (callback) callback(resp);
    },

    // 更新话题
    * updateTopicInfo({payload, callback}: any, _) {
      const resp = yield POST('/rest/lang/topic/update', payload);
      if (callback) callback(resp);
    },

    // 删除话题
    * deleteTopicInfo({payload, callback}: any, {put}: any) {
      const resp = yield POST('/rest/lang/topic/delete', payload);
      if (callback) callback(resp);
      yield put({
        type: 'clearTopic'
      });
    },

    // 下载话题
    * exportTopic({payload, callback}: any, _) {
      const resp = yield POST('/rest/lang/topic/export', payload);
      if (callback) callback(resp);
    },

    // 上传文件
    * addDocs({payload, callback}: any, _) {
      const resp = yield POST('/rest/lang/chat/docs/save', payload);
      if (callback) callback(resp);
    },

    // 获取聊天文档
    * fetchDocs({payload, callback}: any, _) {
      const resp = yield POST('/rest/lang/chat/docs/list', payload);
      if (callback) callback(resp);
    },

    // 删除聊天文档
    * deleteDoc({payload, callback}: any, _) {
      const resp = yield POST('/rest/lang/chat/docs/delete', payload);
      if (callback) callback(resp);
    },

    // 获取聊天设置
    * fetchChatSetting({_, callback}: any, {}) {
      const resp = yield POST('/rest/lang/chat/setting/info', {});
      if (resp.success) {
        callback(resp.data);
      }
    },

    // 保存聊天设置
    * saveChatSetting({payload, callback}: any, {put}: any) {
      const resp = yield POST('/rest/lang/chat/setting/save', payload);
      if (callback) callback(resp);
    },

    // 获取模型设置
    * fetchModelSetting({payload, callback}, _) {
      const resp = yield POST("/rest/lang/chat/setting/model/info", payload);
      if (callback) callback(resp);
    },

    // 保存模型设置
    * saveModelSetting({payload, callback}, _) {
      const resp = yield POST("/rest/lang/chat/setting/model/save", payload);
      if (callback) callback(resp);
    }
  },
  reducers: {
    // 保存聊天内容
    saveChatMessage(state: any, {payload}: any) {
      return {
        ...state,
        chatList: [...state.chatList, payload]
      }
    },

    // 保存聊天内容列表
    saveChatMessageList(state: any, {payload}: any) {
      return {
        ...state,
        chatList: payload
      }
    },
    // 对话结束后将临时存储的最后一次回复内容保存到 chatList 中
    // payload可以是字符串（id）或对象（包含id和可选的content）
    saveLastChatMessage(state: any, {payload}: any) {
      // 获取要保存的内容
      let contentToSave: string;

      if (typeof payload === 'object' && payload !== null && payload.content !== undefined) {
        // payload是对象且提供了content，使用提供的content
        contentToSave = payload.content;
      } else {
        // 使用state.lastContent
        contentToSave = state.lastContent || '';
      }

      // 如果内容为空（null、undefined或空字符串），不保存消息，避免创建空消息气泡
      // 注意：只检查长度，不使用trim()，因为空格也是内容的一部分（如markdown格式中的缩进）
      if (!contentToSave || contentToSave.length === 0) {
        return {
          ...state,
          lastContent: '',
          loading: false
        };
      }

      // 构建消息对象
      // 注意：完全保留原始内容，不做任何trim或replace操作，确保markdown格式正确
      let resp: any;
      if (typeof payload === 'string') {
        // payload是字符串，使用作为id
        resp = {
          id: payload,
          role: 'assistant',
          content: contentToSave  // 完全保留原始内容，包括所有空格
        }
      } else if (typeof payload === 'object' && payload !== null) {
        // payload是对象，使用对象中的id（如果提供）
        resp = {
          id: payload.id || randomString(12),
          role: 'assistant',
          content: contentToSave  // 完全保留原始内容，包括所有空格
        }
      } else {
        // payload格式不正确，使用默认值
        resp = {
          id: randomString(12),
          role: 'assistant',
          content: contentToSave  // 完全保留原始内容，包括所有空格
        }
      }

      return {
        ...state,
        chatList: [...state.chatList, resp],
        lastContent: '',
        loading: false
      }
    },
    // 更新临时存储的最后一次回复内容
    // 如果payload为空字符串，则清空lastContent；否则追加内容
    updateLastContent(state: any, {payload}: any) {
      if (payload === '') {
        // 清空lastContent，开始加载
        return {
          ...state,
          lastContent: '',
          loading: true
        };
      }

      // 追加内容，确保 loading 状态为 true
      // 注意：完全保留payload中的空格和换行符，不做任何处理
      const newLastContent = state.lastContent + payload;

      return {
        ...state,
        lastContent: newLastContent,
        loading: true
      }
    },
    saveCurrentTopic(state: any, {payload}: any) {
      return {
        ...state,
        currentTopic: payload
      }
    },
    // 清空当前话题, 开始新的聊天话题
    clearTopic(state: any, _: any) {
      return {
        ...state,
        currentTopic: null,
        chatList: []
      }
    },
    saveTopicList(state: any, {payload}: any) {
      return {
        ...state,
        topicList: payload
      }
    },

    // 设置加载状态
    setLoading(state: any, {payload}: any) {
      return {
        ...state,
        loading: payload
      }
    },

    // 设置聊天模式（quick/expert）
    saveChatMode(state: any, {payload}: any) {
      return {
        ...state,
        chatMode: payload
      }
    },

    // 更新话题列表中指定话题的标题（临时话题标题更新时使用）
    updateTopicTitle(state: any, {payload}: any) {
      const {topicId, title} = payload;
      return {
        ...state,
        topicList: state.topicList.map((item: any) =>
            item.id === topicId ? {...item, title} : item
        )
      }
    },

    // 替换超时占位消息为实际的 AI 回复内容
    replaceTimeoutMessage(state: any, {payload}: any) {
      const {timeoutMsgId, actualContent} = payload;
      return {
        ...state,
        chatList: state.chatList.map((msg: any) =>
            msg.id === timeoutMsgId
                ? {...msg, content: actualContent}
                : msg
        ),
        loading: false
      };
    },
  }
}
