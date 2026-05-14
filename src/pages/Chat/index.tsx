import React, {useCallback, useEffect, useState} from 'react';
import {connect} from 'umi';
import {Icon, Message} from 'air-design';
import ChatTopic from './ChatTopic';
import ChatListPage from './ChatListPage';
import ChatInput from './ChatInput';
import {POST} from '@/utils/HttpRequest';
import {randomString} from '@/utils/StringUtils';
import styles from './index.less';

// 聊天模式类型：quick-快速模式，expert-专家模式
type ChatMode = 'quick' | 'expert';

/**
 * 统一聊天页面
 *
 * 功能说明：
 * - 合并了普通聊天（快速模式）和智能体聊天（专家模式）
 * - 左侧显示统一的话题列表，通过图标区分模式
 * - 新建对话时选择模式：快速模式使用 Spring AI，专家模式使用 OpenClaw 智能体
 * - 专家模式默认使用 "main" 智能体，可在下拉菜单中选择其他智能体
 *
 * @author ChaiMingXu
 */
const Chat: React.FC<any> = props => {
  const {
    dispatch,
    frameSize,
    chat: {
      currentTopic,
      topicList,
      chatList,
      lastContent,
      loading,
      chatMode
    },
    session: {
      chatUISettings
    },
    agentList
  } = props;

  const [inputHeight, setInputHeight] = useState<number>(80);
  // 附件上传中状态
  const [uploading, setUploading] = useState<boolean>(false);
  // 是否处于欢迎页（新对话）模式
  const isWelcome = !currentTopic && !loading;
  // 左侧折叠
  const [toggleName, setToggleName] = useState<string>('toggle_normal');
  // 专家模式选中的智能体ID
  const [selectedAgentId, setSelectedAgentId] = useState<string>('main');

  const topicWidth = chatUISettings.showTopics ? 255 : 0;
  const togglePosition = Math.max(0, topicWidth - 5);
  const langWidth = frameSize.width - topicWidth - 175;

  // 初始化：加载设置、话题列表和智能体列表
  useEffect(() => {
    const uiSettings = localStorage.getItem('machine/chat/ui/settings');
    if (uiSettings) {
      saveUISettings(JSON.parse(uiSettings));
    }

    // 页面加载时获取话题列表
    dispatch({
      type: 'chat/fetchTopicList'
    });

    // 加载智能体列表（供专家模式使用）
    dispatch({
      type: 'openclaw/fetchOpenclawAgents'
    });

    return () => {
      dispatch({type: 'chat/clearTopic'});
    }
  }, []);

  const saveUISettings = (settings: any) => {
    dispatch({type: 'session/saveChatUISettings', payload: settings});
    localStorage.setItem('machine/chat/ui/settings', JSON.stringify(settings));
  }

  const toggleTopicPanel = () => {
    saveUISettings({
      ...chatUISettings,
      showTopics: !chatUISettings.showTopics
    });
  }

  /**
   * 处理附件上传
   * 由 ChatInput 触发文件选择后回调
   * - 如果已有话题，直接上传文件
   * - 如果没有话题（欢迎页），先创建一个新话题再上传
   */
  const handleAttachmentUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      let topicId = currentTopic;

      // 没有话题时，先创建一个临时话题
      if (!topicId) {
        const createdTopicId = await new Promise<string>((resolve, reject) => {
          dispatch({
            type: 'chat/createTopic',
            payload: {title: '新话题', mode: chatMode, agentId: chatMode === 'expert' ? (selectedAgentId || 'main') : undefined},
            callback: (resp: any) => {
              if (resp?.success && resp.data?.id) {
                resolve(resp.data.id);
              } else {
                reject(new Error(resp?.message || '创建话题失败'));
              }
            }
          });
        });

        topicId = createdTopicId;
        // 切换到新话题，进入对话页面
        dispatch({type: 'chat/saveCurrentTopic', payload: topicId});
        dispatch({type: 'chat/fetchTopicList'});
      }

      // 上传文件
      const token = sessionStorage.getItem('air-machine-token');
      const userId = sessionStorage.getItem('air-machine-user') || '';

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('files', files[i]);
        formData.append('bucket', 'chat');
        formData.append('ownerType', 'chat');
        formData.append('ownerId', topicId);

        const response = await fetch('/rest/platform/storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-User-Id': userId,
          },
          body: formData,
        });

        const resp = await response.json();
        if (!resp.success) {
          Message.error(`文件 "${files[i].name}" 上传失败: ${resp.message || '未知错误'}`);
        }
      }
      Message.success(`成功上传 ${files.length} 个文件`);
    } catch (error: any) {
      Message.error(error.message || '文件上传失败，请检查网络连接');
    } finally {
      setUploading(false);
    }
  }, [currentTopic, dispatch]);

  const sendQuestion = (question: string) => {
    if (!question || !question.trim()) {
      return;
    }

    // 无话题时，先创建临时话题再发送消息
    if (!currentTopic) {
      dispatch({
        type: 'chat/createTopic',
        payload: {title: '新话题', mode: chatMode, agentId: chatMode === 'expert' ? (selectedAgentId || 'main') : undefined},
        callback: (resp: any) => {
          if (resp?.success && resp.data?.id) {
            dispatch({type: 'chat/saveCurrentTopic', payload: resp.data.id});
            dispatch({type: 'chat/fetchTopicList'});
            // 创建成功后发送消息
            doSendQuestion(resp.data.id, question.trim());
          }
        }
      });
      return;
    }

    doSendQuestion(currentTopic, question.trim());
  }

  const doSendQuestion = (topicId: string, question: string) => {
    // 用于保存最终的话题ID
    let finalTopicId = topicId;

    // 保存用户消息
    dispatch({
      type: 'chat/saveChatMessage',
      payload: {
        id: randomString(12),
        role: 'user',
        content: question
      }
    });

    // 清空上次回复内容
    dispatch({
      type: 'chat/updateLastContent',
      payload: ''
    });

    // 构建请求参数：包含模式信息和智能体ID
    const requestPayload: any = {
      topicId: topicId,
      prompt: question
    };

    // 专家模式附加参数：优先使用当前话题的 agentId，其次使用选择器的值
    if (chatMode === 'expert') {
      const currentTopicInfo = topicList.find((t: any) => t.id === topicId);
      requestPayload.mode = 'expert';
      requestPayload.agentId = currentTopicInfo?.agentId || selectedAgentId || 'main';
    }

    // 调用流式接口
    dispatch({
      type: 'chat/streamCompletion',
      payload: requestPayload,
      callback: (data: string) => {
        // 过滤空字符串，避免空内容导致数据拼接错误
        if (!data || data === '') {
          return;
        }

        // 处理特殊标记，按优先级顺序处理
        if (data.startsWith('<|TOPIC_ID|>')) {
          // 收到新创建的话题ID（优先处理，因为需要在流式响应开始前设置话题）
          const newTopicId = data.substring(12); // '<|TOPIC_ID|>' 长度为12
          finalTopicId = newTopicId;

          // 设置当前话题
          dispatch({
            type: 'chat/saveCurrentTopic',
            payload: newTopicId
          });

          // 刷新话题列表
          dispatch({
            type: 'chat/fetchTopicList'
          });

          // 加载该话题的聊天记录（由于是新话题，此时只有用户消息，但为了保持一致性，还是加载一下）
          dispatch({
            type: 'chat/fetchChatList',
            payload: {
              topicId: newTopicId
            }
          });
        } else if (data.startsWith('<|TOPIC_TITLE|>')) {
          // 收到话题标题更新（临时话题生成正式标题后推送）
          const newTitle = data.substring(15); // '<|TOPIC_TITLE|>' 长度为15
          dispatch({
            type: 'chat/updateTopicTitle',
            payload: {topicId: finalTopicId || topicId, title: newTitle}
          });
        } else if (data === '<|OPEN|>') {
          // 流式响应开始，设置 loading 状态
          dispatch({
            type: 'chat/setLoading',
            payload: true
          });
        } else if (data === '<|END|>') {
          // 流式响应结束，保存最后一条消息
          dispatch({
            type: 'chat/saveLastChatMessage',
            payload: randomString(12)
          });

          // 刷新当前话题的聊天列表，确保与数据库同步
          if (finalTopicId) {
            dispatch({
              type: 'chat/fetchChatList',
              payload: {
                topicId: finalTopicId
              }
            });
          }

          // 刷新话题列表（确保标题等信息的最新状态）
          dispatch({
            type: 'chat/fetchTopicList'
          });
        } else if (data === '<|TIMEOUT|>') {
          // 超时处理：显示等待提示，启动后台轮询检测 AI 回复
          const timeoutMsgId = randomString(12);
          dispatch({
            type: 'chat/saveChatMessage',
            payload: {
              id: timeoutMsgId,
              role: 'assistant',
              content: '> 响应超时，AI 可能仍在处理中，正在等待结果...'
            }
          });
          dispatch({
            type: 'chat/updateLastContent',
            payload: ''
          });
          dispatch({
            type: 'chat/setLoading',
            payload: false
          });

          // 轮询兜底：后台 OpenClaw 可能仍在执行，定时检查是否产生了新的 AI 回复
          const pollTopicId = finalTopicId;
          if (pollTopicId) {
            const maxAttempts = 180; // 5秒 * 180 = 最多轮询15分钟
            let attempts = 0;
            const pollTimer = setInterval(async () => {
              attempts++;
              if (attempts >= maxAttempts) {
                clearInterval(pollTimer);
                dispatch({
                  type: 'chat/replaceTimeoutMessage',
                  payload: {
                    timeoutMsgId,
                    actualContent: '> 响应超时，AI 可能仍在处理中，请稍后刷新页面查看结果。'
                  }
                });
                return;
              }

              try {
                const resp: any = await POST('/rest/lang/chat/list', {topicId: pollTopicId});
                if (resp.success && resp.data) {
                  const assistantMsgs = resp.data.filter((m: any) => m.role === 'assistant');
                  const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
                  if (lastAssistant?.content?.trim()) {
                    clearInterval(pollTimer);
                    dispatch({
                      type: 'chat/replaceTimeoutMessage',
                      payload: {
                        timeoutMsgId,
                        actualContent: lastAssistant.content
                      }
                    });
                    dispatch({type: 'chat/fetchTopicList'});
                  }
                }
              } catch (e) {
                // 轮询失败，继续下一轮
              }
            }, 5000);
          }
        } else if (data === '<|ERR|>') {
          // 发生错误，显示友好的错误提示
          dispatch({
            type: 'chat/saveChatMessage',
            payload: {
              id: randomString(12),
              role: 'assistant',
              content: '> 抱歉，服务暂时不可用，请稍后重试。如果问题持续存在，请联系管理员。'
            }
          });
          dispatch({
            type: 'chat/updateLastContent',
            payload: ''
          });
          // 设置 loading 为 false
          dispatch({
            type: 'chat/setLoading',
            payload: false
          });
        } else {
          // 更新流式内容（普通消息内容，确保data不为空）
          dispatch({
            type: 'chat/updateLastContent',
            payload: data
          });
        }
      }
    });
  }

  return (
      <div className={styles.container} style={{width: frameSize.width, height: frameSize.height}}>
        {/* 左侧话题列表 */}
        <div className={styles.topic}
             style={{width: topicWidth, borderRight: chatUISettings.showTopics ? '1px solid #ccc' : 'none'}}>
          <ChatTopic/>
        </div>

        {/* 折叠按钮 */}
        <div className={styles.toggle} style={{left: togglePosition, height: frameSize.height}}>
          <div className={styles.toggleInner}
               onMouseEnter={() => setToggleName(chatUISettings.showTopics ? 'toggle_close' : 'toggle_open')}
               onMouseLeave={() => setToggleName('toggle_normal')}
               onClick={() => {
                 toggleTopicPanel();
                 setToggleName('toggle_normal');
               }}>
            <Icon name={toggleName} size={32} color={'#888'} thickness={3}/>
          </div>
        </div>

        {/* 右侧：聊天session显示区域 */}
        <div className={styles.content} style={{width: frameSize.width - topicWidth, height: frameSize.height}}>
          {/* 中间内容区域：flex:1 自动填充，高度不依赖显式计算 */}
          <div className={styles.body}>
            {/* 欢迎页面：模式切换 + 居中输入框 */}
            {isWelcome && (
              <div className={styles.welcome}>
                <div className={styles.welcomeContent}>
                  {/* 欢迎语 */}
                  <div className={styles.welcomeTitle}>Hi, it's about time.</div>
                  {/* 模式切换 */}
                  <div className={styles.welcomeModeToggle}>
                    <button
                        className={`${styles.modeBtn} ${chatMode === 'quick' ? styles.active : ''}`}
                        onClick={() => dispatch({type: 'chat/saveChatMode', payload: 'quick'})}
                    >
                      快速模式
                    </button>
                    <button
                        className={`${styles.modeBtn} ${chatMode === 'expert' ? styles.active : ''}`}
                        onClick={() => dispatch({type: 'chat/saveChatMode', payload: 'expert'})}
                    >
                      专家模式
                    </button>
                  </div>
                  {/* 欢迎页面居中的输入框，最小3行 */}
                  <div className={styles.welcomeInput}>
                    <ChatInput
                        onHeightChange={setInputHeight}
                        onSend={sendQuestion}
                        finished={!loading}
                        disabled={loading}
                        minRows={3}
                        showAttachmentButton={true}
                        onAttachmentUpload={handleAttachmentUpload}
                        uploading={uploading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 聊天内容区域（有话题或正在加载时显示） */}
            {!isWelcome && (
              <ChatListPage
                  height={frameSize.height - inputHeight - 20}
                  width={frameSize.width - topicWidth}
                  innerWidth={langWidth}
                  chatList={chatList}
                  lastContent={lastContent}
                  loading={loading}
              />
            )}
          </div>

          {/* 底部输入框（仅在有话题或加载中时显示，欢迎页的输入框已在上方居中） */}
          {!isWelcome && (
            <div style={{flexShrink: 0, marginTop: 8, width: '100%', display: 'flex', justifyContent: 'center', paddingRight: 8, paddingBottom: 12, boxSizing: 'border-box'}}>
              <ChatInput
                  width={langWidth}
                  onHeightChange={setInputHeight}
                  onSend={sendQuestion}
                  finished={!loading}
                  disabled={loading}
                  showAttachmentButton={true}
                  onAttachmentUpload={handleAttachmentUpload}
                  uploading={uploading}
              />
            </div>
          )}
        </div>
      </div>
  );
};

export default connect(({global, chat, session, openclaw}: any) => ({
  frameSize: global.frameSize,
  chat,
  session,
  agentList: openclaw?.openclawAgentList || [],
}))(Chat);
