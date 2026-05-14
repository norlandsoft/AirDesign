/**
 * Admin 用户密码修改
 *
 * 仅用于 admin 账号，与普通用户密码修改逻辑分离，单独调用 changeAdminPassword 接口。
 *
 * Created by ChaiMingXu
 */

import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Form, Input, message} from 'antd';
import {error} from 'air-design';

interface AdminPasswordSettingsProps {
  dispatch: any;
  /** 修改成功后回调（如关闭面板） */
  onSuccess?: () => void;
  /** 父组件注册保存函数，避免 ref 未就绪导致点击保存无反应 */
  onSaveReady?: (save: () => Promise<void>) => void;
}

export interface AdminPasswordSettingsRef {
  handleSave: () => Promise<void>;
  loading: boolean;
}

const AdminPasswordSettings = forwardRef<AdminPasswordSettingsRef, AdminPasswordSettingsProps>((props, ref) => {
  const {dispatch, onSuccess, onSaveReady} = props;

  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (): Promise<void> => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);

      dispatch({
        type: 'user/changeAdminPassword',
        payload: {password: values.newPassword},
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
      message.error('请正确填写新密码和确认密码（至少6位，且两次输入一致）');
    }
  };

  useImperativeHandle(ref, () => ({
    handleSave,
    loading,
  }));

  useEffect(() => {
    onSaveReady?.(handleSave);
  }, [onSaveReady, handleSave]);

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

AdminPasswordSettings.displayName = 'AdminPasswordSettings';

export default AdminPasswordSettings;
