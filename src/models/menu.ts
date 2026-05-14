import {POST} from '@/utils/HttpRequest';
import {SysMenuQueryRequest, SysMenuResponse} from '@/types/menu';

/**
 * 系统菜单Model
 *
 * 管理菜单相关的状态和业务逻辑，包括获取菜单列表等
 *
 * @author ChaiMingXu, on 2026/1/1
 */
export default {
  namespace: 'menu',

  state: {
    menuList: [] as SysMenuResponse[],
  },

  effects: {
    /**
     * 获取菜单列表
     *
     * 调用后端菜单接口，返回ActionResponse对象
     * 首先判断success字段，如果为true则获取data数据，否则获取失败
     */
    * fetchMenuList({payload, callback}: { payload?: SysMenuQueryRequest, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      // admin 使用网关 /admin/menu，其余使用平台 /rest/platform/menu/list
      const userId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('air-machine-user') : null;
      const menuUrl = userId === 'admin' ? '/admin/menu' : '/rest/platform/menu/list';
      const resp = yield call(POST, menuUrl, {});
      if (resp && resp.success) {
        const menuList: SysMenuResponse[] = resp.data || [];
        yield put({
          type: 'setMenuList',
          payload: menuList
        });
      }
      if (callback) callback(resp);
    },
  },

  reducers: {
    /**
     * 设置菜单列表
     */
    setMenuList(state: any, {payload}: { payload: SysMenuResponse[] }) {
      return {
        ...state,
        menuList: payload || [],
      };
    },
  },
};

