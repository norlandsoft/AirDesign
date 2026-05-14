import React, {useCallback, useEffect, useState} from "react";
import {connect} from 'umi';
import {Button, Dialog, error, SlidePanel, Table, TableRowMenu} from 'air-design';
import {POST} from '@/utils/HttpRequest';

// New User Form
import UserCreateForm from "../Users/components/UserCreateForm";
import UserInfoForm from "../Users/components/UserInfoForm";
import {Form, Tag} from "antd";

const UserSettingsPanel: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    user: {userList, userListPagination},
  } = props;

  const tableHeight = frameSize.height - 60;
  const [userForm] = Form.useForm();
  const [infoForm] = Form.useForm();

  const [emptyText, setEmptyText] = useState('暂无数据');

  // 侧边栏，用户信息
  const [showSlidePanel, setShowSlidePanel] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);

  // 用户设置（分页配置）
  const [tablePaginationSettings, setTablePaginationSettings] = useState<any>(null);

  /**
   * 加载用户设置
   */
  const loadUserSettings = useCallback(async () => {
    const userId = sessionStorage.getItem('air-machine-user') || '';
    if (!userId) {
      setTablePaginationSettings({enabled: false, pageSize: 20});
      return;
    }

    try {
      const resp: any = await POST('/rest/platform/user/settings/get', {userId});
      if (resp?.success && resp.data?.displaySettings) {
        try {
          const displaySettings = JSON.parse(resp.data.displaySettings);
          setTablePaginationSettings({
            enabled: displaySettings.paginationEnabled !== undefined ? displaySettings.paginationEnabled : false,
            pageSize: displaySettings.pageSize || 20
          });
        } catch (e) {
          console.error('解析用户设置失败:', e);
          setTablePaginationSettings({enabled: false, pageSize: 20});
        }
      } else {
        setTablePaginationSettings({enabled: false, pageSize: 20});
      }
    } catch (error) {
      console.error('加载用户设置失败:', error);
      setTablePaginationSettings({enabled: false, pageSize: 20});
    }
  }, []);

  /**
   * 加载用户列表
   */
  const loadUserList = useCallback(() => {
    const payload: any = {};

    // 如果启用了分页，添加分页参数
    if (tablePaginationSettings?.enabled) {
      payload.pagination = {
        current: userListPagination?.current || 1,
        pageSize: tablePaginationSettings.pageSize || 20
      };
    }

    dispatch({
      type: 'user/fetchUsers',
      payload,
      callback: resp => {
        if (!resp.success) {
          if (resp.code && resp.code.startsWith('91000')) {
            setEmptyText(resp.message);
          } else {
            error({
              title: '获取用户列表失败',
              message: resp.message
            });
          }
        }
      }
    });
  }, [dispatch, tablePaginationSettings, userListPagination]);

  useEffect(() => {
    // 加载用户设置
    loadUserSettings();
  }, [loadUserSettings]);

  useEffect(() => {
    // 获取用户列表
    if (tablePaginationSettings !== null) {
      loadUserList();
    }
  }, [tablePaginationSettings, loadUserList]);

  const handleShowNewUserDialog = () => {
    userForm.resetFields();
    Dialog({
      title: '新建用户',
      width: 500,
      content: <UserCreateForm form={userForm}/>,
      onConfirm: dlg => {
        userForm.validateFields().then(values => {
          dispatch({
            type: 'user/createUser',
            payload: values,
            callback: resp => {
              if (resp.success) {
                // 刷新用户列表
                loadUserList();
                dlg.doCancel();
              } else {
                error({
                  title: '新建用户失败',
                  message: resp.message
                });
              }
            }
          });
        });
      }
    });
  }

  const handleSaveUserInfo = () => {
    infoForm.validateFields().then(values => {
      dispatch({
        type: 'user/updateUser',
        payload: values,
        callback: resp => {
          if (resp.success) {
            // 刷新用户列表
            loadUserList();
            setShowSlidePanel(false);
          }
        }
      });
    });
  }

  // 处理密码重置
  const handleResetPassword = (record: any) => {
    Dialog({
      title: '重置密码',
      width: 400,
      content: <div>确定要将用户 "{record.name}" 的密码重置为初始值吗？</div>,
      onConfirm: dlg => {
        dispatch({
          type: 'user/resetPassword',
          payload: {id: record.id},
          callback: resp => {
            if (resp.success) {
              // 刷新用户列表
              dispatch({
                type: 'user/fetchUsers',
                payload: {}
              });
              dlg.doCancel();
            } else {
              error({
                title: '重置密码失败',
                message: resp.message
              });
            }
          }
        });
      }
    });
  }

  // 处理启用/停用用户
  const handleToggleUserStatus = (record: any) => {
    const newStatus = record.status === 'A' ? 'F' : 'A';
    const statusText = newStatus === 'A' ? '启用' : '停用';

    Dialog({
      title: `${statusText}用户`,
      width: 400,
      content: <div>确定要{statusText}用户 "{record.name}" 吗？</div>,
      onConfirm: dlg => {
        dispatch({
          type: 'user/updateUser',
          payload: {
            id: record.id,
            status: newStatus
          },
          callback: resp => {
            if (resp.success) {
              // 刷新用户列表
              loadUserList();
              dlg.doCancel();
            } else {
              error({
                title: `${statusText}用户失败`,
                message: resp.message
              });
            }
          }
        });
      }
    });
  }

  // 处理删除用户
  const handleDeleteUser = (record: any) => {
    Dialog({
      title: '删除用户',
      width: 400,
      content: <div>确定要删除用户 "{record.name}" 吗？此操作不可恢复！</div>,
      onConfirm: dlg => {
        dispatch({
          type: 'user/deleteUser',
          payload: {id: record.id},
          callback: resp => {
            if (resp.success) {
              // 刷新用户列表
              loadUserList();
              dlg.doCancel();
            } else {
              error({
                title: '删除用户失败',
                message: resp.message
              });
            }
          }
        });
      }
    });
  }

  return (
      <div className='air-grid-panel'>
        <div className="air-grid-panel-top">
          <div className="air-grid-panel-title">
            用户管理
          </div>
          <div className="air-grid-panel-toolbar">
            <Button type={'primary'} onClick={handleShowNewUserDialog}>新建</Button>
          </div>
        </div>
        <div style={{height: tableHeight, overflow: 'hidden'}}>
          <Table
              data={userList}
              columns={[{
                title: '登录ID',
                dataIndex: 'id',
              }, {
                title: '姓名',
                dataIndex: 'name',
              }, {
                title: '邮箱',
                dataIndex: 'email',
              }, {
                title: '电话',
                dataIndex: 'phone',
                width: 150
              }, {
                title: '状态',
                dataIndex: 'status',
                width: 80,
                render: (status: string) => {
                  if (status === 'A') {
                    return <Tag color="success">启用</Tag>;
                  } else if (status === 'F') {
                    return <Tag color="error">停用</Tag>;
                  } else {
                    return <Tag>{status || '未知'}</Tag>;
                  }
                }
              }, {
                title: '操作',
                width: 50,
                render: (_, record) => {
                  const menuItems = [
                    {
                      key: 'resetPassword',
                      label: '密码重置',
                      onClick: () => handleResetPassword(record)
                    },
                    {
                      key: 'toggleStatus',
                      label: record.status === 'A' ? '停用' : '启用',
                      onClick: () => handleToggleUserStatus(record)
                    },
                    {type: 'split'},
                    {
                      key: 'delete',
                      label: '删除',
                      onClick: () => handleDeleteUser(record)
                    }
                  ];

                  return (
                      <TableRowMenu
                          items={menuItems}
                          data={record}
                      />
                  );
                }
              }]}
              height={tableHeight}
              rowHeight={40}
              padding={4}
              bordered={true}
              pagination={userListPagination && tablePaginationSettings?.enabled ? {
                currentPage: userListPagination.current || 1,
                pageSize: userListPagination.pageSize || 20,
                total: userListPagination.total || 0,
                onChange: (page: number, pageSize: number) => {
                  const payload: any = {
                    pagination: {
                      current: page,
                      pageSize: pageSize
                    }
                  };
                  dispatch({
                    type: 'user/fetchUsers',
                    payload,
                    callback: resp => {
                      if (!resp.success) {
                        if (resp.code && resp.code.startsWith('91000')) {
                          setEmptyText(resp.message);
                        } else {
                          error({
                            title: '获取用户列表失败',
                            message: resp.message
                          });
                        }
                      }
                    }
                  });
                }
              } : false}
              showEmpty={true}
              emptyText={emptyText}
              onItemClick={data => {
                infoForm.resetFields();
                infoForm.setFieldsValue(data);
                setCurrentUserInfo(data);
                setShowSlidePanel(true);
              }}
          />
        </div>

        <SlidePanel
            title={'用户信息'}
            type={'medium'}
            open={showSlidePanel}
            closable={true}
            hasCloseButton={true}
            confirmButtonText={'保存'}
            closeButtonText={'关闭'}
            onConfirm={handleSaveUserInfo}
            onClose={() => setShowSlidePanel(false)}
        >
          <UserInfoForm form={infoForm}/>
        </SlidePanel>

        {/* 角色设置功能已移除，当前仅保留用户信息管理与登录认证相关操作 */}
      </div>
  );
}

export default connect(({global, user}) => ({
  frameSize: global.frameSize,
  user,
}))(UserSettingsPanel);
