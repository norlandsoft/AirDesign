/**
 * ColorPicker 颜色选择器 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {ColorPicker} from 'air-design'
import PageContainer from '../components/PageContainer'

const ColorPickerPage: React.FC = () => {
  const [color, setColor] = useState('#123F68')

  return (
    <PageContainer title="ColorPicker 颜色选择器" description="基于 react-colorful + Popover，取色面板 + 预设调色板 + 无背景色。">
      <div className="demo-block">
        <h3 className="demo-section-title">基础用法</h3>
        <div className="demo-row">
          <ColorPicker value={color} onChangeComplete={(c) => setColor(c.toHexString())}>
            <button className="flex items-center gap-2 rounded border border-border px-4 py-2 text-sm hover:bg-accent">
              <span className="size-5 rounded border border-border" style={{backgroundColor: color}}/>
              选择颜色
            </button>
          </ColorPicker>
          <span className="font-mono text-sm">{color}</span>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">应用示例</h3>
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-lg shadow" style={{backgroundColor: color}}/>
          <div className="text-sm text-muted-foreground">上方色块颜色随选择实时变化</div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ColorPickerPage
