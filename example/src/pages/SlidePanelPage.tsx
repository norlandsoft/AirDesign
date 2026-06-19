/**
 * SlidePanel 侧滑抽屉 Demo
 *
 * 展示所有尺寸：small / default / large / huge / full / custom，以及页脚按钮栏、内嵌抽屉。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {SlidePanel, Button} from 'air-design'
import PageContainer from '../components/PageContainer'

type PanelType = 'small' | 'default' | 'large' | 'huge' | 'full' | 'custom'

const SIZES: {type: PanelType; label: string; width: number; desc: string}[] = [
  {type: 'small', label: 'small', width: 290, desc: '290px · 轻量设置/筛选'},
  {type: 'default', label: 'default', width: 378, desc: '378px · 标准面板'},
  {type: 'large', label: 'large', width: 850, desc: '850px · 详情/表单'},
  {type: 'huge', label: 'huge', width: 1280, desc: '1280px · 全功能编辑'},
  {type: 'full', label: 'full', width: 0, desc: '100% · 全屏'},
  {type: 'custom', label: 'custom', width: 480, desc: '自定义宽度 480px'},
]

const SlidePanelPage: React.FC = () => {
  const [active, setActive] = useState<PanelType | null>(null)

  // 内嵌抽屉演示
  const [showInner, setShowInner] = useState(false)

  const current = SIZES.find((s) => s.type === active)

  return (
    <PageContainer title="SlidePanel 侧滑抽屉" description="基于 Radix Sheet，支持 small/default/large/huge/full/custom 六种尺寸、页脚按钮栏、内嵌抽屉。">
      <div className="demo-block">
        <h3 className="demo-section-title">所有尺寸</h3>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((s) => (
            <Button key={s.type} type={active === s.type ? 'primary' : 'default'} onClick={() => setActive(s.type)}>
              {s.label}
            </Button>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {current ? `当前：${current.label} · ${current.desc}` : '点击按钮打开对应尺寸的侧滑面板'}
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">内嵌抽屉</h3>
        <Button onClick={() => {setActive('default'); setShowInner(false)}}>打开面板（含内嵌抽屉）</Button>
        <div className="mt-2 text-xs text-muted-foreground">打开后点击内容区「打开内嵌抽屉」按钮</div>
      </div>

      {/* 统一渲染：根据 active 动态切换尺寸 */}
      <SlidePanel
        open={!!active}
        type={active ?? 'default'}
        width={current?.type === 'custom' ? 480 : current?.width}
        title={`SlidePanel · ${current?.label ?? ''}`}
        hasCloseButton
        hasButtonBar
        confirmButtonText="保存"
        closeButtonText="取消"
        onConfirm={() => {alert('已保存'); setActive(null)}}
        onClose={() => {setActive(null); setShowInner(false)}}
        // 内嵌抽屉演示（仅 default 尺寸且非全屏时展示按钮）
        innerDrawer={
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">内嵌抽屉</h4>
            <p className="text-sm text-muted-foreground">这是在主面板内叠加的第二层抽屉，常用于级联编辑。</p>
          </div>
        }
        showInnerDrawer={showInner}
        innerDrawerWidth={420}
        onInnerClose={() => setShowInner(false)}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            尺寸：<strong>{current?.label}</strong>，宽度 {current?.type === 'full' ? '100%' : `${current?.width}px`}。
          </p>
          <p className="text-sm text-muted-foreground">{current?.desc}</p>

          {/* 内容占位，演示滚动 */}
          <div className="space-y-2">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="rounded border border-border p-3 text-sm">
                示例内容块 #{i + 1}
              </div>
            ))}
          </div>

          {/* 内嵌抽屉触发按钮 */}
          <Button size="sm" onClick={() => setShowInner(true)}>打开内嵌抽屉</Button>
        </div>
      </SlidePanel>
    </PageContainer>
  )
}

export default SlidePanelPage
