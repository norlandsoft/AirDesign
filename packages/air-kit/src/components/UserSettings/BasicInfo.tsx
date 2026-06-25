/**
 * 基本信息设置页面
 *
 * 用户基本信息管理：邮箱、电话、头像。登录ID和姓名只读。
 * 表单基于 air-design Form / Input / Radio 组件，API 对齐 antd。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import {Avatar, Form, Input, Notice, Radio} from 'air-design'
import type {FormInstance} from 'air-design'
import type {UserResponse} from '../../types/user'
import {getAvatarUrl, extractAvatarId} from '../../utils/IconUtils'
import {useUserStore} from '../../models/user'

interface BasicInfoProps {
  currentUser: UserResponse | null
}

export interface BasicInfoRef {
  handleSave: () => Promise<void>
  loading: boolean
}

interface BasicInfoForm extends Record<string, unknown> {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
}

const avatarOptions = [
  {value: 'u01', label: '头像1'},
  {value: 'u02', label: '头像2'},
  {value: 'u03', label: '头像3'},
  {value: 'u04', label: '头像4'},
  {value: 'u05', label: '头像5'},
  {value: 'u06', label: '头像6'},
]

/** 头像选择器：Form.Item 注入 value / onChange，Radio 圆点 + 头像横向排列 */
const AvatarPicker: React.FC<{
  value?: string
  onChange?: (value: string) => void
}> = ({value = 'u01', onChange}) => (
  <Radio.Group
    value={value}
    onChange={(next) => onChange?.(String(next))}
    className="avatar-radio-group"
  >
    {avatarOptions.map((option) => (
      <Radio key={option.value} value={option.value} className="avatar-radio-item" aria-label={option.label}>
        <Avatar src={getAvatarUrl(option.value)} size={28}/>
      </Radio>
    ))}
  </Radio.Group>
)

const BasicInfo = forwardRef<BasicInfoRef, BasicInfoProps>((props, ref) => {
  const {currentUser} = props
  const updateUserInfo = useUserStore((s) => s.updateUserInfo)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm<BasicInfoForm>()

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        id: currentUser.loginId || currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: extractAvatarId(currentUser.avatar),
      })
    }
  }, [currentUser, form])

  const handleSaveInfo = async (): Promise<void> => {
    if (!currentUser?.id) {
      Notice.error('用户信息不存在')
      return
    }
    try {
      const values = await form.validateFields()
      setLoading(true)
      await updateUserInfo(
        {
          id: currentUser.id,
          email: values.email || '',
          phone: values.phone || '',
          avatar: values.avatar || 'u01',
        },
        (resp: {success?: boolean; message?: string}) => {
          setLoading(false)
          if (resp?.success) {
            Notice.success('保存成功')
          } else {
            Notice.error(resp?.message || '保存失败')
          }
        }
      )
    } catch {
      // 校验失败时 Form.Item 已展示错误信息
    }
  }

  useImperativeHandle(ref, () => ({
    handleSave: handleSaveInfo,
    loading,
  }))

  if (!currentUser) {
    return (
      <div className="user-settings-content">
        <div className="user-settings-empty">未获取到用户信息</div>
      </div>
    )
  }

  return (
    <div className="user-settings-content">
      <div className="user-settings-content-header">
        <h2 className="user-settings-content-title">基本信息</h2>
        <p className="user-settings-content-description">用户基本信息维护</p>
      </div>

      <Form<BasicInfoForm>
        form={form as FormInstance<BasicInfoForm>}
        layout="horizontal"
        labelCol={{span: 6}}
        wrapperCol={{span: 18}}
        labelAlign="left"
        requiredMark={false}
        className="user-settings-form"
      >
        <Form.Item name="id" label="登录ID">
          <Input disabled placeholder="登录ID"/>
        </Form.Item>
        <Form.Item name="name" label="姓名">
          <Input disabled placeholder="请输入姓名"/>
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[{type: 'email', message: '请输入有效的邮箱地址'}]}
        >
          <Input placeholder="请输入邮箱（可选）"/>
        </Form.Item>
        <Form.Item
          name="phone"
          label="电话"
          rules={[{pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码'}]}
        >
          <Input placeholder="请输入电话号码（可选）"/>
        </Form.Item>
        <Form.Item name="avatar" label="头像">
          <AvatarPicker/>
        </Form.Item>
      </Form>
    </div>
  )
})

BasicInfo.displayName = 'BasicInfo'

export default BasicInfo
