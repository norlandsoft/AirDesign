import { Button, Message } from 'air-design'

function MessagePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Message 消息</h2>
        <p>全局消息提示，支持多种类型</p>
      </div>

      <div className="demo-section">
        <h3>消息类型</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button onClick={() => Message.info('这是一条信息提示')}>Info</Button>
            <Button type="primary" onClick={() => Message.success('操作成功！')}>
              Success
            </Button>
            <Button onClick={() => Message.warning('请注意！')}>Warning</Button>
            <Button type="danger" onClick={() => Message.error('操作失败！')}>
              Error
            </Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>自定义时长</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button onClick={() => Message.success('5秒后关闭', 5)}>5秒后关闭</Button>
            <Button onClick={() => Message.info('不会自动关闭', 0)}>不自动关闭</Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>销毁消息</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button
              onClick={() => {
                Message.info('消息1')
                Message.success('消息2')
                Message.warning('消息3')
              }}
            >
              显示多条消息
            </Button>
            <Button type="danger" onClick={() => Message.destroyAll()}>
              销毁全部
            </Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>API</h3>
        <div className="demo-box">
          <table className="props-table">
            <thead>
              <tr>
                <th>方法</th>
                <th>说明</th>
                <th>参数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>Message.info()</code>
                </td>
                <td>信息提示</td>
                <td>
                  <code>content, duration?, onClose?</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Message.success()</code>
                </td>
                <td>成功提示</td>
                <td>
                  <code>content, duration?, onClose?</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Message.warning()</code>
                </td>
                <td>警告提示</td>
                <td>
                  <code>content, duration?, onClose?</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Message.error()</code>
                </td>
                <td>错误提示</td>
                <td>
                  <code>content, duration?, onClose?</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Message.destroy()</code>
                </td>
                <td>销毁指定消息</td>
                <td>
                  <code>key?</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Message.destroyAll()</code>
                </td>
                <td>销毁全部消息</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MessagePage
