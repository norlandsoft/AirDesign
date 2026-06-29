# 聊天组件（ChatView / ChatInput）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `air-design` 中新增 `ChatInput`（输入）与 `ChatView`（显示）两个聊天组件，ChatView 正文支持 Markdown 渲染（图片/代码/公式/Mermaid/`<think>`）并针对 Claude Code 标签体系（系统提醒/任务通知/工具调用/工具结果）做定制折叠渲染。

**Architecture:** ChatView 层新增纯函数内容分段器 `segmentClaudeContent`，把 assistant 正文切成有序片段：markdown 片段交给现有 `Markdown` 组件（零改动），其余片段用专用 `TagBlock` 渲染。结构化工具数据（`toolCalls`/`toolResults`）与内联标签共用同一套 `TagBlock`。`ChatInput` 忠实移植 JettoAuthor 实现。

**Tech Stack:** React 18 + TypeScript、air-design（shadcn/Radix + Tailwind + 普通 CSS 文件 + `@/` 别名）、设计 Token（`var(--color-*)`/`var(--font-*)`）。

**验证策略（遵守 CLAUDE.md 规则 6，不写单测）：** 以 `npm run build -w air-design` 构建通过 + `example` 演示页人工渲染为准。

**文件总览：**
- 新建 `packages/air-design/src/components/ChatInput/index.tsx` + `index.css`
- 新建 `packages/air-design/src/components/ChatView/claudeSegments.ts`
- 新建 `packages/air-design/src/components/ChatView/TagBlock.tsx`
- 新建 `packages/air-design/src/components/ChatView/index.tsx` + `index.css`
- 修改 `packages/air-design/src/index.ts`（导出）
- 新建 `example/src/pages/ChatPage.tsx`；修改 `example/src/App.tsx`（导航+路由）
- 更新 `docs/architecture.md`、`packages/air-design/README.md`

---

## Task 1: 建分支

- [ ] **Step 1: 从 master 新建分支**

```bash
git checkout -b feat/chat-components
```

- [ ] **Step 2: 提交设计文档与计划到新分支**

```bash
git add docs/superpowers/specs/2026-06-29-chat-components-design.md docs/superpowers/plans/2026-06-29-chat-components.md
git commit -m "docs(air-design): 新增 ChatView/ChatInput 设计文档与实现计划"
```

> 注：CLAUDE.md 要求 git 提交不带 Co-Authored-By。

---

## Task 2: ChatInput 组件

**Files:**
- Create: `packages/air-design/src/components/ChatInput/index.tsx`
- Create: `packages/air-design/src/components/ChatInput/index.css`

- [ ] **Step 1: 写 `index.tsx`**

