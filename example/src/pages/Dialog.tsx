import { Button, Dialog } from 'air-design'

function DialogPage() {
  const showConfirm = () => {
    Dialog({
      title: '确认操作',
      message: '确定要执行此操作吗？',
      onConfirm: () => {
        console.log('confirmed')
      },
    })
  }

  const showCustom = () => {
    Dialog({
      title: '自定义内容',
      content: <div style={{ padding: 20 }}>这是自定义的 React 内容</div>,
      width: 500,
    })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Dialog 对话框</h2>
        <p>模态对话框，用于重要信息的确认或展示</p>
      </div>

      <div className="demo-section">
        <h3>基础用法</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button type="primary" onClick={showConfirm}>
              确认对话框
            </Button>
            <Button onClick={showCustom}>自定义内容</Button>
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
                  <code>title</code>
                </td>
                <td>对话框标题</td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>message</code>
                </td>
                <td>消息内容</td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>content</code>
                </td>
                <td>自定义 React 内容</td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>width</code>
                </td>
                <td>对话框宽度</td>
                <td>
                  <code>number</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>onConfirm</code>
                </td>
                <td>确认回调</td>
                <td>
                  <code>() =&gt; void</code>
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

export default DialogPage
