/**
 * InfoPage 全页信息展示 Demo
 *
 * 对齐 antd Result，展示各 status 预设与 extra 操作区。
 *
 * @author ChaiMingXu, 2026/06/25
 */
import React, {useMemo, useState} from 'react'
import {Button, InfoPage, type InfoPageStatus} from 'air-design'
import PageContainer from '../components/PageContainer'

const STATUS_OPTIONS: {value: InfoPageStatus; label: string}[] = [
  {value: 'success', label: 'success'},
  {value: 'error', label: 'error'},
  {value: 'info', label: 'info'},
  {value: 'warning', label: 'warning'},
  {value: '404', label: '404'},
  {value: '403', label: '403'},
  {value: '500', label: '500'},
]

const STATUS_COPY: Record<
  InfoPageStatus,
  {title: string; subTitle: string}
> = {
  success: {
    title: '操作成功',
    subTitle: '您的更改已保存，可继续其他操作',
  },
  error: {
    title: '操作失败',
    subTitle: '请检查网络连接后重试，或联系系统管理员',
  },
  info: {
    title: '提示信息',
    subTitle: '这是一条普通说明，用于引导用户完成后续步骤',
  },
  warning: {
    title: '请注意',
    subTitle: '当前配置尚未生效，保存后需要重新登录',
  },
  '404': {
    title: '页面不存在',
    subTitle: '您访问的地址有误，或页面已被移除',
  },
  '403': {
    title: '无权访问',
    subTitle: '您没有权限查看此资源，请联系管理员',
  },
  '500': {
    title: '服务器错误',
    subTitle: '服务暂时不可用，请稍后再试',
  },
}

const InfoPagePage: React.FC = () => {
  const [status, setStatus] = useState<InfoPageStatus>('success')
  const copy = useMemo(() => STATUS_COPY[status], [status])

  return (
    <PageContainer
      title="InfoPage 全页信息"
      description="对齐 antd Result，用于整页居中展示操作结果或异常信息。"
      className="max-w-5xl"
    >
      <div className="demo-block">
        <h3 className="demo-section-title">状态切换</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                status === item.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">整页展示（容器高度 420px）</h3>
        <div
          className="overflow-hidden rounded-lg border border-border bg-background"
          style={{height: 420}}
        >
          <InfoPage
            status={status}
            title={copy.title}
            subTitle={copy.subTitle}
            extra={
              <>
                <Button type="primary">主要操作</Button>
                <Button>次要操作</Button>
              </>
            }
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default InfoPagePage