```tsx
/**
 * ChatInput 聊天输入组件
 *
 * 自适应高度的多行输入框，支持：
 * - 回车发送、Ctrl/Cmd + Enter 插入换行
 * - 中文输入法（IME）合成期不触发发送
 * - 发送/停止两态按钮（由 finished 控制）
 * - 空内容或 disabled 时不发送；发送后清空并重置高度
 *
 * 设计思路：忠实移植 JettoAuthor apps/web 的 ChatInput，仅将 Less 样式
 * 改写为 air-design 的普通 CSS + 设计 Token，并用 @/ 别名导入兄弟组件。
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'
import './index.css'

/**
 * ChatInput 组件属性
 */
export interface ChatInputProps {
  /** 输入框宽度 */
  width?: number
  /** 高度变化回调（含上下 padding），用于外层布局协调 */
  onHeightChange?: (height: number) => void
  /** 发送消息回调 */
  onSend: (value: string) => void
  /** 占位符 */
  placeholder?: string
  /** 是否显示发送按钮 */
  showSendButton?: boolean
  /** 是否已完成（控制发送/停止态，流式中传 false） */
  finished?: boolean
  /** 发送图标名（默认 send） */
  sendIcon?: string
  /** 是否禁用输入 */
  disabled?: boolean
  /** 最小行数（默认 1） */
  minRows?: number
  /** 自定义类名 */
  className?: string
}

/** 单行高度（line-height 1.5rem ≈ 24px） */
const ROW_HEIGHT = 24
/** 最大高度上限 */
const MAX_HEIGHT = 180

const ChatInput: React.FC<ChatInputProps> = (props) => {
  const {
    width,
    onHeightChange,
    onSend,
    finished = true,
    placeholder = '请输入问题...',
    showSendButton = true,
    sendIcon = 'send',
    disabled = false,
    minRows = 1,
    className,
  } = props

  const minHeight = minRows * ROW_HEIGHT

  const [value, setValue] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showIME, setShowIME] = useState<boolean>(false)

  /** 输入内容变化 */
  const handleTextareaChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
  }, [])

  /** 内容变化时自适应高度 */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px'
      const height = Math.max(minHeight, Math.min(MAX_HEIGHT, textareaRef.current.scrollHeight))
      textareaRef.current.style.height = height + 'px'
      onHeightChange?.(height + 20)
    }
  }, [value, onHeightChange, minHeight])

  /** 发送消息：校验后回调，并清空、重置高度 */
  const handleSendMessage = useCallback((): void => {
    if (value.trim() === '' || !finished || disabled) {
      return
    }
    onSend(value)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = minHeight + 'px'
      onHeightChange?.(minHeight + 20)
    }
  }, [value, finished, disabled, onSend, onHeightChange, minHeight])

  return (
    <div className={cn('chat-input-wrapper', className)} style={{width}}>
      <textarea
        ref={textareaRef}
        className="chat-input"
        value={value}
        disabled={disabled}
        onChange={handleTextareaChange}
        onCompositionStart={() => setShowIME(true)}
        onCompositionEnd={() => setShowIME(false)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            // IME 合成期回车：仅结束合成，不发送
            if (showIME) {
              setShowIME(false)
              return
            }
            // Ctrl/Cmd + Enter：插入换行
            if (event.ctrlKey || event.metaKey) {
              setValue(value + '\n')
              return
            }
            event.preventDefault()
            handleSendMessage()
          }
        }}
        placeholder={placeholder}
        rows={minRows}
        style={{width: showSendButton ? 'calc(100% - 50px)' : 'calc(100% - 10px)'}}
      />
      {showSendButton && (
        <div
          className={cn('chat-input-submit', !(finished && !disabled) && 'chat-input-disabled')}
          onClick={finished && !disabled ? handleSendMessage : undefined}
        >
          <Icon name={finished && !disabled ? sendIcon : 'stop'} size={18}/>
        </div>
      )}
    </div>
  )
}

export default ChatInput
```

> 已知限制（与参考一致）：`Ctrl/Cmd+Enter` 的换行追加在末尾，不保留光标位置。

- [ ] **Step 2: 写 `index.css`**

```css
/*
 * ChatInput 组件样式
 *
 * 输入框 + 发送按钮，颜色引用设计 Token。
 *
 * @author ChaiMingXu, 2026/06/29
 */

.chat-input-wrapper {
  position: relative;
  padding: 8px 0 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-muted);
  overflow: hidden;
  box-sizing: border-box;
}

.chat-input {
  resize: none;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  line-height: 1.5rem;
  background: transparent;
  color: var(--color-foreground);
  padding-right: 8px;
}

.chat-input::placeholder {
  color: var(--color-muted-foreground);
}

.chat-input::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.chat-input::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.2);
}

.chat-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.chat-input-submit {
  position: absolute;
  right: 8px;
  bottom: 4px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-primary);
}

.chat-input-submit:hover {
  background: var(--color-accent);
}

.chat-input-submit.chat-input-disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: transparent;
  color: var(--color-muted-foreground);
}
```

- [ ] **Step 3: 提交**

```bash
git add packages/air-design/src/components/ChatInput
git commit -m "feat(air-design): 新增 ChatInput 聊天输入组件"
```

---

## Task 3: Claude Code 内容分段器

**Files:**
- Create: `packages/air-design/src/components/ChatView/claudeSegments.ts`

- [ ] **Step 1: 写 `claudeSegments.ts`**

