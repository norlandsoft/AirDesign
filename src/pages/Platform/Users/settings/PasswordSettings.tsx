/**
 * 密码设置页面
 *
 * 用于用户登录密码的修改
 *
 * Created by ChaiMingXu, on 2026/1/3
 */

import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Form, Input, message} from 'antd';
import {error} from 'air-design';
import {UserResponse, UserUpdateRequest} from '@/types/user';

interface PasswordSettingsProps {
  dispatch: any;
  currentUser: UserResponse | null;
  /** 修改成功后回调（如关闭面板） */
  onSuccess?: () => void;
}

export interface PasswordSettingsRef {
  handleSave: () => Promise<void>;
  loading: boolean;
}

const PasswordSettings = forwardRef<PasswordSettingsRef, PasswordSettingsProps>((props, ref) => {
  const {dispatch, currentUser, onSuccess} = props;

  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * 修改密码（仅普通用户，调用 updateUser 接口）
   * admin 用户使用 AdminPasswordSettings 组件，单独调用 changeAdminPassword 接口
   */
  const handleChangePassword = async (): Promise<void> => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);

      const updateDTO: UserUpdateRequest = {
        id: currentUser?.id || '',
        password: values.newPassword,
      };

      dispatch({
        type: 'user/updateUser',
        payload: updateDTO,
        callback: (resp: any) => {
          setLoading(false);
          if (resp.success) {
            message.success('密码修改成功');
            passwordForm.resetFields();
            onSuccess?.();
          } else {
            error({
              title: '密码修改失败',
              message: resp.message || '修改密码失败',
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
    handleSave: handleChangePassword,
    loading,
  }));

  return (
      <div className="user-settings-content">
        <Form
            form={passwordForm}
            layout="horizontal"
            labelCol={{span: 4}}
            wrapperCol={{span: 16}}
            className="user-settings-form"
        >
          <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                {required: true, message: '请输入新密码'},
                {min: 6, message: '密码长度至少6位'},
              ]}
          >
            <Input.Password placeholder="请输入新密码"/>
          </Form.Item>

          <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['newPassword']}
              rules={[
                {required: true, message: '请确认新密码'},
                ({getFieldValue}) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
          >
            <Input.Password placeholder="请再次输入新密码"/>
          </Form.Item>

        </Form>
      </div>
  );
});

PasswordSettings.displayName = 'PasswordSettings';

export default PasswordSettings;

