/**
 * Spin / LoadingPanel 反馈组件 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {Spin, LoadingPanel, Skeleton, Button} from 'air-design'
import PageContainer from '../components/PageContainer'

const FeedbackPage: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <PageContainer title="Spin / LoadingPanel 加载反馈" description="三圆点加载动画、内容遮罩、全屏加载、骨架屏。">
      <div className="demo-block">
        <h3 className="demo-section-title">Spin 尺寸</h3>
        <div className="demo-row" style={{gap: 40}}>
          <Spin loading size="small"/>
          <Spin loading size="default"/>
          <Spin loading size="large"/>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">Spin 包裹内容（加载遮罩）</h3>
        <Spin loading>
          <div className="rounded border border-border p-6 text-sm">这是被 Spin 包裹的内容，loading 时会出现半透明遮罩。</div>
        </Spin>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">Skeleton 骨架屏</h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-3/4"/>
          <Skeleton className="h-4 w-1/2"/>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">LoadingPanel 全屏加载</h3>
        <Button type="primary" onClick={() => {setFullscreen(true); setTimeout(() => setFullscreen(false), 2000)}}>
          显示全屏加载 2 秒
        </Button>
        <LoadingPanel loading={fullscreen} message="正在加载..."/>
      </div>
    </PageContainer>
  )
}

export default FeedbackPage