```ts
/**
 * Claude Code 内容分段器（纯函数）
 *
 * 将 assistant 消息正文按 Claude Code 标签切分为有序片段，供 ChatView 分别渲染：
 * - <system-reminder>...</system-reminder>           -> system-reminder
 * - <task-notification ...>...</task-notification>   -> task-notification（可带属性）
 * - <tool_use name="X">{json}</tool_use>             -> tool-use
 * - <tool_result>...</tool_result>                   -> tool-result
 * 其余文本 -> markdown（其中 <think>/<antThinking> 仍由 Markdown 组件处理）
 *
 * 流式（streaming=true）时，未闭合的开始标签视为普通文本，待闭合后再分段，
 * 避免解析抖动（与 Markdown 围栏修复同思路）。标签不做嵌套假设，采用非贪婪匹配。
 *
 * 设计思路：纯函数、零副作用、可独立验证；仅扫描 '<' 处尝试匹配，其余字符直接累加。
 *
 * @author ChaiMingXu, 2026/06/29
 */

/** 内容片段类型 */
export type ClaudeSegment =
  | { type: 'markdown'; content: string }
  | { type: 'system-reminder'; content: string }
  | { type: 'task-notification'; content: string; attrs: Record<string, string> }
  | { type: 'tool-use'; name?: string; raw: string }
  | { type: 'tool-result'; raw: string }

/** 需要提取的结构化标签配置：open 为开始标签前缀，close 为结束标签 */
const TAG_SPECS = [
  { segType: 'system-reminder', open: '<system-reminder>', close: '</system-reminder>' },
  { segType: 'task-notification', open: '<task-notification', close: '</task-notification>' },
  { segType: 'tool-use', open: '<tool_use', close: '</tool_use>' },
  { segType: 'tool-result', open: '<tool_result>', close: '</tool_result>' },
] as const

/** 解析属性字符串中的 k="v" 对 */
function parseAttrs(text: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z_][\w-]*)\s*=\s*"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

/**
 * 在 pos 处尝试匹配开始标签
 * - open 以 '>' 结尾：要求精确前缀匹配，无属性
 * - open 不以 '>' 结尾（带属性）：找到下一个 '>'，解析其间的属性
 * 返回 null 表示此处不是该标签的有效开始（含流式中未写完 '>' 的情况）
 */
function matchOpenTag(
  text: string,
  pos: number,
  open: string,
): { attrs: Record<string, string>; contentStart: number } | null {
  if (!text.startsWith(open, pos)) return null
  if (open.endsWith('>')) {
    return { attrs: {}, contentStart: pos + open.length }
  }
  // 带属性：找到 '>' 结束
  const gt = text.indexOf('>', pos + open.length)
  if (gt === -1) return null
  const attrText = text.slice(pos + open.length, gt)
  return { attrs: parseAttrs(attrText), contentStart: gt + 1 }
}

/**
 * 将内容切分为有序片段
 * @param content 原始正文
 * @param opts.streaming 是否流式（影响未闭合标签处理；当前实现已统一按普通文本处理）
 */
export function segmentClaudeContent(
  content: string,
  opts: { streaming?: boolean } = {},
): ClaudeSegment[] {
  const { streaming = false } = opts
  if (!content) return [{ type: 'markdown', content: '' }]

  const segments: ClaudeSegment[] = []
  const n = content.length
  let i = 0
  let textBuf = ''

  /** 把暂存的普通文本冲刷为一个 markdown 片段 */
  const flushText = () => {
    if (textBuf) {
      segments.push({ type: 'markdown', content: textBuf })
      textBuf = ''
    }
  }

  while (i < n) {
    if (content[i] === '<') {
      let matched = false
      for (const spec of TAG_SPECS) {
        const openInfo = matchOpenTag(content, i, spec.open)
        if (!openInfo) continue
        const closeIdx = content.indexOf(spec.close, openInfo.contentStart)
        if (closeIdx === -1) continue // 未闭合（流式中）：交给后续作为普通文本
        flushText()
        const inner = content.slice(openInfo.contentStart, closeIdx)
        switch (spec.segType) {
          case 'system-reminder':
            segments.push({ type: 'system-reminder', content: inner })
            break
          case 'task-notification':
            segments.push({ type: 'task-notification', content: inner, attrs: openInfo.attrs })
            break
          case 'tool-use':
            segments.push({ type: 'tool-use', name: openInfo.attrs.name, raw: inner })
            break
          case 'tool-result':
            segments.push({ type: 'tool-result', raw: inner })
            break
        }
        i = closeIdx + spec.close.length
        matched = true
        break
      }
      if (matched) continue
    }
    textBuf += content[i]
    i++
  }
  flushText()

  // streaming 当前仅作文档约定：未闭合标签已被当作普通文本处理
  void streaming

  return segments.length > 0 ? segments : [{ type: 'markdown', content: '' }]
}
```

- [ ] **Step 2: 提交**

```bash
git add packages/air-design/src/components/ChatView/claudeSegments.ts
git commit -m "feat(air-design): 新增 Claude Code 内容分段器"
```

---

## Task 4: 标签块渲染器 TagBlock

**Files:**
- Create: `packages/air-design/src/components/ChatView/TagBlock.tsx`

> 样式复用 `ChatView/index.css`（由 ChatView 导入，Task 5）。TagBlock 仅在 ChatView 内部使用。

