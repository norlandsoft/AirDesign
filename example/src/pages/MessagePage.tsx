/**
 * Message / Notice 命令式提示 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Message, Notice} from 'air-design'
import PageContainer from '../components/PageContainer'

const MessagePage: React.FC = () => {
  return (
    <PageContainer title="Message / Notice 提示" description="命令式轻提示（顶部居中）与通知（四角弹出）。">
      <div className="demo-block">
        <h3 className="demo-section-title">Message 轻提示</h3>
        <div className="demo-row">
          <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => Message.info('这是一条信息提示')}>info</button>
          <button className="rounded bg-green-600 px-4 py-2 text-sm text-white" onClick={() => Message.success('操作成功')}>success</button>
          <button className="rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground" onClick={() => Message.error('操作失败')}>error</button>
          <button className="rounded bg-amber-600 px-4 py-2 text-sm text-white" onClick={() => Message.warning('请注意风险')}>warning</button>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">Notice 通知</h3>
        <div className="demo-row">
          <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => Notice.info('提示', '这是一条通知详情', 4)}>info</button>
          <button className="rounded bg-green-600 px-4 py-2 text-sm text-white" onClick={() => Notice.success('成功', '操作已完成', 4)}>success</button>
          <button className="rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground" onClick={() => Notice.error('错误', '请检查网络连接', 4)}>error</button>
          <button className="rounded bg-amber-600 px-4 py-2 text-sm text-white" onClick={() => Notice.warning('警告', '数据可能不完整', 4, 'topRight')}>warning</button>
        </div>
      </div>
    </PageContainer>
  )
}

export default MessagePage
