/**
 * 统一用户 Model
 *
 * admin 走 /admin/user/login，其余走 /api/v1/auth/login。
 * validateToken 统一走 /api/v1/auth/current（SDK 已处理双 token）。
 *
 * @author ChaiMingXu, 2026/05/27
 */
import { POST } from '../utils/HttpRequest';
import { Notice } from 'air-design';
import { SHA } from '../utils/CryptoUtils';
import type { UserLoginRequest, UserResponse, AdminPasswordChangeRequest } from '../types/user';
import { storageKey } from '../config';

export default {
  namespace: 'user',

  state: {
    currentUser: null as UserResponse | null,
    isAuthenticated: !!sessionStorage.getItem(storageKey('token')),
    loading: false,
    validatingToken: false,
    userSettings: null as any,
    userSettingsLoading: false,
  },

  effects: {
    * login({ payload }: { payload: UserLoginRequest }, { call, put }: any) {
      const { id, password } = payload;
      const newPassword = SHA(password);
      const loginDTO: UserLoginRequest = { id, password: newPassword };

      const isAdmin = id?.toLowerCase?.() === 'admin';
      const loginUrl = isAdmin ? '/admin/user/login' : '/api/v1/auth/login';
      const resp = yield POST(loginUrl, loginDTO);

      if (resp?.success) {
        const data = resp.data || {};
        const token = data.token || '';
        const user: UserResponse = data.user || data || null;

        if (token) sessionStorage.setItem(storageKey('token'), token);
        if (user?.id) sessionStorage.setItem(storageKey('uid'), String(user.id));
        if (user?.loginId) sessionStorage.setItem(storageKey('user'), String(user.loginId));

        yield put({ type: 'setUser', payload: user });
        window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: true } }));
      } else {
        Notice.error('登录失败', resp?.message || '登录失败，请检查用户名和密码');
      }
    },

    * logout(_: any, { put }: any) {
      sessionStorage.clear();
      yield put({ type: 'clearUser' });
      window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: false } }));
    },

    * validateToken(_: any, { call, put, select }: any) {
      const currentState = yield select((state: any) => state.user);
      if (currentState.validatingToken) return;

      const token = sessionStorage.getItem(storageKey('token'));
      if (!token) {
        if (currentState.isAuthenticated) {
          yield put({ type: 'clearUser' });
          window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: false } }));
        }
        return;
      }

      yield put({ type: 'setValidatingToken', payload: true });

      try {
        const resp = yield call(POST, '/api/v1/auth/current', {});
        if (resp?.success) {
          const user: UserResponse = resp.data || null;
          if (user?.id) sessionStorage.setItem(storageKey('uid'), String(user.id));
          if (user?.loginId) sessionStorage.setItem(storageKey('user'), String(user.loginId));

          const wasAuthenticated = currentState.isAuthenticated;
          const userChanged = !currentState.currentUser ||
              !currentState.currentUser.id ||
              currentState.currentUser.id !== user.id;

          yield put({ type: 'setUser', payload: user });
          if (userChanged || !wasAuthenticated) {
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: true } }));
          }
        } else {
          sessionStorage.removeItem(storageKey('token'));
          sessionStorage.removeItem(storageKey('user'));
          sessionStorage.removeItem(storageKey('uid'));
          if (currentState.isAuthenticated) {
            yield put({ type: 'clearUser' });
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: false } }));
          }
        }
      } finally {
        yield put({ type: 'setValidatingToken', payload: false });
      }
    },

    * changeAdminPassword({ payload, callback }: any, { call }: any) {
      const changeDTO = { ...payload };
      if (changeDTO.password?.trim()) {
        changeDTO.password = SHA(changeDTO.password);
      }
      const resp = yield call(POST, '/admin/user/changePassword', changeDTO);
      if (callback) callback(resp);
    },

    * updateUserInfo({ payload, callback }: any, { call, put }: any) {
      const resp = yield call(POST, '/api/v1/user/update', payload);
      if (callback) callback(resp);
      if (resp?.success) {
        yield put({ type: 'setUser', payload: resp.data });
      }
    },

    * fetchUserSettings({ payload }: any, { call, put }: any) {
      yield put({ type: 'setUserSettingsLoading', payload: true });
      try {
        const resp = yield call(POST, '/api/v1/user/settings/get', { userId: payload.userId });
        if (resp?.success) {
          yield put({ type: 'setUserSettings', payload: resp.data });
        }
      } finally {
        yield put({ type: 'setUserSettingsLoading', payload: false });
      }
    },

    * updateUserSettings({ payload, callback }: any, { call, put }: any) {
      const resp = yield call(POST, '/api/v1/user/settings/update', payload);
      if (callback) callback(resp);
      if (resp?.success) {
        yield put({ type: 'setUserSettings', payload: resp.data });
      }
    },

    * changePassword({ payload, callback }: any, { call, put }: any) {
      const changeDTO = { ...payload };
      if (changeDTO.password?.trim()) {
        changeDTO.password = SHA(changeDTO.password);
      }
      const resp = yield call(POST, '/api/v1/user/password', changeDTO);
      if (callback) callback(resp);
      if (resp?.success) {
        Notice.success('修改成功', '密码已更新，请重新登录');
        yield put({ type: 'logout' });
      }
    },
  },

  reducers: {
    setUser(state: any, { payload }: any) {
      const token = sessionStorage.getItem(storageKey('token'));
      return { ...state, currentUser: payload, isAuthenticated: !!token };
    },
    clearUser(state: any) {
      return { ...state, currentUser: null, isAuthenticated: false };
    },
    setLoading(state: any, { payload }: any) {
      return { ...state, loading: payload };
    },
    setValidatingToken(state: any, { payload }: any) {
      return { ...state, validatingToken: payload };
    },
    setUserSettings(state: any, { payload }: any) {
      return { ...state, userSettings: payload };
    },
    setUserSettingsLoading(state: any, { payload }: any) {
      return { ...state, userSettingsLoading: payload };
    },
  },
};
