/**
 * 登录页 Demo：展示 air-kit Login 组件（左品牌右表单）
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React from 'react'
import {Login, useUserStore} from 'air-kit'
import {Button, Icon} from 'air-design'
import PageContainer from '../components/PageContainer'

const LoginPage: React.FC = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const currentUser = useUserStore((s) => s.currentUser)
  const logout = useUserStore((s) => s.logout)

  return (
    <PageContainer title="登录页（air-kit Login）" description="左品牌右表单布局，登录逻辑接 air-kit useUserStore.login。Mock 账号：demo / 任意密码。">
      <div className="demo-block">
        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="rounded bg-green-50 px-2 py-0.5 text-green-700">已登录：{currentUser?.name ?? 'demo'}</span>
              <Button size="sm" onClick={() => {useUserStore.setState({isAuthenticated: false})}}>模拟退出（仅 Demo）</Button>
            </>
          ) : (
            <span className="rounded bg-muted px-2 py-0.5">未登录</span>
          )}
        </div>
      </div>

      {/* Login 组件：固定高度容器内展示 */}
      <div style={{height: 520, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden'}}>
        <Login onSuccess={() => alert('登录成功（Demo）')}/>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="help" size={14}/>
        登录走 fetchMock（账号 demo / 任意密码），store 写入后 isAuthenticated 变为 true。
      </div>
    </PageContainer>
  )
}

export default LoginPage
