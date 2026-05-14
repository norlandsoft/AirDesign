import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {useDispatch, useSelector} from 'umi';
import {Form, InputNumber, Slider, Switch} from 'antd';
import {Message, ToggleButton} from 'air-design';
import type {DisplaySettings as DisplaySettingsType} from '@/types/userSettings';
import type {UserResponse} from '@/types/user';

/**
 * 显示设置组件引用接口
 */
export interface DisplaySettingsRef {
  handleSave: () => Promise<void>;
  loading: boolean;
}

/**
 * 显示设置组件属性
 */
interface DisplaySettingsProps {
  currentUser: UserResponse | null;
}

/**
 * ToggleButton适配Form.Item的包装组件
 */
const FormToggleButton: React.FC<any> = ({value, onChange, ...rest}) => {
  return (
      <ToggleButton
          {...rest}
          selected={value}
          onClick={() => {
            if (onChange) {
              onChange(!value);
            }
          }}
      />
  );
};

/**
 * 显示设置组件
 * 用于设置表格分页显示等个性化设置
 */
const DisplaySettings = forwardRef<DisplaySettingsRef, DisplaySettingsProps>((props, ref) => {
  const {currentUser} = props;
  const dispatch = useDispatch();
  const userSettings = useSelector((state: any) => state.user.userSettings);
  const userSettingsLoading = useSelector((state: any) => state.user.userSettingsLoading);
  const [displayForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * 加载用户设置
   */
  useEffect(() => {
    if (currentUser?.id) {
      dispatch({
        type: 'user/fetchUserSettings',
        payload: {userId: currentUser.id},
      });
    }
  }, [currentUser?.id, dispatch]);

  /**
   * 当用户设置加载完成后，更新表单值
   */
  useEffect(() => {
    if (userSettings && !userSettingsLoading) {
      // 解析显示设置JSON
      let displaySettings: DisplaySettingsType = {};
      if (userSettings.displaySettings) {
        try {
          displaySettings = JSON.parse(userSettings.displaySettings);
        } catch (e) {
          console.error('解析用户设置失败:', e);
          displaySettings = {};
        }
      }

      // 设置默认值
      const paginationEnabled = displaySettings.paginationEnabled !== undefined ? displaySettings.paginationEnabled : false;
      const pageSize = displaySettings.pageSize || 20;
      const fontSize = displaySettings.fontSize || 14;
      const showStatusBar = displaySettings.showStatusBar !== undefined ? displaySettings.showStatusBar : true;

      // 设置表单值
      displayForm.setFieldsValue({
        paginationEnabled: paginationEnabled,
        pageSize: pageSize,
        fontSize: fontSize,
        showStatusBar: showStatusBar,
      });
    }
  }, [userSettings, userSettingsLoading, displayForm]);

  /**
   * 保存显示设置
   */
  const handleSaveSettings = async (): Promise<void> => {
    if (!currentUser?.id) {
      Message.error('用户信息不存在，无法保存设置');
      return;
    }
    try {
      const values = await displayForm.validateFields();
      setLoading(true);

      // 构建显示设置JSON
      const displaySettings: DisplaySettingsType = {
        paginationEnabled: values.paginationEnabled || false,
        pageSize: values.pageSize || 20,
        fontSize: values.fontSize || 14,
        showStatusBar: values.showStatusBar !== undefined ? values.showStatusBar : true,
      };

      const updateRequest = {
        userId: currentUser.id,
        displaySettings: JSON.stringify(displaySettings),
      };

      dispatch({
        type: 'user/updateUserSettings',
        payload: updateRequest,
        callback: (resp: any) => {
          setLoading(false);
          if (resp.success) {
            Message.success('保存成功');
          } else {
            Message.error(resp.message || '保存显示设置失败');
          }
        },
      });
    } catch (err: any) {
      setLoading(false);
      if (err.errorFields) {
        // 表单验证错误
        Message.error('请检查表单输入');
      } else {
        Message.error('保存失败：' + (err.message || '未知错误'));
      }
    }
  };

  // 暴露保存方法给父组件
  useImperativeHandle(ref, () => ({
    handleSave: handleSaveSettings,
    loading,
  }));

  if (!currentUser) {
    return (
        <div className="user-settings-content">
          <div className="user-settings-empty">未获取到用户信息</div>
        </div>
    );
  }

  return (
      <div className="user-settings-content">
        <div className="user-settings-content-header">
          <h2 className="user-settings-content-title">显示设置</h2>
          <p className="user-settings-content-description">
            管理您的表格显示和分页设置
          </p>
        </div>

        <Form
            form={displayForm}
            layout="horizontal"
            labelCol={{span: 5}}
            wrapperCol={{span: 16}}
            className="user-settings-form"
        >
          <Form.Item
              name="fontSize"
              label="字体大小"
          >
            <Slider
                min={13}
                max={17}
                marks={{
                  13: '小',
                  15: '中',
                  17: '大'
                }}
                step={2}
                tooltip={{open: false}}
            />
          </Form.Item>

          <Form.Item
              name="showStatusBar"
              label="显示状态栏"
          >
            <Switch/>
          </Form.Item>

          <Form.Item
              name="paginationEnabled"
              label="启用表格分页"
              valuePropName="checked"
          >
            <Switch/>
          </Form.Item>

          <Form.Item
              name="pageSize"
              label="每页显示条数"
              rules={[
                {required: true, message: '请输入每页显示条数'},
                {type: 'number', min: 10, max: 100, message: '每页显示条数应在10-100之间'},
              ]}
          >
            <InputNumber
                min={10}
                max={100}
                style={{width: '100%'}}
                placeholder="请输入每页显示条数（10-100）"
            />
          </Form.Item>
        </Form>
      </div>
  );
});

DisplaySettings.displayName = 'DisplaySettings';

export default DisplaySettings;
