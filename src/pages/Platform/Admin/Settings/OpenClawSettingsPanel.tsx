import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, Message} from 'air-design';
import {Form, Input, InputNumber} from 'antd';
import './AdminPaasPanel.less';

/**
 * OpenClaw 设置面板
 *
 * 用于配置 OpenClaw 网关连接参数，包括安装目录、端口、认证令牌和各级超时时间。
 * 配置持久化到 EmbeddedStorage（H2），通过 ConfigProvider watcher 热更新到 OpenClawProperties。
 *
 * Created by ChaiMingXu, on 2026-04-30
 */
const OpenClawSettingsPanel: React.FC<any> = (props) => {
  const {dispatch, frameSize} = props;
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const contentHeight = (frameSize?.height || 600) - 60;

  useEffect(() => {
    setLoading(true);
    dispatch({
      type: 'openclaw/fetchOpenClawConfig',
      callback: (resp: any) => {
        setLoading(false);
        if (resp?.success && resp?.data) {
          const d = resp.data;
          form.setFieldsValue({
            openclawHome: d.openclawHome ?? '',
            gatewayPort: d.gatewayPort ?? 18789,
            authToken: d.authToken ?? '',
            timeoutChat: d.timeoutChat ?? 900000,
            timeoutSyncChat: d.timeoutSyncChat ?? 900000,
            timeoutManagement: d.timeoutManagement ?? 30000,
            timeoutDefault: d.timeoutDefault ?? 120000,
          });
        } else {
          form.setFieldsValue({
            openclawHome: '',
            gatewayPort: 18789,
            authToken: '',
            timeoutChat: 900000,
            timeoutSyncChat: 900000,
            timeoutManagement: 30000,
            timeoutDefault: 120000,
          });
        }
      },
    });
  }, [dispatch]);

  const onFinish = (values: any) => {
    setSaving(true);
    dispatch({
      type: 'openclaw/saveOpenClawConfig',
      payload: {
        openclawHome: values.openclawHome,
        gatewayPort: values.gatewayPort,
        authToken: values.authToken,
        timeoutChat: values.timeoutChat,
        timeoutSyncChat: values.timeoutSyncChat,
        timeoutManagement: values.timeoutManagement,
        timeoutDefault: values.timeoutDefault,
      },
      callback: (resp: any) => {
        setSaving(false);
        if (resp?.success) {
          Message.success('保存成功');
        } else {
          Message.error(resp?.message || '保存失败');
        }
      },
    });
  };

  return (
      <div className="air-grid-panel">
        <div className="air-grid-panel-top">
          <div className="air-grid-panel-title">OpenClaw 网关</div>
          <div className="air-grid-panel-toolbar">
            <Button type="primary" onClick={() => form.submit()} disabled={saving || loading}>
              {saving ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </div>
        <div className="admin-paas-panel-content" style={{height: contentHeight, overflow: 'auto'}}>
          <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                openclawHome: '',
                gatewayPort: 18789,
                authToken: '',
                timeoutChat: 900000,
                timeoutSyncChat: 900000,
                timeoutManagement: 30000,
                timeoutDefault: 120000,
              }}
              style={{maxWidth: 640, padding: '0 24px 24px'}}
              disabled={loading}
          >
            <Form.Item label="安装目录 (OPENCLAW_HOME)" name="openclawHome"
                       rules={[{required: true, message: '请输入 OpenClaw 安装目录'}]}>
              <Input placeholder="如 /home/user/.openclaw"/>
            </Form.Item>
            <Form.Item label="网关端口" name="gatewayPort"
                       rules={[{required: true, message: '请输入端口号'}]}>
              <InputNumber min={1} max={65535} placeholder="如 18789" style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label="认证令牌" name="authToken">
              <Input.Password placeholder="Gateway Bearer Token" autoComplete="new-password"/>
            </Form.Item>
            <Form.Item label="流式聊天超时 (ms)" name="timeoutChat">
              <InputNumber min={1000} max={3600000} step={1000} style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label="同步聊天超时 (ms)" name="timeoutSyncChat">
              <InputNumber min={1000} max={3600000} step={1000} style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label="管理操作超时 (ms)" name="timeoutManagement">
              <InputNumber min={1000} max={300000} step={1000} style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label="默认超时 (ms)" name="timeoutDefault">
              <InputNumber min={1000} max={600000} step={1000} style={{width: '100%'}}/>
            </Form.Item>
          </Form>
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(OpenClawSettingsPanel);
