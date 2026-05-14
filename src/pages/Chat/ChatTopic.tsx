import React, {useEffect} from "react";
import {connect} from 'umi';
import {ConfigProvider, Form, Input} from 'antd';
import {Dialog, Icon, MenuButton} from 'air-design';
import styles from './ChatTopic.less';

/**
 * 聊天话题列表组件
 *
 * 功能说明：
 * - 显示用户的所有聊天话题（快速模式和专家模式统一展示）
 * - 支持新建对话、选择话题、重命名、删除
 * - 通过图标区分快速模式（dialog）和专家模式（agent，蓝色）
 * - 专家模式话题显示智能体名称标签
 *
 * @author ChaiMingXu
 */

const ChatTopic: React.FC = (props: any) => {

  const {
    dispatch,
    frameSize,
    chat: {
      currentTopic,
      topicList
    },
    agentList,
  } = props;

  // 根据 agentId 查找智能体名称
  const getAgentName = (agentId: string) => {
    if (!agentId || !agentList) return agentId;
    const agent = agentList.find((a: any) => a.id === agentId);
    return agent ? (agent.name || agent.id) : agentId;
  };

  const [menuId, setMenuId] = React.useState('');
  const [renameForm] = Form.useForm();

  useEffect(() => {
    // 页面加载时获取话题列表
    dispatch({
      type: 'chat/fetchTopicList'
    });
  }, []);


  const createNewChat = () => {
    // 清空当前话题，进入欢迎页面
    // 话题在实际操作（发消息或上传文件）时创建
    dispatch({
      type: 'chat/clearTopic'
    });
  }

  const clearTopic = () => {
    dispatch({
      type: 'chat/clearTopic'
    });
  }

  const handleSelectTopic = (id: string) => {
    if (id === currentTopic) return;

    // 查找话题信息，根据 mode 切换聊天模式
    const topic = topicList.find((t: any) => t.id === id);
    if (topic) {
      dispatch({
        type: 'chat/saveChatMode',
        payload: topic.mode === 'expert' ? 'expert' : 'quick'
      });
    }

    clearTopic();

    // 设置当前会话ID
    dispatch({
      type: 'chat/saveCurrentTopic',
      payload: id
    });

    // 加载聊天列表
    dispatch({
      type: 'chat/fetchChatList',
      payload: {
        topicId: id
      }
    });
  }

  const handleRenameChatTopic = (item: any) => {
    renameForm.resetFields();
    Dialog({
      title: '重命名话题',
      content: (
          <ConfigProvider
              prefixCls={"air"}
          >
            <Form form={renameForm}>
              <Form.Item
                  name={'id'}
                  initialValue={item.id}
                  hidden={true}
              >
                <Input/>
              </Form.Item>
              <Form.Item
                  name={'title'}
                  initialValue={item.title || item.name}>
                <Input/>
              </Form.Item>
            </Form>
          </ConfigProvider>
      ),
      onConfirm: (dlg: any) => {
        renameForm.validateFields().then((values: any) => {
          dispatch({
            type: 'chat/updateTopicInfo',
            payload: values,
            callback: resp => {
              if (resp.success) {
                dispatch({
                  type: 'chat/fetchTopicList'
                });
                dlg.doCancel();
              }
            }
          });
        });
      }
    })
  }

  const handleDeleteChatTopic = (item: any) => {
    Dialog({
      title: '删除话题',
      content: <div>即将删除话题: <b>{item.title || item.name}</b></div>,
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'chat/deleteTopicInfo',
          payload: {id: item.id},
          callback: resp => {
            if (resp.success) {
              dispatch({
                type: 'chat/fetchTopicList'
              });

              if (item.id === currentTopic) {
                createNewChat();
              }
              dlg.doCancel();
            }
          }
        });
      }
    });
  }

  const topicMenuItems = item => [
    {
      key: 'rename',
      label: '重命名',
      onClick: () => handleRenameChatTopic(item)
    },
    {
      key: 'del',
      label: '删除',
      onClick: () => handleDeleteChatTopic(item)
    },
  ];

  return (
      <div className={styles.container}>
        <div className={styles.newChat}>
          <div className={styles.newChatBtn} onClick={createNewChat}>
            新建对话
            <Icon name={'chat_topic'} size={20} color={'#222'} thickness={1.8}/>
          </div>
        </div>

        <div className={styles.topic} style={{height: frameSize.height - 60}}>
          {
            topicList.map((item: any) => {
              return (
                  <div
                      className={styles.session}
                      key={item.id}
                      style={item.id === currentTopic ? {background: '#b2d1f5'} : {background: "transparent"}}
                      onClick={() => handleSelectTopic(item.id)}
                      onMouseOver={() => setMenuId(item.id)}
                      onMouseOut={() => setMenuId('')}
                  >
                    <div className={styles.icon}>
                      {item.mode === 'expert' ? (
                        <Icon name={'agent'} size={16} color={'#4a90d9'} thickness={1.5}/>
                      ) : (
                        <Icon name={'dialog'} size={16} thickness={0.1}/>
                      )}
                    </div>
                    <div className={styles.title}>
                      {item.title || item.name}
                    </div>
                    <div className={styles.menu} style={{visibility: 'visible'}}>
                      {
                          menuId === item.id && (
                              <MenuButton
                                  size={22}
                                  innerMargin={0}
                                  style={{background: 'transparent', border: 'none', padding: 0}}
                                  items={topicMenuItems(item)}
                              />
                          )
                      }
                    </div>
                  </div>
              )
            })
          }
        </div>
      </div>
  );
}

export default connect(({global, chat, openclaw}: any) => ({
  frameSize: global.frameSize,
  chat,
  agentList: openclaw?.openclawAgentList || [],
}))(ChatTopic);
