/**
 * 统一用户 Store（Zustand）
 *
 * 取代 DVA UserModel。admin 走 /admin/user/login，其余走 /api/v1/auth/login；
 * validateToken 统一走 /api/v1/auth/current。
 * 保留原有的 auth-state-changed CustomEvent 桥接，便于非 React 代码（HttpRequest 等）响应。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {create} from 'zustand'
import {POST} from '../utils/HttpRequest'
import {Notice} from 'air-design'
import {SHA} from '../utils/CryptoUtils'
import type {UserLoginRequest, UserResponse} from '../types/user'
import {storageKey} from '../config'

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
  changeAdminPassword: (payload: {password: string}, callback?: (resp: any) => void) => Promise<void>
  updateUserInfo: (payload: any, callback?: (resp: any) => void) => Promise<void>
  fetchUserSettings: (payload: {userId: string | number}) => Promise<void>
  updateUserSettings: (payload: any, callback?: (resp: any) => void) => Promise<void>
  changePassword: (payload: any, callback?: (resp: any) => void) => Promise<void>
  // 直接状态操作（对应 DVA reducers）
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
    const loginDTO: UserLoginRequest = {id, password: newPassword}

    const isAdmin = id?.toLowerCase?.() === 'admin'
    const loginUrl = isAdmin ? '/admin/user/login' : '/api/v1/auth/login'

    set({loading: true})
    const resp = await POST(loginUrl, loginDTO)
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
      const resp = await POST('/api/v1/auth/current', {})
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

  changeAdminPassword: async (payload, callback) => {
    const changeDTO: any = {...payload}
    if (changeDTO.password?.trim()) {
      changeDTO.password = SHA(changeDTO.password)
    }
    const resp = await POST('/admin/user/changePassword', changeDTO)
    callback?.(resp)
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

// 兼容旧导出名：UserModel（已不再作为 DVA model，仅为平滑过渡保留对 store 的引用）
export const UserModel = useUserStore
export default useUserStore
