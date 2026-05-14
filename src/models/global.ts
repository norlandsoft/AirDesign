import {POST} from "@/utils/HttpRequest";

export default {
  namespace: 'global',
  state: {
    layoutSize: {
      headerHeight: 40,
      footerHeight: 0,
      menuWidth: 40
    },
    // 工作区框架尺寸
    frameSize: {
      width: 0,
      height: 0,
      slideHeight: 0
    },
    current: {
      page: 'menu_home',
      pageItem: '000000',
      module: '',
      moduleItem: '000000'
    },
    // 主页面工具栏，内容在页面中设置，为React对象
    tools: [] as any[],
    pagesWithTools: []
  },
  effects: {
    * fetchApplicationInfo({_, callback}: any, {}) {
      const resp = yield POST("/rest/framework/app/info", {});
      if (resp.success) {
        callback(resp.data);
      }
    }
  },
  reducers: {
    changeFrameSize(state: any, _: any) {
      const {current, pagesWithTools} = state;
      const toolsWidth = pagesWithTools.includes(current.page) ? 50 : 0;

      const frameWidth = window.innerWidth - state.layoutSize.menuWidth - toolsWidth;
      const frameHeight = window.innerHeight - state.layoutSize.headerHeight - state.layoutSize.footerHeight;
      const slideHeight = window.innerHeight - state.layoutSize.headerHeight;

      return {
        ...state,
        frameSize: {
          width: frameWidth,
          height: frameHeight,
          slideHeight: slideHeight,
        }
      }
    },

    // 在主菜单切换页面时，更新当前页面
    changeCurrentPage(state: any, {payload}: any) {
      return {
        ...state,
        current: {
          page: payload
        }
      }
    },

    // 重置当前页面为默认值（登出时使用）
    resetCurrentPage(state: any) {
      return {
        ...state,
        current: {
          page: 'menu_home',
          pageItem: '000000',
          module: '',
          moduleItem: '000000'
        }
      }
    },

    changeCurrentModule(state, {payload}) {
      return {
        ...state,
        current: {
          ...state.current,
          module: payload
        }
      }
    },

    // 设置主页面工具栏
    setToolbar(state: any, {payload}: any) {
      return {
        ...state,
        toolbar: payload
      }
    }
  },
};
