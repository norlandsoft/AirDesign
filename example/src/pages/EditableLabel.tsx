import { useState } from 'react'
import { EditableLabel } from 'air-design'

function EditableLabelPage() {
  const [value, setValue] = useState('点击编辑我')

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>EditableLabel 可编辑标签</h2>
        <p>支持点击编辑的标签组件</p>
      </div>

      <div className="demo-section">
        <h3>基础用法</h3>
        <div className="demo-box">
          <div className="demo-row">
            <EditableLabel value={value} onChange={setValue} />
          </div>
          <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.6)' }}>
            当前值: {value}
          </p>
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
                <td>标签值</td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>onChange</code>
                </td>
                <td>值变化回调</td>
                <td>
                  <code>(value: string) =&gt; void</code>
                </td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EditableLabelPage
