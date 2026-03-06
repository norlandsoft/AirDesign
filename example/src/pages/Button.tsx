import { Button } from 'air-design'

function ButtonPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Button 按钮</h2>
        <p>毛玻璃风格按钮，支持多种类型和状态</p>
      </div>

      <div className="demo-section">
        <h3>按钮类型</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button type="default">默认按钮</Button>
            <Button type="primary">主要按钮</Button>
            <Button type="danger">危险按钮</Button>
            <Button type="text">文字按钮</Button>
            <Button type="link">链接按钮</Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>带图标按钮</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button type="primary" icon="plus">
              新建
            </Button>
            <Button icon="edit">编辑</Button>
            <Button type="danger" icon="delete">
              删除
            </Button>
            <Button icon="download">下载</Button>
            <Button icon="upload">上传</Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>加载状态</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button type="primary" loading>
              加载中
            </Button>
            <Button loading>加载中</Button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>禁用状态</h3>
        <div className="demo-box">
          <div className="demo-row">
            <Button type="primary" disabled>
              主要按钮
            </Button>
            <Button disabled>默认按钮</Button>
            <Button type="danger" disabled>
              危险按钮
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
                <th>属性</th>
                <th>说明</th>
                <th>类型</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>type</code>
                </td>
                <td>按钮类型</td>
                <td>
                  <code>default | primary | danger | text | link</code>
                </td>
                <td>
                  <code>default</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>icon</code>
                </td>
                <td>图标名称或 ReactNode</td>
                <td>
                  <code>string | ReactNode</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>loading</code>
                </td>
                <td>加载状态</td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>false</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>disabled</code>
                </td>
                <td>禁用状态</td>
                <td>
                  <code>boolean</code>
                </td>
                <td>
                  <code>false</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>onClick</code>
                </td>
                <td>点击回调</td>
                <td>
                  <code>(event) =&gt; void</code>
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

export default ButtonPage