- [ ] **Step 1: 写 `TagBlock.tsx`**

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add packages/air-design/src/components/ChatView/TagBlock.tsx
git commit -m "feat(air-design): 新增 Claude Code 标签块渲染器"
```

---

## Task 5: ChatView 组件

**Files:**
- Create: `packages/air-design/src/components/ChatView/index.tsx`
- Create: `packages/air-design/src/components/ChatView/index.css`

- [ ] **Step 1: 写 `index.tsx`**

```tsx
/**
 * ChatView 聊天消息显示组件
 *
 * 显示 user/assistant 消息列表，支持流式输出与自动滚动。assistant 正文先经
 * Claude Code 内容分段器切分：markdown 片段用 Markdown 渲染（图片/代码/公式/Mermaid/<think>），
 * 系统提醒/任务通知/工具调用/工具结果用专用标签块渲染。
 *
 * 用量与工具元数据亦可由结构化 props（usage/toolCalls/toolResults）提供，追加在正文之后，
 * 复用同一套标签块渲染（与 JettoAuthor renderStreamMeta 位置一致）。
 *
 * 设计思路：移植 JettoAuthor ChatView 结构，标签渲染改为分段器 + TagBlock；
 * 样式由 Less 改写为普通 CSS + 设计 Token。
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import Icon from '@/components/Icon'
import Message from '@/components/Message'
import Markdown from '@/components/Markdown'
import Spin from '@/components/Spin'
import {cn} from '@/lib/cn'
import {segmentClaudeContent, type ClaudeSegment} from './claudeSegments'
import {
  SystemReminderBlock,
  TaskNotificationBlock,
  ToolUseBlock,
  ToolResultBlock,
} from './TagBlock'
import './index.css'

/** 用量信息（<|USAGE|>{json} 解析得到） */
export interface ChatUsage {
  input_tokens?: number
  output_tokens?: number
  cost?: number
  turns?: number
}

/** 单条聊天消息；usage/toolCalls/toolResults 仅在专家模式下由后端推送 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** 本轮用量（json 字符串或对象） */
  usage?: string | ChatUsage | null
  /** 本轮工具调用列表（每项为工具调用 json 字符串） */
  toolCalls?: string[]
  /** 本轮工具结果列表（每项为工具结果文本） */
  toolResults?: string[]
}

/** ChatView 属性 */
export interface ChatViewProps {
  /** 容器高度 */
  height: number
  /** 容器宽度 */
  width: number
  /** 内部列表区域宽度（可选） */
  innerWidth?: number
  /** 聊天消息列表 */
  chatList: ChatMessage[]
  /** 最后一条流式响应内容 */
  lastContent: string
  /** 是否正在加载 */
  loading: boolean
  /** 流式累积用量（json 字符串） */
  lastUsage?: string | null
  /** 流式累积工具调用列表 */
  lastToolCalls?: string[]
  /** 流式累积工具结果列表 */
  lastToolResults?: string[]
  /** 助手名称（默认 MACHINE） */
  assistantName?: string
  /** 列表区域内边距（px）；传 0 取消内边距 */
  contentPadding?: number
  /** 流式等待且无正文时展示 Spin */
  waitingWithSpin?: boolean
  /** 自定义类名 */
  className?: string
}

/** 复制内容到剪贴板并提示 */
function copyToClipboard(content: string) {
  navigator.clipboard
    .writeText(content)
    .then(() => Message.success('内容已复制'))
    .catch(() => Message.error('无法复制到剪贴板，请手动复制'))
}

