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
import {segmentClaudeContent, pairToolCalls, type RenderSegment} from './claudeSegments'
import {
  SystemReminderBlock,
  TaskNotificationBlock,
  ThinkingBlock,
  ToolCallBlock,
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
  /**
   * 本轮工具调用列表（每项为工具调用 json 字符串）
   * @deprecated 已不再单独渲染。工具调用请以正文内联标签 <tool_use> 承载，
   * 由分段器按出现顺序展示。
   */
  toolCalls?: string[]
  /**
   * 本轮工具结果列表（每项为工具结果文本）
   * @deprecated 已不再单独渲染。工具结果请以正文内联标签 <tool_result> 承载，
   * 由分段器按出现顺序展示。
   */
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
  /**
   * 流式累积工具调用列表
   * @deprecated 已不再单独渲染；工具调用请以正文内联标签 <tool_use> 承载。
   */
  lastToolCalls?: string[]
  /**
   * 流式累积工具结果列表
   * @deprecated 已不再单独渲染；工具结果请以正文内联标签 <tool_result> 承载。
   */
  lastToolResults?: string[]
  /** 助手名称（默认 MACHINE） */
  assistantName?: string
  /** 列表区域内边距（px）；传 0 取消内边距 */
  contentPadding?: number
  /** @deprecated 已废弃：loading 时默认展示 Spin，无需再传此 prop */
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

/** 渲染单个片段（配对后的渲染片段） */
function renderSegment(seg: RenderSegment, key: number, streaming: boolean) {
  switch (seg.type) {
    case 'markdown':
      return <Markdown key={key} content={seg.content} streaming={streaming} onCopyCode={copyToClipboard} />
    case 'thinking':
      return <ThinkingBlock key={key} content={seg.content} />
    case 'system-reminder':
      return <SystemReminderBlock key={key} content={seg.content} />
    case 'task-notification':
      return <TaskNotificationBlock key={key} content={seg.content} attrs={seg.attrs} />
    case 'tool-call':
      return <ToolCallBlock key={key} name={seg.name} input={seg.input} output={seg.output} />
    default:
      return null
  }
}

/** 正文先分段再配对工具调用，逐段渲染；纯空内容返回 null */
function renderContent(content: string, streaming: boolean) {
  const atomics = segmentClaudeContent(content, {streaming})
  const segments = pairToolCalls(atomics)
  if (
    segments.length === 1 &&
    segments[0].type === 'markdown' &&
    !segments[0].content.trim()
  ) {
    return null
  }
  return segments.map((seg, idx) => renderSegment(seg, idx, streaming))
}

/** 渲染用量行（仅 token 用量；工具调用/结果改由正文内联标签承载，按出现顺序展示，不再统一置底） */
function renderUsageRow(msg: Pick<ChatMessage, 'usage'>) {
  const usageRaw = msg.usage
  if (usageRaw == null || usageRaw === '') return null
  const usage: ChatUsage | null =
    typeof usageRaw === 'string' ? safeJsonParse(usageRaw) : (usageRaw as ChatUsage)
  if (!usage) return null
  return (
    <div className="chat-usage-row">
      {usage.input_tokens != null && (
        <span className="chat-usage-item">入 {formatTokenCount(usage.input_tokens)} tokens</span>
      )}
      {usage.output_tokens != null && (
        <span className="chat-usage-item">出 {formatTokenCount(usage.output_tokens)} tokens</span>
      )}
      {usage.turns != null && <span className="chat-usage-item">· {usage.turns} 轮</span>}
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
    assistantName = 'MACHINE',
    contentPadding,
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
          {!isUser && renderUsageRow(msg)}
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

  /** 渲染流式中的临时消息；无可见正文时展示 Spin */
  const renderLoadingMessage = useMemo(() => {
    if (!loading) return null
    const streamed =
      lastContent.length > 0 ? renderContent(lastContent, true) : null
    return (
      <div className={cn('chat-msg', 'chat-msg-assistant')} key="__streaming__">
        <div className="chat-msg-header">
          <span className="chat-msg-avatar">
            <Icon name="flash" size={18}/>
          </span>
          <span className="chat-msg-name">{assistantName}</span>
        </div>
        <div className="chat-msg-content chat-msg-ai">
          {streamed ?? (
            <div className="chat-loading-spin">
              <Spin size="small"/>
            </div>
          )}
        </div>
        {renderUsageRow({usage: lastUsage})}
      </div>
    )
  }, [
    loading,
    lastContent,
    assistantName,
    lastUsage,
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
  prev.className === next.className
))

ChatView.displayName = 'ChatView'

export default ChatView
