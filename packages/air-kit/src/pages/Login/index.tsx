/**
 * Login 登录页（居中卡片左右分栏）
 *
 * 全页主题渐变背景（大面积圆环装饰）+ 居中圆角卡片：左侧约 40% 欢迎区（斜线节点与小圆），
 * 右侧约 60% 为白底表单区。登录统一走 SSO 通道 /api/v1/auth/login。
 *
 * @author ChaiMingXu, 2026/06/25
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
  /** 登录成功后回调；默认不做跳转（由 SecurityLayout 依据认证状态自动切换到主内容），仅在需要额外处理时传入 */
  onSuccess?: () => void
  /** 覆盖 defineSdkConfig.theme，便于演示多套配色 */
  theme?: LoginTheme
}

interface LoginForm extends Record<string, unknown> {
  username: string
  password: string
}

/** 全页背景装饰：大面积朦胧圆环（与 panel 内图案区分） */
const PageBgDecor: React.FC = () => (
  <div className="air-login-page-decor" aria-hidden>
    <span className="air-login-bg-ring air-login-bg-ring-1"/>
    <span className="air-login-bg-ring air-login-bg-ring-2"/>
    <span className="air-login-bg-ring air-login-bg-ring-3"/>
    <span className="air-login-bg-ring air-login-bg-ring-4"/>
    <span className="air-login-bg-ring air-login-bg-ring-5"/>
  </div>
)

/** 左侧欢迎 panel 装饰：斜线节点与小圆（与全页背景图案区分） */
const PanelDecor: React.FC = () => (
  <div className="air-login-panel-decor" aria-hidden>
    <span className="air-login-panel-circle air-login-panel-circle-1"/>
    <span className="air-login-panel-circle air-login-panel-circle-2"/>
    <span className="air-login-panel-circle air-login-panel-circle-3"/>
    <svg className="air-login-panel-lines" viewBox="0 0 400 400">
      <line x1="48" y1="56" x2="168" y2="176" stroke="rgba(255,255,255,0.32)" strokeWidth="1"/>
      <circle cx="48" cy="56" r="4" fill="rgba(255,255,255,0.45)"/>
      <circle cx="168" cy="176" r="3" fill="rgba(255,255,255,0.35)"/>
      <line x1="260" y1="72" x2="360" y2="168" stroke="rgba(255,255,255,0.28)" strokeWidth="1"/>
      <circle cx="260" cy="72" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="360" cy="168" r="4" fill="rgba(255,255,255,0.3)"/>
      <line x1="80" y1="300" x2="240" y2="380" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      <circle cx="80" cy="300" r="3" fill="rgba(255,255,255,0.38)"/>
      <circle cx="240" cy="380" r="4" fill="rgba(255,255,255,0.28)"/>
    </svg>
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
      id: values.username.trim(),
      password: values.password,
    })
    const authed = useUserStore.getState().isAuthenticated
    if (authed) {
      // 登录成功：login() 已写入认证状态（isAuthenticated=true），SecurityLayout 会据此
      // 自动从登录页切换到主内容，无需整页硬刷新。整页刷新会丢弃已就绪的客户端状态，
      // 迫使 SecurityLayout 重新走 token 校验（全屏 Spin + 二次网络请求），
      // 造成登录后“两次刷新”的闪烁。onSuccess 留给需要额外处理（如客户端路由跳转）的消费方。
      onSuccess?.()
    } else {
      setLoginError('登录失败，请检查用户名和密码')
    }
  }

  return (
    <div className="air-login-page" style={themeStyle}>
      <div className="air-login-page-bg" aria-hidden>
        <PageBgDecor/>
      </div>

      <div className="air-login-card">
        <aside className="air-login-brand">
          <PanelDecor/>

          <div className="air-login-brand-content">
            <p className="air-login-brand-name">{appName}</p>
            <h1 className="air-login-headline">欢迎回来</h1>
            <p className="air-login-desc">{appTagline}</p>
          </div>
        </aside>

        <main className="air-login-form-side">
          <div className="air-login-form-body">
            <h2 className="air-login-form-title">登录账户</h2>
            <p className="air-login-form-sub">使用您的账号登录 {appName}</p>

            <Form<LoginForm>
              form={form as FormInstance<LoginForm>}
              layout="vertical"
              requiredMark={false}
              className="air-login-form"
              initialValues={{username: '', password: ''}}
              onFinish={handleFinish}
            >
              <Form.Item
                name="username"
                label="用户名"
                className="air-login-field"
                rules={[{required: true, message: '请输入用户名'}]}
              >
                <Input className="air-login-field-input" placeholder="请输入用户名" autoFocus/>
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                className="air-login-field"
                rules={[{required: true, message: '请输入密码'}]}
              >
                <PasswordInput
                  className="air-login-field-input"
                  placeholder="请输入密码"
                />
              </Form.Item>

              {loginError ? <div className="air-login-error">{loginError}</div> : null}

              <Button
                block
                loading={loading}
                htmlType="submit"
                className="air-login-submit"
              >
                登 录
              </Button>
            </Form>
          </div>

          <footer className="air-login-form-footer">
            © {new Date().getFullYear()} Norlandsoft
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Login
