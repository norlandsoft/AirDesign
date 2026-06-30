/**
 * 统一用户 Store（Zustand）
 *
 * 取代 DVA UserModel。登录与 Token 校验统一走 SSO 通道 /api/v1/auth/*。
 * 保留 auth-state-changed CustomEvent 桥接，便于非 React 代码（HttpRequest 等）响应。
 *
 * @author ChaiMingXu, 2026/06/25
 */
import {create} from 'zustand'
import {POST} from '../utils/HttpRequest'
import {Notice} from 'air-design'
import {SHA} from '../utils/CryptoUtils'
import type {UserLoginRequest, UserResponse} from '../types/user'
import {storageKey} from '../config'
import {applyDisplaySettingsFromResponse, applyDisplaySettingsFromUserSettings} from '../utils/displaySettings'

/** SSO 登录接口 */
const SSO_LOGIN_URL = '/api/v1/auth/login'
/** SSO Token 校验接口 */
const SSO_CURRENT_URL = '/api/v1/auth/current'

export interface UserState {
  currentUser: UserResponse | null
  isAuthenticated: boolean
  loading: boolean
  validatingToken: boolean
  userSettings: any
  userSettingsLoading: boolean

  // actions
  login: (payload: UserLoginRequest) => Promise<void>
  logout: () => Promise<void>
  validateToken: () => Promise<void>
  updateUserInfo: (payload: any, callback?: (resp: any) => void) => Promise<void>
  fetchUserSettings: (payload: {userId: string | number}) => Promise<void>
  updateUserSettings: (payload: any, callback?: (resp: any) => void) => Promise<void>
  changePassword: (payload: any, callback?: (resp: any) => void) => Promise<void>
  setUser: (user: UserResponse | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isAuthenticated: !!sessionStorage.getItem(storageKey('token')),
  loading: false,
  validatingToken: false,
  userSettings: null,
  userSettingsLoading: false,

  setUser: (user) =>
    set(() => ({
      currentUser: user,
      isAuthenticated: !!sessionStorage.getItem(storageKey('token')),
    })),

  clearUser: () =>
    set(() => ({currentUser: null, isAuthenticated: false})),

  login: async (payload) => {
    const {id, password} = payload
    const newPassword = SHA(password)

    set({loading: true})
    const resp = await POST(SSO_LOGIN_URL, {id, password: newPassword})
    set({loading: false})

    if (resp?.success) {
      const data = resp.data || {}
      const token = data.token || ''
      const user: UserResponse = data.user || data || null

      if (token) sessionStorage.setItem(storageKey('token'), token)
      if (user?.id) sessionStorage.setItem(storageKey('uid'), String(user.id))
      if (user?.loginId) sessionStorage.setItem(storageKey('user'), String(user.loginId))

      set({currentUser: user, isAuthenticated: !!token})
      window.dispatchEvent(new CustomEvent('auth-state-changed', {detail: {authenticated: true}}))
    } else {
      Notice.error('登录失败', resp?.message || '登录失败，请检查用户名和密码')
    }
  },

  logout: async () => {
    sessionStorage.clear()
    set({currentUser: null, isAuthenticated: false})
    window.dispatchEvent(new CustomEvent('auth-state-changed', {detail: {authenticated: false}}))
  },

  validateToken: async () => {
    const state = get()
    if (state.validatingToken) return

    const token = sessionStorage.getItem(storageKey('token'))
    if (!token) {
      if (state.isAuthenticated) {
        set({currentUser: null, isAuthenticated: false})
        window.dispatchEvent(new CustomEvent('auth-state-changed', {detail: {authenticated: false}}))
      }
      return
    }

    set({validatingToken: true})
    try {
      const resp = await POST(SSO_CURRENT_URL, {})
      if (resp?.success) {
        const user: UserResponse = resp.data || null
        if (user?.id) sessionStorage.setItem(storageKey('uid'), String(user.id))
        if (user?.loginId) sessionStorage.setItem(storageKey('user'), String(user.loginId))

        const wasAuthenticated = state.isAuthenticated
        const userChanged =
          !state.currentUser || !state.currentUser.id || state.currentUser.id !== user.id

        set({currentUser: user, isAuthenticated: true})
        if (userChanged || !wasAuthenticated) {
          window.dispatchEvent(new CustomEvent('auth-state-changed', {detail: {authenticated: true}}))
        }
      } else {
        sessionStorage.removeItem(storageKey('token'))
        sessionStorage.removeItem(storageKey('user'))
        sessionStorage.removeItem(storageKey('uid'))
        if (state.isAuthenticated) {
          set({currentUser: null, isAuthenticated: false})
          window.dispatchEvent(new CustomEvent('auth-state-changed', {detail: {authenticated: false}}))
        }
      }
    } finally {
      set({validatingToken: false})
    }
  },

  updateUserInfo: async (payload, callback) => {
    const resp = await POST('/api/v1/user/update', payload)
    callback?.(resp)
    if (resp?.success) {
      set({currentUser: resp.data})
    }
  },

  fetchUserSettings: async (payload) => {
    set({userSettingsLoading: true})
    try {
      const resp = await POST('/api/v1/user/settings/get', {userId: payload.userId})
      if (resp?.success) {
        set({userSettings: resp.data})
        // 远端设置写入 sessionStorage 并应用到 --base-font-size
        applyDisplaySettingsFromResponse(resp.data)
      }
    } finally {
      set({userSettingsLoading: false})
    }
  },

  updateUserSettings: async (payload, callback) => {
    const resp = await POST('/api/v1/user/settings/update', payload)
    callback?.(resp)
    if (resp?.success) {
      set({userSettings: resp.data})
      applyDisplaySettingsFromUserSettings(
        resp.data?.settings ?? payload.settings ?? resp.data?.displaySettings ?? payload.displaySettings,
      )
    }
  },

  changePassword: async (payload, callback) => {
    const changeDTO: any = {...payload}
    if (changeDTO.password?.trim()) {
      changeDTO.password = SHA(changeDTO.password)
    }
    const resp = await POST('/api/v1/user/password', changeDTO)
    callback?.(resp)
    if (resp?.success) {
      Notice.success('修改成功', '密码已更新，请重新登录')
      await get().logout()
    }
  },
}))

export const UserModel = useUserStore
export default useUserStore
