import { useState } from 'react'
import { ColorPicker } from 'air-design'

function ColorPickerPage() {
  const [color, setColor] = useState('#123F68')

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>ColorPicker 颜色选择器</h2>
        <p>基于 Ant Design 封装的颜色选择器，支持预设颜色</p>
      </div>

      <div className="demo-section">
        <h3>基础用法</h3>
        <div className="demo-box">
          <div className="demo-row">
            <ColorPicker value={color} onChangeComplete={(c) => setColor(c.toHexString())}>
              <div
                style={{
                  width: 60,
                  height: 32,
                  background: color,
                  borderRadius: 6,
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
            </ColorPicker>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              当前颜色: {color}
            </span>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>API</h3>
        <div className="demo-box">
          <table className="props-table">
            <thead>
              <tr>
                <th>属性</th>
                <th>说明</th>
                <th>类型</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>value</code>
                </td>
                <td>当前颜色值</td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>onChangeComplete</code>
                </td>
                <td>颜色变化完成回调</td>
                <td>
                  <code>(color) =&gt; void</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>trigger</code>
                </td>
                <td>触发方式</td>
                <td>
                  <code>click | hover</code>
                </td>
                <td>
                  <code>click</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>presetColors</code>
                </td>
                <td>预设颜色配置</td>
                <td>
                  <code>PresetColorConfig</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>popupWidth</code>
                </td>
                <td>弹窗宽度</td>
                <td>
                  <code>number</code>
                </td>
                <td>
                  <code>375</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ColorPickerPage
