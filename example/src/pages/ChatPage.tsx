/**
 * Chat 聊天组件演示页
 *
 * 演示 ChatInput 输入 + ChatView 显示：包含 Markdown（图片/代码/公式）、
 * Claude Code 标签（系统提醒/任务通知/工具块/思考块），以及结构化工具元数据。
 * 发送后用本地定时器模拟流式逐字输出，再落库为 assistant 消息。
 *
 * @author ChaiMingXu, 2026/06/29
 */
import React, {useEffect, useRef, useState} from 'react'
import {ChatView, ChatInput, Message, type ChatMessage} from 'air-design'
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

  /** 附件选择回调（示例仅提示；实际项目在此上传到后端并生成预览） */
  const handleFileUpload = (files: File[]) => {
    Message.success(`已添加 ${files.length} 个附件：${files.map((f) => f.name).join('、')}`)
  }

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

  /** 卸载时清理定时器 */
  useEffect(() => {
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
          <ChatInput onSend={handleSend} onFileUpload={handleFileUpload} finished={!loading} width={820}/>
        </div>
      </div>
    </PageContainer>
  )
}

export default ChatPage
