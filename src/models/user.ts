import {POST} from '@/utils/HttpRequest';
import {error} from 'air-design';
import {SHA} from '@/utils/CryptoUtils';
import {
  AdminPasswordChangeRequest,
  LoginResponse,
  UserCreateRequest,
  UserLoginRequest,
  UserQueryRequest,
  UserResponse,
  UserUpdateRequest
} from '@/types/user';
import {UserSettingsResponse, UserSettingsUpdateRequest} from '@/types/userSettings';

/**
 * 用户Model
 *
 * 管理用户相关的状态和业务逻辑，包括登录、登出、获取用户信息等
 *
 * @author AirDirector Team
 */
export default {
  namespace: 'user',

  state: {
    currentUser: null as UserResponse | null,
    isAuthenticated: !!sessionStorage.getItem('air-machine-token'),
    loading: false,
    userList: [] as UserResponse[], // 用户列表
    validatingToken: false, // token验证中标志，防止重复调用
    userSettings: null as UserSettingsResponse | null, // 用户设置
    userSettingsLoading: false, // 用户设置加载状态
    userListPagination: null as any, // 用户列表分页信息
  },

  effects: {
    /**
     * 用户登录
     *
     * 调用后端登录接口，返回ActionResponse对象
     * 首先判断success字段，如果为true则获取data数据，否则登录失败
     */
    * login({payload}: { payload: UserLoginRequest }, {call, put}) {

      const {id, password} = payload;
      const newPassword = SHA(password);

      const loginDTO: UserLoginRequest = {
        id: id,
        password: newPassword
      };

      // admin 走网关 /admin/user/login，其余走平台 /rest/platform/user/login
      const isAdmin = id?.toLowerCase?.() === 'admin';
      const loginUrl = isAdmin ? '/admin/user/login' : '/rest/platform/user/login';
      const resp = yield POST(loginUrl, loginDTO);

      if (resp?.success) {
        const data: LoginResponse = resp.data || {};
        const token = data.token || '';
        const user: UserResponse = data.user || data || null;

        if (token) {
          sessionStorage.setItem('air-machine-token', token);
        }

        if (user && user.id) {
          sessionStorage.setItem('air-machine-user', String(user.id));
        }

        yield put({
          type: 'setUser',
          payload: user,
        });

        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: {authenticated: true},
        }));
      } else {
        error({
          title: '登录失败',
          message: resp?.message || '登录失败，请检查用户名和密码'
        });
      }
    },

    /**
     * 用户登出
     *
     * 清除所有sessionStorage数据，清除用户状态，重置当前页面，触发登出事件
     */
    * logout(_, {put}) {
      // 清除所有sessionStorage数据
      sessionStorage.clear();

      // 清除用户状态
      yield put({
        type: 'clearUser',
      });

      // 重置当前页面为默认首页
      yield put({
        type: 'global/resetCurrentPage',
      });

      // 触发认证状态更新事件
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: {authenticated: false},
      }));
    },

    /**
     * 验证token有效性
     *
     * 调用后端current接口验证token，同时获取当前用户信息
     * 如果验证成功，更新currentUser状态
     * 如果验证失败，清除用户信息
     *
     * 使用validatingToken标志防止重复调用，避免死循环
     * 优化：减少状态检查和事件触发，避免不必要的更新
     */
    * validateToken(_, {call, put, select}) {
      // 检查是否正在验证中，防止重复调用
      const currentState = yield select((state: any) => state.user);
      if (currentState.validatingToken) {
        return;
      }

      const token = sessionStorage.getItem('air-machine-token');
      const userId = sessionStorage.getItem('air-machine-user');

      // 如果token或userId不存在，清除用户信息
      if (!token || !userId) {
        if (currentState.isAuthenticated) {
          yield put({
            type: 'clearUser',
          });
          // 状态从已认证变为未认证，触发事件
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: {authenticated: false},
          }));
        }
        return;
      }

      // 设置验证中标志
      yield put({
        type: 'setValidatingToken',
        payload: true,
      });

      try {
        // 调用current接口验证token并获取用户信息
        const resp = yield call(POST, '/rest/user/session/current', {});

        if (resp?.success) {
          // 验证成功，更新用户信息
          const user: UserResponse = resp.data || null;

          if (user && user.id) {
            // 确保sessionStorage中的userId与返回的用户ID一致
            sessionStorage.setItem('air-machine-user', String(user.id));
          }

          // 检查用户信息是否发生变化（在更新前检查，避免重复select）
          const wasAuthenticated = currentState.isAuthenticated;
          const userChanged = !currentState.currentUser ||
              !currentState.currentUser.id ||
              currentState.currentUser.id !== user.id;

          yield put({
            type: 'setUser',
            payload: user,
          });

          // 只有在用户信息发生变化或之前未认证时才触发事件
          // 避免在用户信息未变化时重复触发事件
          if (userChanged || !wasAuthenticated) {
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
              detail: {authenticated: true},
            }));
          }
        } else {
          // 验证失败，清除用户信息
          const wasAuthenticated = currentState.isAuthenticated;

          sessionStorage.removeItem('air-machine-token');
          sessionStorage.removeItem('air-machine-user');

          if (wasAuthenticated) {
            yield put({
              type: 'clearUser',
            });

            // 只有在之前已认证时才触发事件
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
              detail: {authenticated: false},
            }));
          }
        }
      } finally {
        // 清除验证中标志
        yield put({
          type: 'setValidatingToken',
          payload: false,
        });
      }
    },

    /**
     * 获取用户信息
     */
    * getUserInfo({payload}: { payload?: UserQueryRequest }, {call, put}) {
      const queryDTO: UserQueryRequest = payload || {};
      const resp = yield call(POST, '/rest/platform/user/info', queryDTO);

      if (resp?.success) {
        const user: UserResponse = resp.data || null;
        yield put({
          type: 'setUser',
          payload: user,
        });
      }
    },

    /**
     * 获取用户列表
     *
     * 调用后端接口获取所有用户列表
     */
    * fetchUsers({payload, callback}: { payload?: UserQueryRequest, callback?: (resp: any) => void }, {call, put}) {
      const resp = yield call(POST, '/rest/platform/user/list', payload || {});

      if (resp?.success) {
        // 检查响应是否包含分页信息
        if (resp.data && typeof resp.data === 'object' && 'list' in resp.data) {
          // 有分页信息的情况
          const userList: UserResponse[] = resp.data.list || [];
          const pagination = resp.data.pagination || null;
          yield put({
            type: 'setUserList',
            payload: userList,
          });
          yield put({
            type: 'setUserListPagination',
            payload: pagination,
          });
        } else {
          // 没有分页信息的情况（兼容旧接口）
          const userList: UserResponse[] = resp.data || [];
          yield put({
            type: 'setUserList',
            payload: userList,
          });
          yield put({
            type: 'setUserListPagination',
            payload: null,
          });
        }
      }
      if (callback) callback(resp);
    },

    /**
     * 创建用户
     *
     * 调用后端接口创建新用户
     * 如果提供了密码，需要先进行SHA256加密
     */
    * createUser({payload, callback}: { payload: UserCreateRequest, callback?: (resp: any) => void }, {call}) {
      // 如果提供了密码，先进行SHA256加密（第一次加密）
      const createDTO: UserCreateRequest = {...payload};
      if (createDTO.password && createDTO.password.trim()) {
        createDTO.password = SHA(createDTO.password);
      }

      const resp = yield call(POST, '/rest/platform/user/create', createDTO);
      if (callback) callback(resp);
    },

    /**
     * 更新用户信息
     *
     * 调用后端接口更新用户信息
     * 如果提供了密码，需要先进行SHA256加密
     */
    * updateUser({payload, callback}: { payload: UserUpdateRequest, callback?: (resp: any) => void }, {call}) {
      // 如果提供了密码，先进行SHA256加密（第一次加密）
      const updateDTO: UserUpdateRequest = {...payload};
      if (updateDTO.password && updateDTO.password.trim()) {
        updateDTO.password = SHA(updateDTO.password);
      }

      const resp = yield call(POST, '/rest/platform/user/update', updateDTO);
      if (callback) callback(resp);
    },

    /**
     * 删除用户
     *
     * 调用后端接口删除用户
     */
    * deleteUser({payload, callback}: { payload: UserQueryRequest, callback?: (resp: any) => void }, {call}) {
      const resp = yield call(POST, '/rest/platform/user/delete', payload);
      if (callback) callback(resp);
    },

    /**
     * 重置用户密码
     *
     * 调用后端接口将用户密码重置为默认密码 123456
     */
    * resetPassword({payload, callback}: { payload: UserQueryRequest, callback?: (resp: any) => void }, {call}) {
      const resp = yield call(POST, '/rest/platform/user/resetPassword', payload);
      if (callback) callback(resp);
    },

    /**
     * 修改 admin 用户密码
     *
     * 调用后端接口修改 admin 用户密码
     * admin 用户的密码存储在嵌入式数据库中，不存储在普通数据库
     * 如果提供了密码，需要先进行SHA256加密
     */
    * changeAdminPassword({payload, callback}: {
      payload: AdminPasswordChangeRequest,
      callback?: (resp: any) => void
    }, {call}) {
      // 如果提供了密码，先进行SHA256加密（第一次加密）
      const changeDTO: AdminPasswordChangeRequest = {...payload};
      if (changeDTO.password && changeDTO.password.trim()) {
        changeDTO.password = SHA(changeDTO.password);
      }

      const resp = yield call(POST, '/admin/user/changePassword', changeDTO);
      if (callback) callback(resp);
    },

    /**
     * 获取用户设置
     *
     * 调用后端接口获取用户的个性化设置
     * 如果用户设置不存在，后端会返回默认设置
     *
     * @param payload 包含userId的请求对象
     * @param callback 回调函数（可选）
     */
    * fetchUserSettings({payload, callback}: { payload: { userId: string }, callback?: (resp: any) => void }, {
      call,
      put
    }) {
      yield put({type: 'setUserSettingsLoading', payload: true});
      const resp = yield call(POST, '/rest/platform/user/settings/get', payload);
      if (resp?.success) {
        const userSettings: UserSettingsResponse = resp.data || null;
        yield put({type: 'setUserSettings', payload: userSettings});
      }
      yield put({type: 'setUserSettingsLoading', payload: false});
      if (callback) callback(resp);
    },

    /**
     * 更新用户设置
     *
     * 调用后端接口保存或更新用户的个性化设置
     *
     * @param payload 用户设置更新请求，包含userId和displaySettings
     * @param callback 回调函数（可选）
     */
    * updateUserSettings({payload, callback}: {
      payload: UserSettingsUpdateRequest,
      callback?: (resp: any) => void
    }, {call, put}) {
      yield put({type: 'setUserSettingsLoading', payload: true});
      const resp = yield call(POST, '/rest/platform/user/settings/update', payload);
      if (resp?.success) {
        const userSettings: UserSettingsResponse = resp.data || null;
        yield put({type: 'setUserSettings', payload: userSettings});
      }
      yield put({type: 'setUserSettingsLoading', payload: false});
      if (callback) callback(resp);
    },
  },

  reducers: {
    /**
     * 设置用户信息
     */
    setUser(state, {payload}) {
      // isAuthenticated 基于 sessionStorage 中的 token 来判断
      const token = sessionStorage.getItem('air-machine-token');
      return {
        ...state,
        currentUser: payload,
        isAuthenticated: !!token,
      };
    },

    /**
     * 设置token
     *
     * token保存在sessionStorage中，不保存在state中
     * 此方法仅用于更新isAuthenticated状态
     */
    setToken(state, {payload}) {
      // token保存在sessionStorage中，不保存在state中
      // 仅更新isAuthenticated状态
      return {
        ...state,
        isAuthenticated: !!payload,
      };
    },

    /**
     * 清除用户信息
     */
    clearUser(state) {
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
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

    /**
     * 设置用户列表
     */
    setUserList(state, {payload}) {
      return {
        ...state,
        userList: payload || [],
      };
    },

    /**
     * 设置token验证中标志
     */
    setValidatingToken(state, {payload}) {
      return {
        ...state,
        validatingToken: payload,
      };
    },

    /**
     * 设置用户设置
     */
    setUserSettings(state, {payload}) {
      return {
        ...state,
        userSettings: payload,
      };
    },

    /**
     * 设置用户设置加载状态
     */
    setUserSettingsLoading(state, {payload}) {
      return {
        ...state,
        userSettingsLoading: payload,
      };
    },

    /**
     * 设置用户列表分页信息
     */
    setUserListPagination(state, {payload}) {
      return {
        ...state,
        userListPagination: payload,
      };
    },
  },
};