/** token 数格式化为人类可读形式 */
function formatTokenCount(n: number): string {
  if (n == null || isNaN(n)) return '-'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

/** 安全 json 解析；失败原样返回 */
function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/** 渲染单个片段 */
function renderSegment(seg: ClaudeSegment, key: number, streaming: boolean) {
  switch (seg.type) {
    case 'markdown':
      return <Markdown key={key} content={seg.content} streaming={streaming} onCopyCode={copyToClipboard} />
    case 'system-reminder':
      return <SystemReminderBlock key={key} content={seg.content} />
    case 'task-notification':
      return <TaskNotificationBlock key={key} content={seg.content} attrs={seg.attrs} />
    case 'tool-use':
      return <ToolUseBlock key={key} name={seg.name} raw={seg.raw} />
    case 'tool-result':
      return <ToolResultBlock key={key} raw={seg.raw} />
    default:
      return null
  }
}

/** 正文分段后逐段渲染；纯空内容返回 null */
function renderContent(content: string, streaming: boolean) {
  const segments = segmentClaudeContent(content, {streaming})
  if (
    segments.length === 1 &&
    segments[0].type === 'markdown' &&
    !segments[0].content.trim()
  ) {
    return null
  }
  return segments.map((seg, idx) => renderSegment(seg, idx, streaming))
}

/** 渲染结构化元数据（用量 + 工具调用 + 工具结果） */
function renderStreamMeta(msg: Pick<ChatMessage, 'usage' | 'toolCalls' | 'toolResults'>) {
  const usageRaw = msg.usage
  const toolCalls = msg.toolCalls
  const toolResults = msg.toolResults

  const hasUsage = usageRaw != null && usageRaw !== ''
  const hasToolCalls = !!(toolCalls && toolCalls.length > 0)
  const hasToolResults = !!(toolResults && toolResults.length > 0)
  if (!hasUsage && !hasToolCalls && !hasToolResults) return null

  const usage: ChatUsage | null = hasUsage
    ? typeof usageRaw === 'string'
      ? safeJsonParse(usageRaw)
      : (usageRaw as ChatUsage)
    : null

  return (
    <div className="chat-stream-meta">
      {usage && (
        <div className="chat-usage-row">
          {usage.input_tokens != null && (
            <span className="chat-usage-item">入 {formatTokenCount(usage.input_tokens)} tokens</span>
          )}
          {usage.output_tokens != null && (
            <span className="chat-usage-item">出 {formatTokenCount(usage.output_tokens)} tokens</span>
          )}
          {usage.turns != null && <span className="chat-usage-item">· {usage.turns} 轮</span>}
        </div>
      )}
      {hasToolCalls &&
        toolCalls!.map((raw, idx) => {
          const obj = safeJsonParse(raw)
          return <ToolUseBlock key={`tc-${idx}`} obj={obj} />
        })}
      {hasToolResults &&
        toolResults!.map((raw, idx) => <ToolResultBlock key={`tr-${idx}`} raw={raw} />)}
    </div>
  )
}

const ChatView: React.FC<ChatViewProps> = React.memo((props) => {
  const {
    height,
    width,
    innerWidth,
    chatList,
    lastContent,
    loading,
    lastUsage,
    lastToolCalls,
    lastToolResults,
    assistantName = 'MACHINE',
    contentPadding,
    waitingWithSpin = false,
    className,
  } = props

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 滚动到底部（加载中略延迟以合并多次更新） */
  const scrollToBottom = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
      }
    }, loading ? 50 : 0)
  }, [loading])

  /** 内容变化时自动滚动 */
  useEffect(() => {
    const hasUpdate = chatList.length > 0 || (loading && lastContent !== undefined)
    if (hasUpdate) {
      requestAnimationFrame(() => scrollToBottom())
    }
  }, [chatList, lastContent, scrollToBottom, loading])

  /** 卸载清理 */
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  /** 渲染一条历史消息 */
  const renderMessageItem = useCallback(
    (msg: ChatMessage) => {
      const isUser = msg.role === 'user'
      const userName = isUser ? 'YOU' : assistantName
      return (
        <div className={cn('chat-msg', !isUser && 'chat-msg-assistant')} key={msg.id}>
          <div className="chat-msg-header">
            <span className="chat-msg-avatar">
              <Icon name={isUser ? 'talker' : 'flash'} size={18}/>
            </span>
            <span className="chat-msg-name">{userName}</span>
          </div>
          <div className={cn('chat-msg-content', isUser ? 'chat-msg-user' : 'chat-msg-ai')}>
            {renderContent(msg.content, false)}
          </div>
          {!isUser && renderStreamMeta(msg)}
          {!isUser && (
            <div className="chat-msg-actions">
              <span
                className="chat-msg-action"
                title="复制"
                onClick={() => copyToClipboard(msg.content)}
              >
                <Icon name="copy" size={15}/>
              </span>
            </div>
          )}
        </div>
      )
    },
    [assistantName],
  )

  /** 渲染流式中的临时消息 */
  const renderLoadingMessage = useMemo(() => {
    if (!loading) return null
    return (
      <div className={cn('chat-msg', 'chat-msg-assistant')} key="__streaming__">
        <div className="chat-msg-header">
          <span className="chat-msg-avatar">
            <Icon name="flash" size={18}/>
          </span>
          <span className="chat-msg-name">{assistantName}</span>
        </div>
        <div className="chat-msg-content chat-msg-ai">
          {lastContent.length === 0 ? (
            waitingWithSpin ? (
              <div className="chat-loading-spin">
                <Spin size="small"/>
                <span>等待中...</span>
              </div>
            ) : (
              <div className="chat-loading-text">正在思考...</div>
            )
          ) : (
            renderContent(lastContent, true)
          )}
        </div>
        {renderStreamMeta({
          usage: lastUsage,
          toolCalls: lastToolCalls,
          toolResults: lastToolResults,
        })}
      </div>
    )
  }, [
    loading,
    lastContent,
    assistantName,
    waitingWithSpin,
    lastUsage,
    lastToolCalls,
    lastToolResults,
  ])

  const containerStyle = useMemo(() => ({height, width}), [height, width])

  const innerStyle = useMemo(() => {
    const s: React.CSSProperties = {}
    if (innerWidth) {
      s.width = innerWidth
      s.maxWidth = '100%'
    }
    if (contentPadding !== undefined) {
      s.padding = contentPadding === 0 ? 0 : `0 ${contentPadding}px`
    }
    return s
  }, [innerWidth, contentPadding])

  const isFlush = contentPadding === 0

  return (
    <div
      className={cn('chat-view', isFlush && 'chat-view-flush', className)}
      style={containerStyle}
      ref={messagesEndRef}
    >
      <div className="chat-view-inner" style={innerStyle}>
        {chatList.map(renderMessageItem)}
        {renderLoadingMessage}
      </div>
    </div>
  )
}, (prev, next) => (
  prev.height === next.height &&
  prev.width === next.width &&
  prev.innerWidth === next.innerWidth &&
  prev.chatList === next.chatList &&
  prev.lastContent === next.lastContent &&
  prev.loading === next.loading &&
  prev.lastUsage === next.lastUsage &&
  prev.lastToolCalls === next.lastToolCalls &&
  prev.lastToolResults === next.lastToolResults &&
  prev.assistantName === next.assistantName &&
  prev.contentPadding === next.contentPadding &&
  prev.waitingWithSpin === next.waitingWithSpin &&
  prev.className === next.className
))

