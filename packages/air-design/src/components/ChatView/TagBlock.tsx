/**
 * Claude Code 标签块渲染器
 *
 * 渲染分段器产出的结构化片段，以及结构化工具数据（toolCalls/toolResults）：
 * - SystemReminderBlock：折叠"系统提醒"块
 * - TaskNotificationBlock：任务通知块（可带 state 徽标）
 * - ToolUseBlock：工具调用块（工具图标 + 名称 + 参数，等宽可折叠）
 * - ToolResultBlock：工具结果块（等宽、限高滚动）
 *
 * 设计思路：以通用 CollapsibleBlock 为外壳，按 tone 区分配色；工具块支持
 * 内联 raw（json 字符串）与已解析 obj 两种入参，统一字段兼容。
 *
 * 样式复用 ChatView/index.css（由 ChatView 导入，本组件仅在 ChatView 内部使用）。
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React, {useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

/** 工具名 -> 图标名（Claude Code 常见工具） */
function getToolIcon(name?: string): string {
  if (!name) return 'tool'
  const n = name.toLowerCase()
  if (n === 'bash' || n === 'shell') return 'shell'
  if (n === 'read' || n === 'file_read') return 'file_read'
  if (n === 'edit') return 'edit'
  if (n === 'write') return 'write'
  if (n === 'glob' || n === 'grep' || n === 'search') return 'search'
  if (n === 'code' || n === 'codeeditor') return 'code'
  return 'tool'
}

/** 安全解析 json 字符串；失败原样返回 */
function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/** 色调：info=系统提醒/任务通知，tool=工具调用，success=工具结果 */
type Tone = 'info' | 'tool' | 'success'

interface CollapsibleBlockProps {
  icon: string
  title: string
  badge?: string
  defaultOpen?: boolean
  tone?: Tone
  children: React.ReactNode
}

/** 通用折叠块外壳：标题行（图标+标题+徽标）+ 可展开正文 */
const CollapsibleBlock: React.FC<CollapsibleBlockProps> = ({
  icon,
  title,
  badge,
  defaultOpen = false,
  tone = 'info',
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('chat-tag-block', `chat-tag-${tone}`)}>
      <div className="chat-tag-header" onClick={() => setOpen((o) => !o)}>
        <span className="chat-tag-toggle">{open ? '▼' : '▶'}</span>
        <span className="chat-tag-icon">
          <Icon name={icon} size={14}/>
        </span>
        <span className="chat-tag-title">{title}</span>
        {badge && <span className="chat-tag-badge">{badge}</span>}
      </div>
      {open && <div className="chat-tag-body">{children}</div>}
    </div>
  )
}

/** 系统提醒块 */
export const SystemReminderBlock: React.FC<{ content: string }> = ({content}) => (
  <CollapsibleBlock icon="info" title="系统提醒" tone="info">
    <div className="chat-tag-text">{content}</div>
  </CollapsibleBlock>
)

/** 任务通知块（attrs.state 显示为徽标） */
export const TaskNotificationBlock: React.FC<{
  content: string
  attrs: Record<string, string>
}> = ({content, attrs}) => (
  <CollapsibleBlock icon="task" title="任务通知" badge={attrs.state || undefined} tone="info">
    <div className="chat-tag-text">{content}</div>
  </CollapsibleBlock>
)

/** 工具调用块：接受内联 raw(json) 或已解析 obj */
export const ToolUseBlock: React.FC<{ name?: string; raw?: string; obj?: any }> = ({
  name,
  raw,
  obj,
}) => {
  const data = obj !== undefined ? obj : raw !== undefined ? safeJsonParse(raw) : {}
  const toolName =
    name || data?.name || data?.tool_name || data?.function?.name || '工具'
  const args =
    data?.arguments ?? data?.args ?? data?.parameters ?? (typeof data === 'object' ? data : null)
  const argsText = typeof args === 'string' ? args : args == null ? '' : JSON.stringify(args, null, 2)
  return (
    <CollapsibleBlock icon={getToolIcon(toolName)} title={toolName} tone="tool">
      <pre className="chat-tag-code">{argsText}</pre>
    </CollapsibleBlock>
  )
}

/** 工具结果块 */
export const ToolResultBlock: React.FC<{ raw: string }> = ({raw}) => (
  <CollapsibleBlock icon="ok" title="工具结果" tone="success">
    <pre className="chat-tag-code">{raw}</pre>
  </CollapsibleBlock>
)
