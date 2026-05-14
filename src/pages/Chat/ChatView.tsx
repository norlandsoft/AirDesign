import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Icon, Message, Spin} from 'air-design';
import Markdown from '@/components/Markdown';
import styles from './ChatView.less';

import CopyIcon from './Icon_Copy';
import CollectionIcon from './Icon_Collection';

/**
 * 消息接口定义
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * ChatView 组件属性接口
 */
export interface ChatViewProps {
  /** 容器高度 */
  height: number;
  /** 容器宽度（整体宽度） */
  width: number;
  /** 内部列表区域宽度（可选，用于为两侧留出空间） */
  innerWidth?: number;
  /** 聊天消息列表 */
  chatList: ChatMessage[];
  /** 最后一条响应内容（流式输出） */
  lastContent: string;
  /** 是否正在加载 */
  loading: boolean;
  /** 助手名称显示（默认 MACHINE） */
  assistantName?: string;
}

/**
 * ChatView 组件
 * 用于显示聊天消息列表，支持流式输出和自动滚动
 * 使用自定义 Markdown 组件渲染 Markdown 内容，支持数学公式、代码高亮和 Mermaid 图表
 *
 * @author ChaiMingXu
 */
const ChatView: React.FC<ChatViewProps> = React.memo((props) => {
  const {
    height,
    width,
    innerWidth,
    chatList,
    lastContent,
    loading,
    assistantName = 'MACHINE',
  } = props;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentTimeRef = useRef<number>(Date.now());

  // 停顿检测：loading期间超过1.5秒无新内容则显示思考动画
  const [showThinking, setShowThinking] = useState(false);

  // 每次收到新内容时更新时间戳并隐藏思考动画
  useEffect(() => {
    if (loading) {
      lastContentTimeRef.current = Date.now();
      setShowThinking(false);
    }
  }, [lastContent, loading]);

  // 定时检查是否出现停顿
  useEffect(() => {
    if (!loading) {
      setShowThinking(false);
      return;
    }
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastContentTimeRef.current;
      if (elapsed > 1500) {
        setShowThinking(true);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [loading]);

  /**
   * 复制内容到剪贴板
   */
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
        .then(() => {
          Message.success('内容已复制');
        })
        .catch(() => {
          Message.error('无法复制代码到剪贴板，请手动复制');
        });
  }, []);

  /**
   * 滚动到底部函数
   */
  const scrollToBottom = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }, loading ? 50 : 0);
  }, [loading]);

  /**
   * 监听内容变化，自动滚动到底部
   */
  useEffect(() => {
    const hasContentUpdate = chatList.length > 0 || (loading && lastContent !== undefined);

    if (hasContentUpdate) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [chatList, lastContent, scrollToBottom, loading]);

  /**
   * 组件卸载时清理定时器
   */
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  /**
   * 渲染消息项
   */
  const renderMessageItem = useCallback((msg: ChatMessage) => {
    const isUser = msg.role === 'user';
    const userName = isUser ? 'YOU' : assistantName;
    const avatarIcon = isUser ? 'talker' : 'flash';

    return (
        <div
            className={`${styles.messageItem} ${!isUser ? styles.messageItemMachine : ''}`}
            key={msg.id}
            style={{background: isUser ? 'transparent' : '#fafafa'}}
        >
          <div className={styles.messageHeader}>
            <div className={styles.avatar}>
              <Icon name={avatarIcon} size={18}/>
            </div>
            <div className={styles.userName}>{userName}</div>
          </div>
          <div className={`${styles.messageContent} ${isUser ? styles.userMessage : styles.aiMessage}`}>
            <Markdown
                content={msg.content}
                onCopyCode={handleCopy}
            />
          </div>
          {!isUser && (
              <div className={styles.messageActions}>
                <div
                    className={styles.actionButton}
                    onClick={() => handleCopy(msg.content)}
                    title="复制"
                >
                  <CopyIcon/>
                </div>
                <div
                    className={styles.actionButton}
                    title="收藏"
                >
                  <CollectionIcon/>
                </div>
              </div>
          )}
        </div>
    );
  }, [handleCopy, assistantName]);

  /**
   * 渲染加载中的消息
   * 初始等待时显示跳动圆点动画，流式中间停顿时也显示动画
   */
  const renderLoadingMessage = useMemo(() => {
    if (!loading) {
      return null;
    }

    return (
        <div className={`${styles.messageItem} ${styles.messageItemMachine}`} style={{background: '#fafafa'}}>
          <div className={styles.messageHeader}>
            <div className={styles.avatar}>
              <Icon name="flash" size={18}/>
            </div>
            <div className={styles.userName}>{assistantName}</div>
          </div>
          <div className={`${styles.messageContent} ${styles.aiMessage}`}>
            {lastContent.length === 0 ? (
                <Spin/>
            ) : (
                <>
                  <Markdown content={lastContent} onCopyCode={handleCopy}/>
                  {showThinking && <Spin/>}
                </>
            )}
          </div>
        </div>
    );
  }, [loading, lastContent, showThinking, handleCopy, assistantName]);

  const containerStyle = useMemo(() => ({
    height,
    width
  }), [height, width]);

  const innerContainerStyle = useMemo(() => {
    if (innerWidth) {
      return {
        width: innerWidth,
        maxWidth: '100%'
      };
    }
    return undefined;
  }, [innerWidth]);

  return (
      <div
          className={styles.chatView}
          style={containerStyle}
          ref={messagesEndRef}
      >
        <div
            className={styles.innerContainer}
            style={innerContainerStyle}
        >
          {chatList.map(renderMessageItem)}
          {renderLoadingMessage}
        </div>
      </div>
  );
}, (prevProps, nextProps) => {
  return (
      prevProps.height === nextProps.height &&
      prevProps.width === nextProps.width &&
      prevProps.innerWidth === nextProps.innerWidth &&
      prevProps.chatList === nextProps.chatList &&
      prevProps.lastContent === nextProps.lastContent &&
      prevProps.loading === nextProps.loading &&
      prevProps.assistantName === nextProps.assistantName
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;