ChatView.displayName = 'ChatView'

export default ChatView
```

- [ ] **Step 2: 写 `index.css`**

```css
/*
 * ChatView 组件样式
 *
 * 消息列表、消息项、操作栏、用量行与 Claude Code 标签块。
 * 颜色引用设计 Token；少量语义色用字面量（标签块左边框）。
 *
 * @author ChaiMingXu, 2026/06/29
 */

.chat-view {
  overflow-y: scroll;
  overflow-x: hidden;
  background: var(--color-card);
  font-family: var(--font-sans);
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
}

.chat-view::-webkit-scrollbar {
  width: 8px;
}
.chat-view::-webkit-scrollbar-track {
  background: transparent;
}
.chat-view::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
.chat-view::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

.chat-view-flush {
  margin-bottom: 0;
  justify-content: flex-start;
}

.chat-view-inner {
  width: 100%;
  max-width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
}

/* 消息项 */
.chat-msg {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
}
.chat-msg-assistant {
  border: 1px solid var(--color-border);
  background: var(--color-muted);
}

.chat-msg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.chat-msg-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}
.chat-msg-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-primary);
  user-select: none;
}

.chat-msg-content {
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.6;
  color: var(--color-foreground);
}

/* 操作栏 */
.chat-msg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}
.chat-msg-action {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--color-muted-foreground);
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
}
.chat-msg-action:hover {
  background: var(--color-accent);
  color: var(--color-foreground);
}

/* 加载态 */
.chat-loading-text {
  color: var(--color-muted-foreground);
  font-size: 14px;
  padding: 8px 0;
}
.chat-loading-spin {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-muted-foreground);
  font-size: 13px;
  padding: 8px 0;
}

/* 流式元数据 */
.chat-stream-meta {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.chat-usage-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  font-size: 12px;
  color: var(--color-muted-foreground);
  user-select: none;
}
.chat-usage-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

/* Claude Code 标签块 */
.chat-tag-block {
  margin: 8px 0;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-card);
  font-size: 13px;
  overflow: hidden;
}
.chat-tag-block.chat-tag-info {
  border-left: 3px solid #92c1e3;
}
.chat-tag-block.chat-tag-tool {
  border-left: 3px solid #6f7bf7;
}
.chat-tag-block.chat-tag-success {
  border-left: 3px solid #3fa66a;
}

.chat-tag-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  color: var(--color-muted-foreground);
}
.chat-tag-header:hover {
  background: var(--color-accent);
}
.chat-tag-toggle {
  font-size: 10px;
  color: var(--color-muted-foreground);
}
.chat-tag-icon {
  display: inline-flex;
  color: var(--color-muted-foreground);
}
.chat-tag-title {
  font-weight: 500;
  color: var(--color-foreground);
}
.chat-tag-badge {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-muted-foreground);
  background: var(--color-muted);
  padding: 1px 6px;
  border-radius: 8px;
}

