/**
 * 安全布局组件
 *
 * 未登录时渲染消费方提供的登录页（login prop），已登录时渲染 children。
 * 登录页由各业务服务自行实现（air-kit 不再内置 Login 组件）。
 * 增强功能：检测 URL 中的 transferToken 参数，自动兑换为正式 Token 实现免登录跳转。
 * transferToken 兑换失败时不阻断，降级为正常登录流程。
 *
 * 基于 Zustand useUserStore（已去 DVA）。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {useEffect, useRef} from 'react'
import {Spin} from 'air-design'
import {useUserStore} from '../models/user'
import {POST} from '../utils/HttpRequest'
import {storageKey} from '../config'

interface SecurityLayoutProps {
  children?: React.ReactNode
  /** 未登录时渲染的登录页（由各业务服务自行实现并传入） */
  login?: React.ReactNode
}

const SecurityLayout: React.FC<SecurityLayoutProps> = ({children, login}) => {
  const hasCheckedRef = useRef(false)

  // 直接订阅所需状态与 action（Zustand 精确订阅，避免多余渲染）
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const validatingToken = useUserStore((s) => s.validatingToken)
  const setUser = useUserStore((s) => s.setUser)
  const clearUser = useUserStore((s) => s.clearUser)
  const validateToken = useUserStore((s) => s.validateToken)

  // 处理 URL 中的 transferToken（跨应用免登录跳转）
  useEffect(() => {
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const transferToken = params.get('transferToken')

    if (transferToken) {
      // 清除 URL 中的 transferToken 参数，避免刷新重复消费
      params.delete('transferToken')
      const newSearch = params.toString()
      const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash
      window.history.replaceState({}, '', newUrl)

      // 兑换 transferToken 为正式 Token
      POST('/api/v1/transfer/accept', {transferToken})
        .then((resp: any) => {
          if (resp?.success && resp.data) {
            const data = resp.data
            const token = data.token || ''
            if (token) sessionStorage.setItem(storageKey('token'), token)

            const userData = data.user || data || null
            if (userData?.id) sessionStorage.setItem(storageKey('uid'), String(userData.id))
            if (userData?.loginId) sessionStorage.setItem(storageKey('user'), String(userData.loginId))

            if (token) {
              setUser(userData)
              window.dispatchEvent(new CustomEvent('auth-state-changed', {detail: {authenticated: true}}))
              return
            }
          }
          // 兑换失败，走正常流程
          checkExistingToken()
        })
        .catch(() => {
          checkExistingToken()
        })
      return
    }

    // 无 transferToken，检查已有 Token
    checkExistingToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkExistingToken = () => {
    const token = sessionStorage.getItem(storageKey('token'))
    if (token) {
      validateToken()
    }
  }

  // 监听认证状态变化事件（登录/登出）
  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && !detail.authenticated) {
        clearUser()
      }
    }
    window.addEventListener('auth-state-changed', handleAuthChange)
    return () => window.removeEventListener('auth-state-changed', handleAuthChange)
  }, [clearUser])

  // 监听 storage 变化（跨标签页同步 token）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey('token')) {
        validateToken()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [validateToken])

  // 正在验证 token 时显示全屏加载
  if (validatingToken) {
    return <Spin spinning={true} fullscreen={true} description="正在验证身份..."/>
  }

  // 未认证则显示登录页（由消费方通过 login prop 提供）
  if (!isAuthenticated) {
    return <>{login ?? null}</>
  }

  // 已认证则渲染子组件
  return <>{children}</>
}

export default SecurityLayout
