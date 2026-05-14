import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Icon} from 'air-design';
import styles from './ChatInput.less';

/**
 * ChatInput 组件属性接口
 */
interface ChatInputProps {
  /** 输入框宽度 */
  width?: number;
  /** 高度变化回调 */
  onHeightChange?: (height: number) => void;
  /** 发送消息回调 */
  onSend: (value: string) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否显示发送按钮 */
  showSendButton?: boolean;
  /** 是否已完成（用于控制发送按钮状态） */
  finished?: boolean;
  /** 发送图标名称 */
  sendIcon?: string;
  /** 是否禁用输入 */
  disabled?: boolean;
  /** 是否显示附件上传按钮 */
  showAttachmentButton?: boolean;
  /** 附件上传回调，由页面实现具体的上传逻辑。传入 null 表示正在上传中（用于显示loading状态） */
  onAttachmentUpload?: (files: FileList | null) => void;
  /** 是否正在上传附件（由页面控制，用于显示上传中状态） */
  uploading?: boolean;
  /** textarea 最小行数，默认1 */
  minRows?: number;
}

/**
 * ChatInput 组件
 * 聊天输入框组件，支持多行输入、自动调整高度、回车发送、附件选择等功能
 *
 * 附件上传说明：
 * - 点击附件按钮弹出文件选择器，选择文件后通过 onAttachmentUpload 回调将文件列表传给页面
 * - 组件本身不处理上传逻辑，只负责文件选择和UI交互
 *
 * @author ChaiMingXu
 */
const ChatInput: React.FC<ChatInputProps> = (props: ChatInputProps) => {
  const {
    width,
    onHeightChange,
    onSend,
    finished = true,
    placeholder = '请输入问题...',
    showSendButton = true,
    sendIcon = 'send',
    disabled = false,
    showAttachmentButton = false,
    onAttachmentUpload,
    uploading = false,
    minRows = 1,
  } = props;

  const [value, setValue] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showIME, setShowIME] = useState<boolean>(false);

  /**
   * 监听 textarea 内容变化，自动调整高度
   */
  const handleTextareaChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  }, []);

  // 每行高度 24px（line-height 1.5rem = 24px），最小高度基于 minRows
  const minTextHeight = minRows * 24;

  /**
   * 在组件加载后和内容变化时，调整高度
   *
   * 向父组件报告的是 wrapper 的总高度（textarea + padding + 工具栏 + border），
   * 用于计算聊天内容区域可用高度。
   * 固定部分高度：chatInputArea padding(14) + chatToolbar(44) + border(2) = 60
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const textHeight = Math.max(minTextHeight, Math.min(180, scrollHeight));
      textareaRef.current.style.height = textHeight + 'px';
      if (onHeightChange) {
        onHeightChange(textHeight + 60);
      }
    }
  }, [value, onHeightChange, minTextHeight]);

  /**
   * 发送消息
   */
  const handleSendMessage = useCallback((): void => {
    if (value.trim() === '' || !finished || disabled) {
      return;
    }
    onSend(value);
    setValue('');
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = minTextHeight + 'px';
      if (onHeightChange) {
        onHeightChange(minTextHeight + 60);
      }
    }
  }, [value, finished, disabled, onSend, onHeightChange]);

  /**
   * 处理附件按钮点击，触发隐藏的文件选择器
   */
  const handleAttachmentClick = useCallback(() => {
    if (uploading) return;
    fileInputRef.current?.click();
  }, [uploading]);

  /**
   * 文件选择后，将文件列表通过回调传给页面处理
   */
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onAttachmentUpload) {
      onAttachmentUpload(files);
    }
    // 清空文件选择器，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onAttachmentUpload]);

  return (
      <div className={styles.chatInputWrapper} style={{width}}>
        {/* 输入区域：textarea 占据整行 */}
        <div className={styles.chatInputArea}>
          <textarea
              ref={textareaRef}
              id="air-chat-input"
              value={value}
              onChange={handleTextareaChange}
              disabled={disabled}
              onCompositionStart={() => {
                setShowIME(true);
              }}
              onCompositionEnd={() => {
                setShowIME(false);
              }}
              // 回车发送
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  if (showIME) {
                    setShowIME(false);
                    return;
                  }
                  if (event.ctrlKey || event.metaKey) {
                    setValue(value + '\n');
                    return;
                  }
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              className={styles.chatInput}
              placeholder={placeholder}
              rows={1}
          />
        </div>

        {/* 工具栏：左侧工具按钮，右侧发送按钮 */}
        <div className={styles.chatToolbar}>
          <div className={styles.chatToolbarLeft}>
            {/* 附件上传按钮：点击后弹出文件选择器 */}
            {showAttachmentButton && (
                <div
                    className={`${styles.chatToolbarBtn} ${uploading ? styles.uploading : ''}`}
                    onClick={handleAttachmentClick}
                    title={uploading ? '正在上传...' : '上传附件'}
                >
                  <Icon name={uploading ? 'loading' : 'attachment'} size={16}/>
                </div>
            )}
            {/* 隐藏的文件选择器 */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{display: 'none'}}
                onChange={handleFileChange}
            />
          </div>
          {showSendButton && (
              <div
                  className={`${styles.chatInputSubmit} ${finished && !disabled ? '' : styles.chatInputDisabled}`}
                  onClick={finished && !disabled ? handleSendMessage : undefined}
              >
                <Icon name={finished && !disabled ? sendIcon : 'stop'} size={18}/>
              </div>
          )}
        </div>
      </div>
  );
};

export default ChatInput;
