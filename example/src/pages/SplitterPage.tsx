/**
 * Splitter 分割面板 Demo
 *
 * 展示 antd 兼容 API：多面板、layout、百分比、折叠、受控与懒加载。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useRef, useState} from 'react'
import {Splitter} from 'air-design'
import type {SplitterRef} from 'air-design'
import PageContainer from '../components/PageContainer'

const boxStyle: React.CSSProperties = {
  height: 360,
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  overflow: 'hidden',
}

const panelBox = (label: string) => (
  <div className="flex h-full items-center justify-center bg-white text-sm text-muted-foreground">
    {label}
  </div>
)

const SplitterPage: React.FC = () => {
  const [sizes, setSizes] = useState<number[]>([])
  const collapsibleRef = useRef<SplitterRef>(null)

  return (
    <PageContainer
      title="Splitter 分割面板"
      description="对齐 antd Splitter：多面板、layout、百分比尺寸、折叠与拖拽回调。"
    >
      <div className="demo-block">
        <h3 className="demo-section-title">基础用法（左右布局）</h3>
        <div style={boxStyle}>
          <Splitter
            layout="horizontal"
            onResize={(nextSizes) => setSizes(nextSizes)}
          >
            <Splitter.Panel defaultSize="40%" min="20%" max="70%">
              {panelBox('左侧 40%')}
            </Splitter.Panel>
            <Splitter.Panel>{panelBox('右侧自适应')}</Splitter.Panel>
          </Splitter>
        </div>
        {sizes.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            当前尺寸（px）：{sizes.map((s) => Math.round(s)).join(' / ')}
          </div>
        )}
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">垂直布局（上下分栏）</h3>
        <div style={{...boxStyle, height: 320}}>
          <Splitter layout="vertical">
            <Splitter.Panel defaultSize="45%" min="25%">
              {panelBox('上方面板')}
            </Splitter.Panel>
            <Splitter.Panel>{panelBox('下方面板')}</Splitter.Panel>
          </Splitter>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">可折叠面板（无内置按钮，通过 ref 控制）</h3>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => collapsibleRef.current?.collapsePanel(0)}
          >
            折叠左侧
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => collapsibleRef.current?.expandPanel(0)}
          >
            展开左侧
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => collapsibleRef.current?.collapsePanel(1)}
          >
            折叠右侧
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => collapsibleRef.current?.expandPanel(1)}
          >
            展开右侧
          </button>
        </div>
        <div style={boxStyle}>
          <Splitter ref={collapsibleRef} layout="horizontal">
            <Splitter.Panel defaultSize={280} min={120} collapsible>
              {panelBox('可折叠左侧')}
            </Splitter.Panel>
            <Splitter.Panel collapsible>
              {panelBox('可折叠右侧')}
            </Splitter.Panel>
          </Splitter>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">三面板</h3>
        <div style={boxStyle}>
          <Splitter layout="horizontal">
            <Splitter.Panel defaultSize="25%" min="15%">
              {panelBox('导航')}
            </Splitter.Panel>
            <Splitter.Panel defaultSize="50%" min="30%">
              {panelBox('内容区')}
            </Splitter.Panel>
            <Splitter.Panel defaultSize="25%" min="15%" collapsible>
              {panelBox('属性栏')}
            </Splitter.Panel>
          </Splitter>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">懒加载拖拽（lazy）</h3>
        <div style={boxStyle}>
          <Splitter layout="horizontal" lazy>
            <Splitter.Panel defaultSize="35%">
              {panelBox('lazy 左侧')}
            </Splitter.Panel>
            <Splitter.Panel>{panelBox('lazy 右侧')}</Splitter.Panel>
          </Splitter>
        </div>
      </div>
    </PageContainer>
  )
}

export default SplitterPage
