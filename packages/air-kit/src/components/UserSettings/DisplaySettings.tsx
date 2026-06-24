/**
 * 显示设置组件
 *
 * 字体大小等个性化设置，以 JSON 字符串形式通过接口存储/读取。
 * 表单基于 air-design Form / Radio.Group 组件。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import {Form, Radio, Notice} from 'air-design'
import type {FormInstance} from 'air-design'
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

interface DisplaySettingsForm extends Record<string, unknown> {
  fontSize: number
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
  const [form] = Form.useForm<DisplaySettingsForm>()

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserSettings({userId: currentUser.id})
    }
  }, [currentUser?.id, fetchUserSettings])

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
      form.setFieldsValue({fontSize: displaySettings.fontSize || 15})
    }
  }, [userSettings, userSettingsLoading, form])

  const handleSaveSettings = async (): Promise<void> => {
    if (!currentUser?.id) {
      Notice.error('用户信息不存在，无法保存设置')
      return
    }
    try {
      const values = await form.validateFields()
      setLoading(true)
      const displaySettings: DisplaySettingsType = {fontSize: values.fontSize}
      await updateUserSettings(
        {
          userId: currentUser.id,
          settings: JSON.stringify(displaySettings),
        },
        (resp: {success?: boolean; message?: string}) => {
          setLoading(false)
          if (resp.success) {
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
        initialValues={{fontSize: 15}}
        className="user-settings-form"
      >
        <Form.Item name="fontSize" label="字体大小" rules={[{required: true, message: '请选择字体大小'}]}>
          <Radio.Group optionType="button" options={FONT_OPTIONS}/>
        </Form.Item>
      </Form>
    </div>
  )
})

DisplaySettings.displayName = 'DisplaySettings'

export default DisplaySettings
