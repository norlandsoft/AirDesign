/**
 * Login 登录页（左装饰右表单）
 *
 * 左右分栏布局：左侧以网格、波浪与线条构成品牌装饰区；右侧为白底登录表单，
 * 输入框采用左侧强调色竖线，主按钮为圆角矩形。登录逻辑接入 air-kit useUserStore.login。
 *
 * 若 defineSdkConfig 配置了 loginId（如 admin），则隐藏用户名输入框，仅保留密码。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {Button, Form, Input, PasswordInput} from 'air-design'
import type {FormInstance} from 'air-design'
import {useUserStore} from '../../models/user'
import {getSdkConfig} from '../../config'
import './index.css'

/** 登录页可选主题 */
export type LoginTheme = keyof typeof LOGIN_THEMES

/** 登录页主题配色（左侧基色、强调色、按钮色） */
export const LOGIN_THEMES = {
  blue: {
    base: '#1a6fd4',
    accent: '#2185f4',
    accentSoft: 'rgba(33, 133, 244, 0.2)',
    button: '#2185f4',
    buttonHover: '#1a6fd4',
  },
  teal: {
    base: '#0a5c55',
    accent: '#14b8a6',
    accentSoft: 'rgba(20, 184, 166, 0.18)',
    button: '#14b8a6',
    buttonHover: '#0d9488',
  },
  cyan: {
    base: '#0e7490',
    accent: '#06b6d4',
    accentSoft: 'rgba(6, 182, 212, 0.2)',
    button: '#06b6d4',
    buttonHover: '#0891b2',
  },
  emerald: {
    base: '#047857',
    accent: '#10b981',
    accentSoft: 'rgba(16, 185, 129, 0.2)',
    button: '#10b981',
    buttonHover: '#059669',
  },
  indigo: {
    base: '#3730a3',
    accent: '#4f46e5',
    accentSoft: 'rgba(79, 70, 229, 0.2)',
    button: '#4f46e5',
    buttonHover: '#4338ca',
  },
  violet: {
    base: '#6d28d9',
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.2)',
    button: '#7c3aed',
    buttonHover: '#6d28d9',
  },
  rose: {
    base: '#be123c',
    accent: '#e11d48',
    accentSoft: 'rgba(225, 29, 72, 0.2)',
    button: '#e11d48',
    buttonHover: '#be123c',
  },
  orange: {
    base: '#c2410c',
    accent: '#f97316',
    accentSoft: 'rgba(249, 115, 22, 0.2)',
    button: '#f97316',
    buttonHover: '#ea580c',
  },
  amber: {
    base: '#b45309',
    accent: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.2)',
    button: '#f59e0b',
    buttonHover: '#d97706',
  },
  slate: {
    base: '#334155',
    accent: '#475569',
    accentSoft: 'rgba(71, 85, 105, 0.2)',
    button: '#475569',
    buttonHover: '#334155',
  },
} as const

interface LoginProps {
  /** 登录成功后回调（默认跳转到根路径） */
  onSuccess?: () => void
  /** 覆盖 defineSdkConfig.theme，便于演示多套配色 */
  theme?: LoginTheme
}

interface LoginForm extends Record<string, unknown> {
  username: string
  password: string
}

/** 左侧装饰线条与节点（纯视觉，不参与交互） */
const BrandDecor: React.FC = () => (
  <div className="air-login-decor" aria-hidden>
    <svg className="air-login-wave air-login-wave-top" viewBox="0 0 800 220" preserveAspectRatio="none">
      <path
        d="M0,120 C120,40 240,180 400,90 C560,0 680,140 800,60 L800,0 L0,0 Z"
        fill="rgba(255,255,255,0.12)"
      />
      <path
        d="M0,160 C160,80 280,200 480,110 C620,40 720,150 800,100 L800,0 L0,0 Z"
        fill="rgba(255,255,255,0.08)"
      />
    </svg>
    <svg className="air-login-wave air-login-wave-bottom" viewBox="0 0 800 220" preserveAspectRatio="none">
      <path
        d="M0,60 C140,140 300,20 460,100 C600,170 700,40 800,120 L800,220 L0,220 Z"
        fill="rgba(255,255,255,0.1)"
      />
      <path
        d="M0,100 C120,20 280,160 440,70 C580,0 700,130 800,50 L800,220 L0,220 Z"
        fill="rgba(255,255,255,0.06)"
      />
    </svg>

    <svg className="air-login-lines" viewBox="0 0 480 480">
      <line x1="40" y1="80" x2="180" y2="200" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      <circle cx="40" cy="80" r="4" fill="rgba(255,255,255,0.5)"/>
      <circle cx="180" cy="200" r="3" fill="rgba(255,255,255,0.4)"/>
      <line x1="320" y1="60" x2="420" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      <circle cx="320" cy="60" r="3" fill="rgba(255,255,255,0.45)"/>
      <circle cx="420" cy="160" r="4" fill="rgba(255,255,255,0.35)"/>
      <line x1="100" y1="320" x2="260" y2="400" stroke="rgba(255,255,255,0.28)" strokeWidth="1"/>
      <circle cx="100" cy="320" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="260" cy="400" r="4" fill="rgba(255,255,255,0.3)"/>
    </svg>

    <span className="air-login-circle air-login-circle-1"/>
    <span className="air-login-circle air-login-circle-2"/>
    <span className="air-login-circle air-login-circle-3"/>
  </div>
)

