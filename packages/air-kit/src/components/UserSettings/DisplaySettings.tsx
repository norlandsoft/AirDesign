/**
 * 显示设置组件
 *
 * 字体大小等个性化设置，以 JSON 字符串形式通过接口存储/读取。
 * 表单基于 air-design Form / Radio.Group 组件。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {Form, Radio, Notice} from 'air-design'
import type {FormInstance} from 'air-design'
import type {UserResponse} from '../../types/user'
import type {UserSettingsResponse} from '../../types/userSettings'
import {useUserStore} from '../../models/user'
import {
  applyAndCacheFontSize,
  buildSettingsPayload,
  extractDisplaySettingsJson,
  FONT_SIZE_OPTIONS,
  normalizeFontSize,
  parseDisplaySettings,
} from '../../utils/displaySettings'

export interface DisplaySettingsRef {
  handleSave: () => Promise<void>
  loading: boolean
}

interface DisplaySettingsProps {
  currentUser: UserResponse | null
}

interface DisplaySettingsForm extends Record<string, unknown> {
  fontSize: number
}

const DisplaySettings = forwardRef<DisplaySettingsRef, DisplaySettingsProps>((props, ref) => {
  const {currentUser} = props
  const userSettings: UserSettingsResponse | null = useUserStore((s) => s.userSettings)
  const userSettingsLoading: boolean = useUserStore((s) => s.userSettingsLoading)
  const updateUserSettings = useUserStore((s) => s.updateUserSettings)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm<DisplaySettingsForm>()
  /** 已同步到表单的 settings JSON，避免重复 fetch 或对象引用变化时覆盖用户未保存的编辑 */
  const syncedSettingsRef = useRef<string | null>(null)

  useEffect(() => {
    if (userSettingsLoading) return
    const settingsJson = extractDisplaySettingsJson(userSettings) ?? ''
    if (syncedSettingsRef.current === settingsJson) return
    syncedSettingsRef.current = settingsJson
    const parsed = parseDisplaySettings(settingsJson)
    form.setFieldsValue({fontSize: normalizeFontSize(parsed.fontSize)})
  }, [userSettings, userSettingsLoading, form])

  const handleSaveSettings = async (): Promise<void> => {
    if (!currentUser?.id) {
      Notice.error('用户信息不存在，无法保存设置')
      return
    }
    try {
      const values = await form.validateFields()
      setLoading(true)
      const settingsJson = buildSettingsPayload(extractDisplaySettingsJson(userSettings), {
        fontSize: values.fontSize,
      })
      applyAndCacheFontSize(values.fontSize)
      await updateUserSettings(
        {
          userId: String(currentUser.id),
          settings: settingsJson,
        },
        (resp: {success?: boolean; message?: string}) => {
          setLoading(false)
          if (resp.success) {
            syncedSettingsRef.current = settingsJson
            Notice.success('保存成功')
          } else {
            Notice.error(resp.message || '保存显示设置失败')
          }
        }
      )
    } catch {
      // 校验失败
    }
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

      <Form<DisplaySettingsForm>
        form={form as FormInstance<DisplaySettingsForm>}
        layout="horizontal"
        labelCol={{span: 6}}
        wrapperCol={{span: 18}}
        labelAlign="left"
        className="user-settings-form"
      >
        <Form.Item
          name="fontSize"
          label="字体大小"
          rules={[{required: true, message: '请选择字体大小'}]}
          getValueFromEvent={(value) => normalizeFontSize(value)}
        >
          <Radio.Group optionType="button" options={[...FONT_SIZE_OPTIONS]}/>
        </Form.Item>
      </Form>
    </div>
  )
})

DisplaySettings.displayName = 'DisplaySettings'

export default DisplaySettings