.chat-tag-body {
  padding: 8px 12px;
  border-top: 1px solid var(--color-border);
}
.chat-tag-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-foreground);
  line-height: 1.6;
}
.chat-tag-code {
  margin: 0;
  max-height: 240px;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-foreground);
}
```

- [ ] **Step 3: 提交**

```bash
git add packages/air-design/src/components/ChatView
git commit -m "feat(air-design): 新增 ChatView 聊天显示组件（含 Claude Code 标签渲染）"
```

---

## Task 6: 包入口导出

**Files:**
- Modify: `packages/air-design/src/index.ts`（在 `export {default as Markdown} ...` 一行之后，"复合业务组件"区内追加）

- [ ] **Step 1: 在 `index.ts` 的 Markdown 导出行之后追加 Chat 导出**

定位现有行：
```ts
export {default as Markdown} from './components/Markdown'
```
在其后插入：
```ts

export {default as ChatView} from './components/ChatView'
export type {ChatViewProps, ChatMessage, ChatUsage} from './components/ChatView'

export {default as ChatInput} from './components/ChatInput'
export type {ChatInputProps} from './components/ChatInput'
```

- [ ] **Step 2: 构建验证**

Run: `npm run build -w air-design`
Expected: 构建成功，无 TS 报错。

- [ ] **Step 3: 提交**

```bash
git add packages/air-design/src/index.ts
git commit -m "feat(air-design): 导出 ChatView / ChatInput 组件"
```

---

## Task 7: example 演示页

**Files:**
- Create: `example/src/pages/ChatPage.tsx`
- Modify: `example/src/App.tsx`（import + NAV 项 + Route）

- [ ] **Step 1: 写 `ChatPage.tsx`**

```tsx
/**
 * Chat 聊天组件演示页
 *
 * 演示 ChatInput 输入 + ChatView 显示：包含 Markdown（图片/代码/公式）、
 * Claude Code 标签（系统提醒/任务通知/工具块/思考块），以及结构化工具元数据。
 * 发送后用本地定时器模拟流式逐字输出，再落库为 assistant 消息。
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React, {useRef, useState} from 'react'
import {ChatView, ChatInput, type ChatMessage} from 'air-design'
import PageContainer from '../components/PageContainer'

/** 演示用候选回复：覆盖 Markdown 与各类 Claude Code 标签 */
const SAMPLE_REPLIES = [
  `收到。我可以渲染 **Markdown**：

- 列表项 A
- 列表项 B，含 \`行内代码\`

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}\`
\`\`\`

行内公式 $E=mc^2$，块级公式：

$$\\int_0^1 x^2 dx = \\frac{1}{3}$$

<system-reminder>这是一条系统提醒，默认折叠，不干扰主对话。</system-reminder>

<tool_use name="Bash">{"command":"ls -la","description":"列出当前目录"}</tool_use>

<tool_result>total 0
drwxr-xr-x  2 root root 40 Jun 29 08:00 .
drwxr-xr-x 12 root root 40 Jun 29 08:00 ..</tool_result>

<task-notification state="completed">后台索引任务已完成</task-notification>`,
  `<think>用户想了解能力边界，我需要简明罗列。</think>

好的，ChatView 支持：

1. Markdown 渲染（图片、代码、公式、Mermaid、表格）
2. Claude Code 标签折叠渲染（系统提醒 / 任务通知 / 工具调用 / 工具结果）
3. 流式输出与自动滚动、整条/代码块复制`,
]

/** 自增 id 计数器 */
let idSeq = 1

