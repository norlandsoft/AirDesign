/**
 * 基本信息设置页面
 *
 * 用户基本信息管理：邮箱、电话、头像。登录ID和姓名只读。
 * 表单由 antd Form 改为原生受控 input + 手动校验。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import {Avatar, AvatarImage, Notice} from 'air-design'
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

interface BasicInfoForm {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
}

const BasicInfo = forwardRef<BasicInfoRef, BasicInfoProps>((props, ref) => {
  const {currentUser} = props
  const updateUserInfo = useUserStore((s) => s.updateUserInfo)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<BasicInfoForm>({id: '', name: '', email: '', phone: '', avatar: 'u01'})

  const avatarOptions = [
    {value: 'u01', label: '头像1'},
    {value: 'u02', label: '头像2'},
    {value: 'u03', label: '头像3'},
    {value: 'u04', label: '头像4'},
    {value: 'u05', label: '头像5'},
    {value: 'u06', label: '头像6'},
  ]

  useEffect(() => {
    if (currentUser) {
      setForm({
        id: currentUser.loginId || currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: extractAvatarId(currentUser.avatar),
      })
    }
  }, [currentUser])

  const handleSaveInfo = async (): Promise<void> => {
    if (!currentUser?.id) {
      Notice.error('用户信息不存在')
      return
    }
    // 简单校验：邮箱格式
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Notice.error('请输入有效的邮箱地址')
      return
    }
    // 手机号校验
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      Notice.error('请输入有效的手机号码')
      return
    }
    setLoading(true)
    await updateUserInfo(
      {
        id: currentUser.id,
        email: form.email || '',
        phone: form.phone || '',
        avatar: form.avatar || 'u01',
      },
      (resp: any) => {
        setLoading(false)
        if (resp?.success) {
          Notice.success('保存成功')
        } else {
          Notice.error(resp?.message || '保存失败')
        }
      }
    )
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

  const updateField = (field: keyof BasicInfoForm, value: string) => {
    setForm((f) => ({...f, [field]: value}))
  }

  return (
    <div className="user-settings-content">
      <div className="user-settings-content-header">
        <h2 className="user-settings-content-title">基本信息</h2>
        <p className="user-settings-content-description">用户基本信息维护</p>
      </div>

      <div className="user-settings-form user-settings-form-native">
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">登录ID</label>
          <input className="air-sdk-input" value={form.id} disabled placeholder="登录ID" onChange={(e) => updateField('id', e.target.value)}/>
        </div>
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">姓名</label>
          <input className="air-sdk-input" value={form.name} disabled placeholder="请输入姓名" onChange={(e) => updateField('name', e.target.value)}/>
        </div>
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">邮箱</label>
          <input className="air-sdk-input" value={form.email} placeholder="请输入邮箱（可选）" onChange={(e) => updateField('email', e.target.value)}/>
        </div>
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">电话</label>
          <input className="air-sdk-input" value={form.phone} placeholder="请输入电话号码（可选）" onChange={(e) => updateField('phone', e.target.value)}/>
        </div>
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">头像</label>
          <div className="avatar-radio-group">
            {avatarOptions.map((option) => (
              <label key={option.value} className={`avatar-radio-item ${form.avatar === option.value ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="avatar"
                  value={option.value}
                  checked={form.avatar === option.value}
                  onChange={() => updateField('avatar', option.value)}
                />
                <Avatar className="!size-7">
                  <AvatarImage src={getAvatarUrl(option.value)}/>
                </Avatar>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

BasicInfo.displayName = 'BasicInfo'

export default BasicInfo
