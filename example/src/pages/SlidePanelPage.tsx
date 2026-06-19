/**
 * SlidePanel 侧滑抽屉 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {SlidePanel, Button} from 'air-design'
import PageContainer from '../components/PageContainer'

const SlidePanelPage: React.FC = () => {
  const [openSmall, setOpenSmall] = useState(false)
  const [openLarge, setOpenLarge] = useState(false)

  return (
    <PageContainer title="SlidePanel 侧滑抽屉" description="基于 Radix Sheet，支持 small/default/large/huge/full/custom 尺寸、页脚按钮栏。">
      <div className="demo-block">
        <h3 className="demo-section-title">不同尺寸</h3>
        <div className="demo-row">
          <Button onClick={() => setOpenSmall(true)}>小尺寸 (290)</Button>
          <Button type="primary" onClick={() => setOpenLarge(true)}>大尺寸 (850)</Button>
        </div>
      </div>

      <SlidePanel
        open={openSmall}
        type="small"
        title="设置"
        hasCloseButton
        onConfirm={() => {alert('保存'); setOpenSmall(false)}}
        onClose={() => setOpenSmall(false)}
      >
        <p className="text-sm text-muted-foreground">这是一个小尺寸侧滑面板。</p>
      </SlidePanel>

      <SlidePanel
        open={openLarge}
        type="large"
        title="编辑详情"
        hasCloseButton
        onConfirm={() => {alert('保存'); setOpenLarge(false)}}
        onClose={() => setOpenLarge(false)}
      >
        <p className="text-sm text-muted-foreground">这是一个大尺寸侧滑面板，适合承载复杂表单与详情。</p>
        <div style={{height: 1200}} className="mt-4 rounded bg-muted p-4 text-sm">滚动内容区域…</div>
      </SlidePanel>
    </PageContainer>
  )
}

export default SlidePanelPage
