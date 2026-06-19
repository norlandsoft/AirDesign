/**
 * Splitter 分割面板 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {Splitter} from 'air-design'
import PageContainer from '../components/PageContainer'

const SplitterPage: React.FC = () => {
  const [size, setSize] = useState(240)

  return (
    <PageContainer title="Splitter 分割面板" description="可拖拽调整大小，支持折叠。拖动中间分隔条调整两侧比例。">
      <div className="demo-block">
        <div className="text-sm text-muted-foreground" style={{marginBottom: 12}}>左侧当前宽度：{Math.round(size)}px</div>
        <div style={{height: 360, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden'}}>
          <Splitter split="vertical" defaultSize={240} minSize={120} onChange={setSize}>
            <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
              左侧面板
            </div>
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              右侧面板（可折叠）
            </div>
          </Splitter>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">水平分割</h3>
        <div style={{height: 300, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden'}}>
          <Splitter split="horizontal" defaultSize={150} minSize={80}>
            <div className="flex items-center justify-center bg-muted text-sm text-muted-foreground">上</div>
            <div className="flex items-center justify-center text-sm text-muted-foreground">下</div>
          </Splitter>
        </div>
      </div>
    </PageContainer>
  )
}

export default SplitterPage