const ChatPage: React.FC = () => {
  const [chatList, setChatList] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: '你好，我是 MACHINE。在下方输入消息，我会展示 Markdown 与 Claude Code 标签的渲染效果。',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [lastContent, setLastContent] = useState('')
  const replyIdx = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** 发送：追加用户消息，模拟流式回复后落库 */
  const handleSend = (value: string) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const userMsg: ChatMessage = {id: `u-${idSeq++}`, role: 'user', content: value}
    setChatList((list) => [...list, userMsg])
    setLoading(true)
    setLastContent('')

    const reply = SAMPLE_REPLIES[replyIdx.current % SAMPLE_REPLIES.length]
    replyIdx.current++

    let i = 0
    timerRef.current = setInterval(() => {
      i += Math.max(1, Math.round(reply.length / 40))
      setLastContent(reply.slice(0, i))
      if (i >= reply.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        setChatList((list) => [
          ...list,
          {
            id: `a-${idSeq++}`,
            role: 'assistant',
            content: reply,
            toolCalls: ['{"name":"Read","arguments":{"file_path":"/opt/AirDesign/README.md"}}'],
            toolResults: ['# AirDesign\n通用 UI 组件库 + 业务前端脚手架。'],
            usage: '{"input_tokens":1280,"output_tokens":64,"turns":3}',
          },
        ])
        setLastContent('')
        setLoading(false)
      }
    }, 40)
  }

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <PageContainer title="Chat 聊天组件" description="ChatInput 输入 + ChatView 显示（Markdown / Claude Code 标签）。">
      <div className="rounded-lg border border-border bg-card p-3">
        <div style={{height: 420}}>
          <ChatView
            height={420}
            width={820}
            chatList={chatList}
            lastContent={lastContent}
            loading={loading}
          />
        </div>
        <div className="mt-3">
          <ChatInput onSend={handleSend} finished={!loading} width={820}/>
        </div>
      </div>
    </PageContainer>
  )
}

export default ChatPage
```

- [ ] **Step 2: 在 `App.tsx` 增加 import**

在 `import RichEditorPage from './pages/RichEditorPage'` 之后插入：
```ts
import ChatPage from './pages/ChatPage'
```

- [ ] **Step 3: 在 `App.tsx` 的 NAV 数组末尾追加一项**

在 `{key: 'richeditor', ...}` 项之后追加：
```ts
  ,{key: 'chat', icon: 'chat', label: 'Chat 聊天', shortLabel: '聊天'}
```

- [ ] **Step 4: 在 `App.tsx` 的 Routes 内追加路由**

在 `<Route path="richeditor" element={<RichEditorPage/>}/>` 之后插入：
```tsx
            <Route path="chat" element={<ChatPage/>}/>
```

- [ ] **Step 5: 提交**

```bash
git add example/src/pages/ChatPage.tsx example/src/App.tsx
git commit -m "feat(example): 新增 Chat 聊天组件演示页"
```

---

## Task 8: 文档更新与最终验证

**Files:**
- Modify: `packages/air-design/README.md`
- Modify: `docs/architecture.md`

- [ ] **Step 1: 在 `packages/air-design/README.md` 组件清单中追加 ChatView / ChatInput 一行**

在 Markdown 相关条目附近追加：
```md
- ChatView / ChatInput：AI 对话显示与输入组件，正文 Markdown 渲染（图片/代码/公式/Mermaid），并针对 Claude Code 标签（系统提醒/任务通知/工具调用/工具结果）做折叠渲染。
```

- [ ] **Step 2: 在 `docs/architecture.md` 适当位置追加组件说明段落**

```md
### ChatView / ChatInput 聊天组件
- ChatInput：自适应高度输入框，回车发送、Ctrl/Cmd+Enter 换行、IME 处理、发送/停止两态。
- ChatView：消息列表 + 流式输出 + 自动滚动。assistant 正文经 `segmentClaudeContent` 分段器切分：markdown 片段用 Markdown 渲染（图片/代码/公式/Mermaid/`<think>`），系统提醒/任务通知/工具调用/工具结果用专用折叠块渲染；结构化工具数据（toolCalls/toolResults）与内联标签共用同一套标签块。
- Claude Code 标签规格：`<system-reminder>`、`<task-notification>`、`<tool_use name="X">{json}</tool_use>`、`<tool_result>`；流式中未闭合标签按普通文本处理。
```

- [ ] **Step 3: 最终构建验证**

Run: `npm run build -w air-design`
Expected: 成功。

- [ ] **Step 4: 提交**

```bash
git add packages/air-design/README.md docs/architecture.md
git commit -m "docs(air-design): 补充 ChatView/ChatInput 与 Claude Code 标签说明"
```

---

## 验收检查（实现完成后人工确认）

- [ ] `npm run build -w air-design` 通过。
- [ ] `npm run dev -w air-design-example` 启动后，进入 Chat 页：
  - 输入并发送，消息出现在列表，助手流式回复后落库。
  - assistant 回复中：Markdown（粗体/列表/代码块/公式）、`<think>` 思考块、`<system-reminder>`、`<tool_use>`、`<tool_result>`、`<task-notification>` 均按规格折叠渲染。
  - 结构化 toolCalls/toolResults 与用量行显示在正文之后。
  - 自动滚动到底；复制按钮可用。
- [ ] 回车发送、Ctrl/Cmd+Enter 换行、中文输入法不误触发均正常。
