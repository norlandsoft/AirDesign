/**
 * 基本信息设置页面
 *
 * 用于用户基本信息的管理，包括姓名、邮箱、电话、头像等
 * 管理员用户可查看额外的账户信息
 *
 * Created by ChaiMingXu, on 2026/1/3
 */

import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Avatar, Form, Input, message, Radio} from 'antd';
import {error} from 'air-design';
import {UserResponse, UserUpdateRequest} from '@/types/user';

interface BasicInfoProps {
  dispatch: any;
  currentUser: UserResponse | null;
}

export interface BasicInfoRef {
  handleSave: () => Promise<void>;
  loading: boolean;
}

const BasicInfo = forwardRef<BasicInfoRef, BasicInfoProps>((props, ref) => {
  const {dispatch, currentUser} = props;

  const [infoForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 可用头像列表
  const avatarOptions = [
    {value: 'u01', label: '头像1'},
    {value: 'u02', label: '头像2'},
    {value: 'u03', label: '头像3'},
    {value: 'u04', label: '头像4'},
    {value: 'u05', label: '头像5'},
    {value: 'u06', label: '头像6'},
  ];

  // 初始化表单数据
  useEffect(() => {
    if (currentUser) {
      infoForm.setFieldsValue({
        id: currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || 'u01',
      });
    }
  }, [currentUser, infoForm]);

  /**
   * 获取头像路径
   */
  const getAvatarUrl = (avatar?: string): string => {
    const avatarId = avatar || 'u01';
    return `/icons/avatar/${avatarId}.svg`;
  };

  /**
   * 保存基本信息
   */
  const handleSaveInfo = async (): Promise<void> => {
    try {
      const values = await infoForm.validateFields();
      setLoading(true);

      // 如果是系统用户（admin 或 manager），不允许修改姓名
      const isSystemUser = currentUser?.id === 'admin' || currentUser?.id === 'manager';
      const updateDTO: UserUpdateRequest = {
        id: values.id,
        name: isSystemUser ? currentUser?.name : values.name, // 系统用户的姓名保持不变
        email: values.email,
        phone: values.phone,
        avatar: values.avatar,
      };

      dispatch({
        type: 'user/updateUser',
        payload: updateDTO,
        callback: (resp: any) => {
          setLoading(false);
          if (resp.success) {
            message.success('保存成功');
            // 刷新当前用户信息
            dispatch({
              type: 'user/getUserInfo',
              payload: {id: currentUser?.id},
            });
          } else {
            error({
              title: '保存失败',
              message: resp.message || '保存用户信息失败',
            });
          }
        },
      });
    } catch (err) {
      setLoading(false);
    }
  };

  // 暴露保存方法给父组件
  useImperativeHandle(ref, () => ({
    handleSave: handleSaveInfo,
    loading,
  }));

  if (!currentUser) {
    return (
        <div className="user-settings-content">
          <div className="user-settings-empty">未获取到用户信息</div>
        </div>
    );
  }

  // 判断用户名是否为 admin 或 manager，这些用户的姓名不可修改
  const isSystemUser = currentUser.id === 'admin' || currentUser.id === 'manager';

  return (
      <div className="user-settings-content">
        <div className="user-settings-content-header">
          <h2 className="user-settings-content-title">基本信息</h2>
          <p className="user-settings-content-description">
            管理您的个人信息和账户设置
          </p>
        </div>

        <Form
            form={infoForm}
            layout="horizontal"
            labelCol={{span: 4}}
            wrapperCol={{span: 16}}
            className="user-settings-form"
        >
          <Form.Item name="id" label="登录ID" rules={[{required: true}]}>
            <Input disabled placeholder="登录ID"/>
          </Form.Item>

          <Form.Item
              name="name"
              label="姓名"
              rules={[{required: true, message: '请输入姓名'}]}
          >
            <Input
                disabled={isSystemUser}
                placeholder="请输入姓名"
            />
          </Form.Item>

          <Form.Item
              name="email"
              label="邮箱"
              rules={[
                {type: 'email', message: '请输入有效的邮箱地址'},
              ]}
          >
            <Input placeholder="请输入邮箱（可选）"/>
          </Form.Item>

          <Form.Item
              name="phone"
              label="电话"
              rules={[
                {pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码'},
              ]}
          >
            <Input placeholder="请输入电话号码（可选）"/>
          </Form.Item>

          <Form.Item name="avatar" label="头像">
            <Radio.Group>
              {avatarOptions.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    <Avatar
                        size={32}
                        src={getAvatarUrl(option.value)}
                        style={{marginRight: 6}}
                    />
                  </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

        </Form>
      </div>
  );
});

BasicInfo.displayName = 'BasicInfo';

export default BasicInfo;

