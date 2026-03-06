import { useState } from 'react'
import { Icon, Button } from 'air-design'

const allIcons = [
  'add', 'add_folder', 'add_square', 'agent', 'agent_action.code', 'agent_action_agent',
  'agent_action_break', 'agent_action_case', 'agent_action_chat', 'agent_action_code',
  'agent_action_continue', 'agent_action_crawl', 'agent_action_document', 'agent_action_http',
  'agent_action_llm', 'agent_action_loop', 'agent_action_loop_item', 'agent_action_mcp',
  'agent_action_skill', 'agent_action_start', 'agent_action_stop', 'agent_action_todo',
  'agent_action_tool', 'agent_action_youtube', 'apm', 'apps', 'arrow_down', 'attach',
  'attachment', 'auto', 'back', 'branch', 'build', 'calendar', 'cancel', 'capture_screen',
  'case_group', 'chaos', 'chat', 'chat_content', 'chat_topic', 'check', 'check_item',
  'check_list', 'clean', 'close', 'code', 'code_circle', 'code_square', 'columns_1',
  'columns_2', 'command', 'comment', 'config', 'connect', 'creative', 'data', 'data_share',
  'delete', 'desktop', 'detail', 'dialog', 'dialog_filled', 'disconnect', 'docker',
  'document', 'document_add', 'document_edit', 'document_filled', 'dot', 'download',
  'download_square', 'edit', 'exit', 'export', 'file_read', 'filter', 'flash', 'folder',
  'full_screen', 'full_screen_exit', 'generate', 'global', 'group', 'import', 'insight',
  'itemize', 'itemized', 'key', 'library', 'link', 'link_api', 'list', 'load', 'log',
  'manage', 'menu', 'menu_icon', 'mic', 'mic_mute', 'mind_map', 'more', 'network', 'no',
  'note', 'notebook', 'object', 'ok', 'ops', 'option', 'os_android', 'os_harmony',
  'os_ios', 'paas', 'phone', 'pin_window', 'platform_assets', 'plus', 'product', 'project',
  'project_active', 'project_all', 'project_completed', 'project_pending', 'projects',
  'puzzle', 'registry', 'reload', 'remove', 'report', 'resizer', 'rocket', 'save', 'sca',
  'scan', 'script', 'search', 'search_2', 'send', 'server', 'service', 'settings', 'shell',
  'sidebar', 'sign_info', 'sketch', 'skill', 'space', 'star', 'stop', 'storage', 'swagger',
  'sync', 'table_cell_color', 'table_cell_merge', 'table_cell_split', 'table_delete_column',
  'table_delete_row', 'table_insert_column', 'table_insert_row', 'talent', 'talker',
  'tb_import', 'tb_play', 'team', 'time', 'timeline', 'toggle_close', 'toggle_left',
  'toggle_normal', 'toggle_open', 'toggle_right', 'tool', 'upload', 'user', 'work_flow',
  'workspace', 'write', 'yes',
]

function IconPage() {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')

  const filteredIcons = allIcons.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const copyToClipboard = (name: string) => {
    navigator.clipboard.writeText(name)
    setCopied(name)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Icon 图标</h2>
        <p>SVG 图标组件，支持自定义大小、颜色和线条粗细</p>
      </div>

      <div className="demo-section">
        <h3>基础用法</h3>
        <div className="demo-box">
          <div className="demo-row">
            <div className="demo-item">
              <Icon name="folder" size={32} />
              <span className="demo-label">默认</span>
            </div>
            <div className="demo-item">
              <Icon name="folder" size={32} color="#4da6ff" />
              <span className="demo-label">蓝色</span>
            </div>
            <div className="demo-item">
              <Icon name="folder" size={32} color="#ff6b6b" />
              <span className="demo-label">红色</span>
            </div>
            <div className="demo-item">
              <Icon name="folder" size={48} />
              <span className="demo-label">大尺寸</span>
            </div>
            <div className="demo-item">
              <Icon name="folder" size={32} thickness={2.5} />
              <span className="demo-label">粗线条</span>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>图标搜索</h3>
        <div className="demo-box">
          <input
            type="text"
            placeholder="搜索图标..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              marginBottom: 16,
              outline: 'none',
            }}
          />
          <div className="icon-grid">
            {filteredIcons.map((name) => (
              <div
                key={name}
                className="icon-item"
                onClick={() => copyToClipboard(name)}
              >
                <Icon name={name} size={28} color="#333" />
                <span>{copied === name ? '已复制!' : name}</span>
              </div>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 40 }}>
              未找到匹配的图标
            </p>
          )}
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
                  <code>name</code>
                </td>
                <td>图标名称</td>
                <td>
                  <code>string</code>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>
                  <code>size</code>
                </td>
                <td>图标大小</td>
                <td>
                  <code>number</code>
                </td>
                <td>
                  <code>24</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>color</code>
                </td>
                <td>图标颜色</td>
                <td>
                  <code>string</code>
                </td>
                <td>
                  <code>#123F68</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>thickness</code>
                </td>
                <td>线条粗细</td>
                <td>
                  <code>number</code>
                </td>
                <td>
                  <code>1.5</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default IconPage
