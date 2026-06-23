/**
 * Login 登录页（左品牌右表单）
 *
 * 布局模仿 JettoAuthor：左侧品牌区（主题渐变 + Logo + 应用名 + Slogan + 特性），
 * 右侧白色登录表单卡片（用户名 / 密码 / 登录按钮）。登录逻辑接入 air-kit
 * useUserStore.login（密码 SHA256 + 接口）。
 *
 * 若 defineSdkConfig 配置了 loginId（如 admin），则隐藏用户名输入框，仅保留密码。
 *
 * 主题色由 getSdkConfig().theme 决定（blue/teal/amber，默认 teal），
 * 影响左侧渐变与强调色。
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React, {useState} from 'react'
import {useUserStore} from '../../models/user'
import {getSdkConfig} from '../../config'
import './index.css'

/** 三套主题的左侧渐变与强调色 */
const THEMES = {
  teal: {
    gradient: 'linear-gradient(135deg, #042b27 0%, #0a4a42 45%, #0d7377 100%)',
    accent: '#14b8a6',
  },
  blue: {
    gradient: 'linear-gradient(135deg, #0a1e3a 0%, #123f68 50%, #1d5a9e 100%)',
    accent: '#3b82f6',
  },
  amber: {
    gradient: 'linear-gradient(135deg, #2b1d04 0%, #6b4513 50%, #b87333 100%)',
    accent: '#f59e0b',
  },
} as const

interface LoginProps {
  /** 登录成功后回调（默认跳转到根路径） */
  onSuccess?: () => void
}

const Login: React.FC<LoginProps> = ({onSuccess}) => {
  const cfg = getSdkConfig()
  const themeName = (cfg.theme && THEMES[cfg.theme] ? cfg.theme : 'teal') as keyof typeof THEMES
  const theme = THEMES[themeName]
  const appName = cfg.appName ?? '应用'
  const appTagline = cfg.appTagline ?? ''
  /** 固定登录身份：配置后仅输入密码（如 AirFramework 单 admin 账户） */
  const fixedLoginId = cfg.loginId?.trim() ?? ''
  const passwordOnly = fixedLoginId.length > 0

  const login = useUserStore((s) => s.login)
  const loading = useUserStore((s) => s.loading)

  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!passwordOnly && !username.trim()) {
      setError('请输入用户名')
      return
    }
    if (!password) {
      setError('请输入密码')
      return
    }
    await login({
      id: passwordOnly ? fixedLoginId : username.trim(),
      password,
    })
    const authed = useUserStore.getState().isAuthenticated
    if (authed) {
      onSuccess ? onSuccess() : (window.location.href = '/')
    } else {
      setError(passwordOnly ? '登录失败，请检查密码' : '登录失败，请检查用户名和密码')
    }
  }

  return (
    <div className="air-login-split">
      {/* 左侧品牌区 */}
      <aside className="air-login-brand" style={{background: theme.gradient}}>
        <div className="air-login-brand-inner">
          <div className="air-login-logo" style={{color: theme.accent}}>
            <span className="air-login-logo-dot" style={{background: theme.accent}}/>
            {appName}
          </div>
          <h1 className="air-login-brand-title">{appName}</h1>
          {appTagline && <p className="air-login-brand-tagline">{appTagline}</p>}
          <ul className="air-login-features">
            <li>统一身份认证</li>
            <li>跨应用免登切换</li>
            <li>安全 Token 管理</li>
          </ul>
        </div>
        <div className="air-login-brand-footer">© {new Date().getFullYear()} Norlandsoft</div>
      </aside>

      {/* 右侧表单区 */}
      <main className="air-login-form-side">
        <div className="air-login-form-card">
          <h2 className="air-login-form-title">欢迎回来</h2>
          <p className="air-login-form-sub">
            {passwordOnly ? `请输入 ${appName} 管理员密码` : `登录以继续使用 ${appName}`}
          </p>

          <form onSubmit={handleSubmit} className="air-login-form" autoComplete="off">
            {!passwordOnly && (
              <div className="air-login-field">
                <label>用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  autoFocus
                />
              </div>
            )}
            <div className="air-login-field">
              <label>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoFocus={passwordOnly}
              />
            </div>
            {error && <div className="air-login-error">{error}</div>}
            <button
              type="submit"
              className="air-login-submit"
              style={{background: theme.accent}}
              disabled={loading}
            >
              {loading ? '登录中…' : '登 录'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Login
