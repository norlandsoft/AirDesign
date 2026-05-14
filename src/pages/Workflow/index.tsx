import React, {useEffect, useState} from "react";
import {connect} from "umi";
import {Dialog, Icon, IconButton, ToggleButton, warn} from 'air-design';
import {Form, Input, Tag} from 'antd';
import WorkflowInfo from './WorkflowInfo';
import styles from './index.less';

const Agent: React.FC<any> = props => {

  const {
    dispatch,
    frameSize
  } = props;

  const [showMenu, setShowMenu] = useState(true);
  const [newAgentForm] = Form.useForm();

  const [agentList, setAgentList] = useState<any[]>([]);
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [showStar, setShowStar] = useState(false);

  const menuWidth = showMenu ? 300 : 40;

  useEffect(() => {
    loadAgentList();
  }, []);

  const loadAgentList = () => {
    dispatch({
      type: 'workflow/fetchWorkflowList',
      payload: {},
      callback: resp => {
        if (resp.success) {
          setAgentList(resp.data);
        }
      }
    });
  }

  const showCreateAgentDialog = () => {
    newAgentForm.resetFields();
    Dialog({
      title: '创建智能工作流',
      content: (
          <Form form={newAgentForm} layout="horizontal">
            <Form.Item label="名称" name="name">
              <Input/>
            </Form.Item>
            <Form.Item label="描述" name="description">
              <Input.TextArea/>
            </Form.Item>
          </Form>
      ),
      onConfirm: dlg => {
        newAgentForm.validateFields().then(values => {
          if (values.name) {
            dispatch({
              type: 'workflow/saveWorkflow',
              payload: {
                ...values,
                scope: 'private'
              },
              callback: resp => {
                loadAgentList();

                dlg.doCancel();
              }
            });
          } else {
            warn({
              message: '请输入智能工作流名称'
            });
          }
        });
      }
    });
  }

  return (
      <div className={'air-nav-page'} style={{width: frameSize.width, height: frameSize.height}}>
        {/*分成左右两部分*/}
        <div className={'air-nav-page-menu'} style={{width: menuWidth}}>
          {
            showMenu ? (
                <>
                  <div className={'air-nav-page-menu-toolbar'}>
                    智能工作流
                    <div style={{display: 'flex', alignItems: 'center', marginTop: 2, gap: 2}}>
                      <IconButton icon={'add_square'} size={28} shape={'circle'} onClick={showCreateAgentDialog}/>
                      <IconButton icon={'import'} size={28} shape={'circle'}/>
                      <ToggleButton
                          icon='star'
                          size={28}
                          shape={'circle'}
                          selected={showStar}
                          onClick={() => {
                            setShowStar(!showStar);
                          }}
                          border={false}
                      />
                      <ToggleButton icon={'filter'} size={28} shape={'circle'} selected={false} onClick={() => {
                      }}/>
                      <IconButton icon={'toggle_left'} size={28} shape={'circle'}
                                  onClick={() => setShowMenu(!showMenu)}/>
                    </div>
                  </div>
                  <div className={'air-nav-page-menu-body'} style={{height: frameSize.height - 50}}>
                    {
                      agentList.map((item: any) => {
                        const scopeTag = (() => {
                          switch (item.scope) {
                            case 'system': return <Tag color="blue" style={{margin: 0, padding: '0 4px', fontSize: '0.65rem', lineHeight: '16px'}}>系统</Tag>;
                            case 'public': return <Tag color="green" style={{margin: 0, padding: '0 4px', fontSize: '0.65rem', lineHeight: '16px'}}>公共</Tag>;
                            case 'private': return <Tag color="orange" style={{margin: 0, padding: '0 4px', fontSize: '0.65rem', lineHeight: '16px'}}>私有</Tag>;
                            default: return null;
                          }
                        })();
                        return (
                            <div className={styles['agent-list']} key={item.id}
                                 style={{background: (currentAgent?.id === item.id) ? 'rgba(150, 200, 250, 0.5)' : ''}}
                                 onClick={() => setCurrentAgent(item)}
                            >
                              <div className={styles['agent-name']}>
                                {item.name}
                                {scopeTag}
                              </div>
                              <div className={styles['agent-meta']}>
                                <span><Icon name={'user'} size={11}/> {item.userName || '-'}</span>
                                <span>{item.createTime ? new Date(item.createTime).toLocaleDateString('zh-CN') : '-'}</span>
                              </div>
                            </div>
                        )
                      })
                    }
                  </div>
                </>
            ) : (
                // 折叠后
                <div className={'air-nav-page-menu-collapsed'} style={{height: frameSize.height, width: '40px'}}
                     onClick={() => setShowMenu(!showMenu)}>
                  <span>智能工作流</span>
                </div>
            )
          }
        </div>
        <div className={styles.content}>
          {
            currentAgent ? (
                <WorkflowInfo
                    current={currentAgent}
                    width={frameSize.width - menuWidth}
                    onWorkflowInfoSaved={loadAgentList}
                    onWorkflowDeleted={() => {
                      setCurrentAgent(null);
                      loadAgentList();
                    }}
                />
            ) : (
                <div style={{
                  width: frameSize.width - 320,
                  height: frameSize.height - 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px',
                    width: '220px', border: '1px solid #ddd', borderRadius: '5px', background: '#f1f2f3', gap: '18px'
                  }}>
                    <Icon name={'sign_info'} size={24}/>请选择智能工作流
                  </div>
                </div>
            )
          }
        </div>
      </div>
  )
}

export default connect(({global}) => ({
  frameSize: global.frameSize
}))(Agent);
