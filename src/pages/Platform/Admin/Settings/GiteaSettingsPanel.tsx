import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, Message} from 'air-design';
import {Form, Input, InputNumber} from 'antd';
import './AdminPaasPanel.less';

/**
 * Gitea 代码托管服务设置面板
 *
 * 布局与 Redis、LibreOffice 等面板一致：air-grid-panel（标题栏 + 内容区）。
 * 用于配置 Gitea 服务的连接地址、端口、用户ID和访问令牌。
 * 配置持久化到网关 EmbeddedStorage（H2），通过 /admin/paas/gitea 接口读写。
 *
 * Created by ChaiMingXu
 */
const GiteaSettingsPanel: React.FC<any> = (props) => {
  const {dispatch, frameSize} = props;
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const contentHeight = (frameSize?.height || 600) - 60;

  useEffect(() => {
    setLoading(true);
    dispatch({
      type: 'platform/fetchGiteaConfig',
      callback: (resp: any) => {
        setLoading(false);
        if (resp?.success && resp?.data) {
          const d = resp.data;
          form.setFieldsValue({
            host: d.host ?? 'localhost',
            port: d.port ?? 3000,
            userId: d.userId ?? '',
            token: d.token ?? '',
          });
        } else {
          form.setFieldsValue({
            host: 'localhost',
            port: 3000,
            userId: '',
            token: '',
          });
        }
      },
    });
  }, [dispatch]);

  const onFinish = (values: any) => {
    setSaving(true);
    dispatch({
      type: 'platform/saveGiteaConfig',
      payload: {
        host: values.host,
        port: values.port,
        userId: values.userId,
        token: values.token,
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
          <div className="air-grid-panel-title">GIT</div>
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
                host: 'localhost',
                port: 3000,
                userId: '',
                token: '',
              }}
              style={{maxWidth: 640, padding: '0 24px 24px'}}
              disabled={loading}
          >
            <Form.Item label="主机" name="host" rules={[{required: true, message: '请输入主机地址'}]}>
              <Input placeholder="如 localhost 或 127.0.0.1"/>
            </Form.Item>
            <Form.Item label="端口" name="port" rules={[{required: true, message: '请输入端口'}]}>
              <InputNumber min={1} max={65535} placeholder="默认 3000" style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label="用户ID" name="userId" rules={[{required: true, message: '请输入用户ID'}]}>
              <Input placeholder="Gitea 用户ID"/>
            </Form.Item>
            <Form.Item label="访问令牌" name="token" rules={[{required: true, message: '请输入访问令牌'}]}>
              <Input.Password placeholder="Gitea 访问令牌" autoComplete="new-password"/>
            </Form.Item>
          </Form>
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(GiteaSettingsPanel);
