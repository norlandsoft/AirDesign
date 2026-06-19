/**
 * Icon 图标 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {Icon} from 'air-design'
import PageContainer from '../components/PageContainer'

// 选取一批代表性图标（完整列表见 components/Icon/svg/）
const ICONS = [
  'add', 'edit', 'delete', 'copy', 'export', 'import', 'save', 'share',
  'download', 'upload', 'search', 'refresh', 'back', 'close', 'more', 'menu',
  'star', 'tag', 'folder', 'document', 'rocket', 'user', 'admin', 'apps',
  'home', 'list', 'settings', 'help', 'yes', 'no', 'chat', 'api',
]

const IconPage: React.FC = () => {
  const [size, setSize] = useState(24)
  const [color, setColor] = useState('var(--color-primary)')

  return (
    <PageContainer title="Icon 图标" description="自有 SVG 图标库（229 个），支持 size / color / thickness。主题适配。">
      <div className="demo-block">
        <div className="demo-row" style={{marginBottom: 20}}>
          <span className="demo-label">尺寸</span>
          {[16, 20, 24, 32, 40].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded px-3 py-1 text-sm ${size === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="demo-row" style={{marginBottom: 20}}>
          <span className="demo-label">颜色</span>
          <input type="color" value={color.startsWith('var') ? '#123F68' : color} onChange={(e) => setColor(e.target.value)}/>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">图标预览</h3>
        <div className="grid grid-cols-8 gap-4">
          {ICONS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-md border border-border p-3 hover:bg-accent">
              <Icon name={name} size={size} color={color}/>
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
        <div className="demo-code">{`<Icon name="add" size={${size}} color="${color}" />`}</div>
      </div>
    </PageContainer>
  )
}

export default IconPage
