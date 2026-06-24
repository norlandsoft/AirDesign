/**
 * 登录页 Demo：展示 air-kit Login 组件（左品牌右表单）
 *
 * 支持切换多套登录页主题配色。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {Login, LOGIN_THEMES, useUserStore, type LoginTheme} from 'air-kit'
import {Button, Icon} from 'air-design'
import PageContainer from '../components/PageContainer'

/** 主题展示名称 */
const THEME_LABELS: Record<LoginTheme, string> = {
  blue: '蓝色',
  teal: '青绿',
  cyan: '青色',
  emerald: '翠绿',
  indigo: '靛蓝',
  violet: '紫色',
  rose: '玫红',
  orange: '橙色',
  amber: '琥珀',
  slate: '石墨',
}

const THEME_OPTIONS = (Object.keys(LOGIN_THEMES) as LoginTheme[]).map((value) => ({
  value,
  label: THEME_LABELS[value],
}))

const LoginPage: React.FC = () => {
  const [theme, setTheme] = useState<LoginTheme>('blue')
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const currentUser = useUserStore((s) => s.currentUser)

  return (
    <PageContainer
      title="登录页（air-kit Login）"
      description="左装饰右表单布局，可切换多套主题色。Mock 账号：demo / 任意密码。"
    >
      <div className="demo-block">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="rounded bg-green-50 px-2 py-0.5 text-green-700">
                已登录：{currentUser?.name ?? 'demo'}
              </span>
              <Button size="sm" onClick={() => {useUserStore.setState({isAuthenticated: false})}}>
                模拟退出（仅 Demo）
              </Button>
            </>
          ) : (
            <span className="rounded bg-muted px-2 py-0.5">未登录</span>
          )}
        </div>
      </div>

      <div className="demo-block">
        <div className="mb-3 text-sm font-medium text-foreground">主题配色</div>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                theme === item.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
              onClick={() => setTheme(item.value)}
            >
              <span
                className="inline-block size-3 rounded-full"
                style={{background: LOGIN_THEMES[item.value].button}}
              />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          height: 560,
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Login theme={theme} onSuccess={() => alert('登录成功（Demo）')}/>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="help" size={14}/>
        登录走 fetchMock（账号 demo / 任意密码），store 写入后 isAuthenticated 变为 true。
      </div>
    </PageContainer>
  )
}

export default LoginPage
