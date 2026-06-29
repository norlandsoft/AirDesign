/**
 * Help 帮助提示 Demo
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React from 'react'
import {GroupSplitter, Help} from 'air-design'
import PageContainer from '../components/PageContainer'

const HelpPage: React.FC = () => {
  return (
    <PageContainer
      title="Help 帮助提示"
      description="小 help 图标，鼠标悬停以 Tooltip 展示说明文字，常用于表单标签、配置项旁。"
    >
      <div className="demo-block">
        <GroupSplitter title="基础用法"/>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="inline-flex items-center gap-1.5">
            用户名
            <Help text="登录名创建后不可修改，请谨慎填写"/>
          </span>
          <span className="inline-flex items-center gap-1.5">
            API 密钥
            <Help text="密钥仅创建时展示一次，请妥善保存"/>
          </span>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="弹出方位"/>
        <div className="flex flex-wrap items-center gap-8 text-sm">
          <span className="inline-flex items-center gap-1.5">
            上方
            <Help side="top" text="Tooltip 在上方展示（默认）"/>
          </span>
          <span className="inline-flex items-center gap-1.5">
            右侧
            <Help side="right" text="Tooltip 在右侧展示"/>
          </span>
          <span className="inline-flex items-center gap-1.5">
            下方
            <Help side="bottom" text="Tooltip 在下方展示"/>
          </span>
          <span className="inline-flex items-center gap-1.5">
            左侧
            <Help side="left" text="Tooltip 在左侧展示"/>
          </span>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="长文本 / 自定义图标"/>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="inline-flex items-center gap-1.5">
            数据保留策略
            <Help
              size={16}
              text="系统默认保留 90 天操作日志；开启归档后，历史数据将迁移至冷存储，查询延迟可能增加，但存储成本更低。"
            />
          </span>
          <span className="inline-flex items-center gap-1.5">
            通知渠道
            <Help icon="sign_info" text="支持邮件、站内信与 Webhook 三种通知方式"/>
          </span>
        </div>
      </div>
    </PageContainer>
  )
}

export default HelpPage
