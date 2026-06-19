/**
 * 显示设置组件
 *
 * 字体大小等个性化设置，以 JSON 字符串形式通过接口存储/读取。
 * 表单由 antd Form/Radio 改为原生 radio。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import {Notice} from 'air-design'
import type {UserResponse} from '../../types/user'
import type {DisplaySettings as DisplaySettingsType, UserSettingsResponse} from '../../types/userSettings'
import {useUserStore} from '../../models/user'

export interface DisplaySettingsRef {
  handleSave: () => Promise<void>
  loading: boolean
}

interface DisplaySettingsProps {
  currentUser: UserResponse | null
}

const FONT_OPTIONS = [
  {value: 13, label: '小'},
  {value: 15, label: '中'},
  {value: 17, label: '大'},
]

const DisplaySettings = forwardRef<DisplaySettingsRef, DisplaySettingsProps>((props, ref) => {
  const {currentUser} = props
  const userSettings: UserSettingsResponse | null = useUserStore((s) => s.userSettings)
  const userSettingsLoading: boolean = useUserStore((s) => s.userSettingsLoading)
  const fetchUserSettings = useUserStore((s) => s.fetchUserSettings)
  const updateUserSettings = useUserStore((s) => s.updateUserSettings)
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState<number>(15)

  // 加载用户设置
  useEffect(() => {
    if (currentUser?.id) {
      fetchUserSettings({userId: currentUser.id})
    }
  }, [currentUser?.id, fetchUserSettings])

  // 设置加载完成后回填
  useEffect(() => {
    if (userSettings && !userSettingsLoading) {
      let displaySettings: DisplaySettingsType = {}
      if (userSettings.settings) {
        try {
          displaySettings = JSON.parse(userSettings.settings)
        } catch (e) {
          console.error('解析用户设置失败:', e)
          displaySettings = {}
        }
      }
      setFontSize(displaySettings.fontSize || 15)
    }
  }, [userSettings, userSettingsLoading])

  const handleSaveSettings = async (): Promise<void> => {
    if (!currentUser?.id) {
      Notice.error('用户信息不存在，无法保存设置')
      return
    }
    setLoading(true)
    const displaySettings: DisplaySettingsType = {fontSize}
    await updateUserSettings(
      {
        userId: currentUser.id,
        settings: JSON.stringify(displaySettings),
      },
      (resp: any) => {
        setLoading(false)
        if (resp.success) {
          Notice.success('保存成功')
        } else {
          Notice.error(resp.message || '保存显示设置失败')
        }
      }
    )
  }

  useImperativeHandle(ref, () => ({
    handleSave: handleSaveSettings,
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
        <h2 className="user-settings-content-title">显示设置</h2>
        <p className="user-settings-content-description">管理您的显示偏好设置</p>
      </div>

      <div className="user-settings-form user-settings-form-native">
        <div className="user-settings-form-row">
          <label className="user-settings-form-label">字体大小</label>
          <div className="air-sdk-radio-button-group">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`air-sdk-radio-button ${fontSize === opt.value ? 'active' : ''}`}
                onClick={() => setFontSize(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

DisplaySettings.displayName = 'DisplaySettings'

export default DisplaySettings
