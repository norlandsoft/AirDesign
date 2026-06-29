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
