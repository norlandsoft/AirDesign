import { Button, success, info, warning, error } from 'air-design'

function NotificationPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Notification 通知</h2>
        <p>全局通知提醒框，显示在页面角落</p>
      </div>

      <div className="demo-section">
        <h3>通知类型</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button
              onClick={() =>
                info({ title: '信息', message: '这是一条信息通知' })
              }
            >
              Info
            </Button>
            <Button
              type="primary"
              onClick={() =>
                success({ title: '成功', message: '操作成功完成！' })
              }
            >
              Success
            </Button>
            <Button
              onClick={() =>
                warning({ title: '警告', message: '请注意检查！' })
              }
            >
              Warning
            </Button>
            <Button
              type="danger"
              onClick={() =>
                error({ title: '错误', message: '操作失败，请重试' })
              }
            >
              Error
            </Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>无标题通知</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button
              onClick={() =>
                success({ message: '简单成功提示，无标题' })
              }
            >
              无标题通知
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
                  <code>info(options)</code>
                </td>
                <td>信息通知</td>
                <td>
                  <code>{`{ title?, message, duration?, position? }`}</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>success(options)</code>
                </td>
                <td>成功通知</td>
                <td>
                  <code>{`{ title?, message, duration?, position? }`}</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>warning(options)</code>
                </td>
                <td>警告通知</td>
                <td>
                  <code>{`{ title?, message, duration?, position? }`}</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>error(options)</code>
                </td>
                <td>错误通知</td>
                <td>
                  <code>{`{ title?, message, duration?, position? }`}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
