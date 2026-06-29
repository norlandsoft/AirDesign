/**
 * ChatInput 聊天输入组件
 *
 * 自适应高度的多行输入框 + 输入框下方工具栏，支持：
 * - 回车发送、Ctrl/Cmd + Enter 插入换行
 * - 中文输入法（IME）合成期不触发发送
 * - 发送/停止两态按钮（由 finished 控制），位于工具栏右侧
 * - 工具栏左侧首个"附件"按钮：点击触发隐藏的 <input type="file">，
 *   选中后通过 onFileUpload 回调上抛 File[]，由消费方自行上传/预览
 * - 空内容或 disabled 时不发送；发送后清空并重置高度
 *
 * 设计思路：忠实移植 JettoAuthor apps/web 的 ChatInput，并按参考图在其下方
 * 增加一条左(工具)/右(发送)分布的工具栏；样式改写为 air-design 的普通 CSS +
 * 设计 Token，用 @/ 别名导入兄弟组件。高度回调改为测量 wrapper 真实高度，
 * 自动兼容工具栏的存在。
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
  /** 高度变化回调（wrapper 真实高度，含工具栏），用于外层布局协调 */
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
  /** 是否显示工具栏左侧的附件按钮（默认 true） */
  showAttachment?: boolean
  /** 附件选择回调，返回用户选中的文件列表 */
  onFileUpload?: (files: File[]) => void
  /** 文件选择框 accept 属性（如 "image/*"），默认不限 */
  accept?: string
  /** 是否允许多选（默认 true） */
  multiple?: boolean
}

/** 单行高度（line-height 1.5rem ≈ 24px） */
const ROW_HEIGHT = 24
/** textarea 最大高度上限 */
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
    showAttachment = true,
    onFileUpload,
    accept,
    multiple = true,
  } = props

  const minHeight = minRows * ROW_HEIGHT

  const [value, setValue] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showIME, setShowIME] = useState<boolean>(false)

  /** 输入内容变化 */
  const handleTextareaChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
  }, [])

  /** 内容变化时自适应高度，并上抛 wrapper 真实高度 */
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = '20px'
      const height = Math.max(minHeight, Math.min(MAX_HEIGHT, textarea.scrollHeight))
      textarea.style.height = height + 'px'
    }
    // 测量 wrapper（含工具栏）的真实高度，兼容工具栏有无
    if (onHeightChange) {
      // offsetHeight 在设置 textarea 高度后同步反映布局
      const measured = wrapperRef.current?.offsetHeight ?? 0
      if (measured > 0) onHeightChange(measured)
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
      onHeightChange?.(wrapperRef.current?.offsetHeight ?? minHeight + 20)
    }
  }, [value, finished, disabled, onSend, onHeightChange, minHeight])

  /** 点击附件按钮：触发隐藏的文件选择框 */
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /** 文件选中：上抛 File[] 并重置 input，便于重复选择同一文件 */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files
      const files = list ? Array.from(list) : []
      if (files.length > 0) {
        onFileUpload?.(files)
      }
      event.target.value = ''
    },
    [onFileUpload],
  )

  // 工具栏只要存在附件或发送按钮即渲染
  const showToolbar = showAttachment || showSendButton

  return (
    <div className={cn('chat-input-wrapper', className)} style={{width}} ref={wrapperRef}>
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
      />

      {/* 工具栏：左侧工具按钮（首个为附件），右侧发送按钮 */}
      {showToolbar && (
        <div className="chat-input-toolbar">
          <div className="chat-input-toolbar-left">
            {showAttachment && (
              <span
                className="chat-input-tool-btn"
                title="添加附件"
                onClick={handleAttachClick}
              >
                <Icon name="attachment" size={18}/>
              </span>
            )}
          </div>
          {showSendButton && (
            <div
              className={cn(
                'chat-input-submit',
                !(finished && !disabled) && 'chat-input-disabled',
              )}
              onClick={finished && !disabled ? handleSendMessage : undefined}
            >
              <Icon name={finished && !disabled ? sendIcon : 'stop'} size={18}/>
            </div>
          )}
        </div>
      )}

      {/* 隐藏的文件选择框 */}
      <input
        ref={fileInputRef}
        type="file"
        className="chat-input-file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  )
}

export default ChatInput
