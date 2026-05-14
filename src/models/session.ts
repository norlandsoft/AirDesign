interface ChatUISettingsProps {
  showTopics: boolean;
}

export default {
  namespace: 'session',
  state: {
    chatUISettings: {
      showTopics: false
    } as ChatUISettingsProps
  },
  effects: {},
  reducers: {
    saveChatUISettings(state: any, {payload}: any) {
      return {
        ...state,
        chatUISettings: payload
      };
    }
  }
}