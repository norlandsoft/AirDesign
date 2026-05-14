import React from 'react';
import {connect} from 'umi';
import ChatView, {ChatMessage} from './ChatView';

/**
 * ChatListPage 组件属性接口
 */
interface ChatListPageProps {
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
  /** dispatch函数 */
  dispatch?: any;
  /** 用户信息 */
  user?: any;
}

/**
 * ChatListPage 组件
 * 聊天列表页面组件，展示对话消息列表
 *
 * Created by ChaiMingXu, on 2026/4/29
 */
const ChatListPage: React.FC<ChatListPageProps | any> = (props) => {
  const {
    height,
    width,
    innerWidth,
    chatList,
    lastContent,
    loading,
  } = props;

  return (
      <div style={{height, width, position: 'relative'}}>
        <ChatView
            height={height}
            width={width}
            innerWidth={innerWidth}
            chatList={chatList}
            lastContent={lastContent}
            loading={loading}
        />
      </div>
  );
};

ChatListPage.displayName = 'ChatListPage';

export default connect(({user, chat}: any) => ({
  user,
  chat,
}))(ChatListPage);
