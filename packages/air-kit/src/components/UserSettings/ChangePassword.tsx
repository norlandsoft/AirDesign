/**
 * 修改密码组件
 *
 * 非admin用户的密码修改，前端 SHA256 哈希后提交，成功后自动登出。
 * 表单由 antd Form 改为原生受控 input + 手动校验。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {forwardRef, useImperativeHandle, useState} from 'react'
import {Notice} from 'air-design'
import type {UserResponse} from '../../types/user'
import {useUserStore} from '../../models/user'

export interface ChangePasswordRef {
  handleSave: () => Promise<void>
  loading: boolean
}

interface ChangePasswordProps {
  currentUser: UserResponse | null
}

const ChangePassword = forwardRef<ChangePasswordRef, ChangePasswordProps>((props, ref) => {
  const {currentUser} = props
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const changePassword = useUserStore((s) => s.changePassword)

  const handleSavePassword = async (): Promise<void> => {
    if (!newPassword) {
      Notice.error('请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      Notice.error('密码长度不能少于6位')
      return
    }
    if (!confirmPassword) {
      Notice.error('请确认新密码')
      return
    }
    if (newPassword !== confirmPassword) {
      Notice.error('两次输入的密码不一致')
      return
    }

    setLoading(true)
    await changePassword(
      {
        id: currentUser?.id,
        password: newPassword,
      },
      (resp: any) => {
        setLoading(false)
        if (resp?.success) {
          Notice.success('密码修改成功，请重新登录')
        } else {
          Notice.error(resp?.message || '密码修改失败')
        }
      }
    )
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

      <div className="user-settings-form user-settings-form-native">
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">新密码</label>
          <input
            type="password"
            className="air-kit-input"
            value={newPassword}
            placeholder="请输入新密码"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">确认密码</label>
          <input
            type="password"
            className="air-kit-input"
            value={confirmPassword}
            placeholder="请再次输入新密码"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
})

ChangePassword.displayName = 'ChangePassword'

export default ChangePassword
