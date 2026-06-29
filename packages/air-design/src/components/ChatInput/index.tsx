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
