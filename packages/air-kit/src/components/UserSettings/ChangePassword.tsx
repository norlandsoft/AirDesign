/**
 * 修改密码组件
 *
 * 非 admin 用户的密码修改，前端 SHA256 哈希后提交，成功后自动登出。
 * 表单基于 air-design Form / PasswordInput 组件。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useImperativeHandle, useState} from 'react'
import {Form, PasswordInput, Notice} from 'air-design'
import type {FormInstance} from 'air-design'
import type {UserResponse} from '../../types/user'
import {useUserStore} from '../../models/user'

export interface ChangePasswordRef {
  handleSave: () => Promise<void>
  loading: boolean
}

interface ChangePasswordProps {
  currentUser: UserResponse | null
}

interface ChangePasswordForm extends Record<string, unknown> {
  newPassword: string
  confirmPassword: string
}

const ChangePassword = forwardRef<ChangePasswordRef, ChangePasswordProps>((props, ref) => {
  const {currentUser} = props
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm<ChangePasswordForm>()
  const changePassword = useUserStore((s) => s.changePassword)

  const handleSavePassword = async (): Promise<void> => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await changePassword(
        {
          id: currentUser?.id,
          password: values.newPassword,
        },
        (resp: {success?: boolean; message?: string}) => {
          setLoading(false)
          if (resp?.success) {
            Notice.success('密码修改成功，请重新登录')
            form.resetFields()
          } else {
            Notice.error(resp?.message || '密码修改失败')
          }
        }
      )
    } catch {
      // 校验失败
    }
  }

  useImperativeHandle(ref, () => ({
    handleSave: handleSavePassword,
    loading,
  }))

  return (
    <div className="user-settings-content">
      <div className="user-settings-content-header">
        <h2 className="user-settings-content-title">修改密码</h2>
        <p className="user-settings-content-description">修改密码后将自动退出，请使用新密码重新登录</p>
      </div>

      <Form<ChangePasswordForm>
        form={form as FormInstance<ChangePasswordForm>}
        layout="horizontal"
        labelCol={{span: 6}}
        wrapperCol={{span: 18}}
        labelAlign="left"
        className="user-settings-form"
      >
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            {required: true, message: '请输入新密码'},
            {min: 6, message: '密码长度不能少于6位'},
          ]}
        >
          <PasswordInput placeholder="请输入新密码"/>
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认密码"
          rules={[
            {required: true, message: '请确认新密码'},
            {
              validator: (_rule, value) => {
                if (value && value !== form.getFieldValue('newPassword')) {
                  return '两次输入的密码不一致'
                }
                return undefined
              },
            },
          ]}
        >
          <PasswordInput placeholder="请再次输入新密码"/>
        </Form.Item>
      </Form>
    </div>
  )
})

ChangePassword.displayName = 'ChangePassword'

export default ChangePassword