const Login: React.FC<LoginProps> = ({onSuccess, theme: themeProp}) => {
  const cfg = getSdkConfig()
  const themeName = (
    themeProp ?? (cfg.theme && LOGIN_THEMES[cfg.theme] ? cfg.theme : 'blue')
  ) as LoginTheme
  const theme = LOGIN_THEMES[themeName]
  const appName = cfg.appName ?? '应用'
  const appTagline = cfg.appTagline ?? '统一身份认证与安全访问入口'
  const fixedLoginId = cfg.loginId?.trim() ?? ''
  const passwordOnly = fixedLoginId.length > 0

  const login = useUserStore((s) => s.login)
  const loading = useUserStore((s) => s.loading)
  const [form] = Form.useForm<LoginForm>()
  const [loginError, setLoginError] = useState('')

  const themeStyle = {
    '--login-base': theme.base,
    '--login-accent': theme.accent,
    '--login-accent-soft': theme.accentSoft,
    '--login-button-bg': theme.button,
    '--login-button-hover': theme.buttonHover,
  } as React.CSSProperties

  const handleFinish = async (values: LoginForm) => {
    setLoginError('')
    await login({
      id: passwordOnly ? fixedLoginId : values.username.trim(),
      password: values.password,
    })
    const authed = useUserStore.getState().isAuthenticated
    if (authed) {
      onSuccess ? onSuccess() : (window.location.href = '/')
    } else {
      setLoginError(passwordOnly ? '登录失败，请检查密码' : '登录失败，请检查用户名和密码')
    }
  }

  return (
    <div className="air-login-split" style={themeStyle}>
      <aside className="air-login-brand">
        <BrandDecor/>

        <header className="air-login-brand-header">
          <span className="air-login-brand-mark">
            <span className="air-login-brand-mark-ring"/>
            <span className="air-login-brand-mark-core"/>
          </span>
          <span className="air-login-brand-name">{appName}</span>
        </header>

        <div className="air-login-brand-content">
          <p className="air-login-greeting">很高兴再次见到您</p>
          <h1 className="air-login-headline">欢迎回来</h1>
          <span className="air-login-headline-line"/>
          <p className="air-login-desc">{appTagline}</p>
        </div>

        <footer className="air-login-brand-footer">© {new Date().getFullYear()} Norlandsoft</footer>
      </aside>

      <main className="air-login-form-side">
        <div className="air-login-form-card">
          <h2 className="air-login-form-title">登录账户</h2>
          <p className="air-login-form-sub">
            {passwordOnly
              ? `请输入 ${appName} 管理员密码以继续`
              : `使用您的账号登录 ${appName}`}
          </p>

          <Form<LoginForm>
            form={form as FormInstance<LoginForm>}
            layout="vertical"
            requiredMark={false}
            className="air-login-form"
            onFinish={handleFinish}
          >
            {!passwordOnly && (
              <Form.Item
                name="username"
                label="用户名"
                className="air-login-field"
                rules={[{required: true, message: '请输入用户名'}]}
              >
                <Input className="air-login-field-input" placeholder="请输入用户名" autoFocus/>
              </Form.Item>
            )}
            <Form.Item
              name="password"
              label="密码"
              className="air-login-field"
              rules={[{required: true, message: '请输入密码'}]}
            >
              <PasswordInput
                className="air-login-field-input"
                placeholder="请输入密码"
                autoFocus={passwordOnly}
              />
            </Form.Item>

            {loginError ? <div className="air-login-error">{loginError}</div> : null}

            <Button
              block
              loading={loading}
              className="air-login-submit"
              onClick={() => form.submit()}
            >
              登 录
            </Button>
          </Form>
        </div>
      </main>
    </div>
  )
}

export default Login
