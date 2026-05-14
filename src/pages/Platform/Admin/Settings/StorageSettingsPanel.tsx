import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, Message} from 'air-design';
import {Form, Input, InputNumber} from 'antd';
import './AdminPaasPanel.less';

/**
 * Storage 对象存储服务设置面板
 *
 * 布局与 Redis、LibreOffice 等面板一致：air-grid-panel（标题栏 + 内容区）。
 * 用于配置对象存储服务的连接地址和端口。
 * 配置持久化到网关 EmbeddedStorage（H2），通过 /admin/paas/storage 接口读写。
 *
 * Created by ChaiMingXu
 */
const StorageSettingsPanel: React.FC<any> = (props) => {
  const {dispatch, frameSize} = props;
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const contentHeight = (frameSize?.height || 600) - 60;

  useEffect(() => {
    setLoading(true);
    dispatch({
      type: 'platform/fetchStorageConfig',
      callback: (resp: any) => {
        setLoading(false);
        if (resp?.success && resp?.data) {
          const d = resp.data;
          form.setFieldsValue({
            host: d.host ?? 'localhost',
            port: d.port ?? 9000,
          });
        } else {
          form.setFieldsValue({
            host: 'localhost',
            port: 9000,
          });
        }
      },
    });
  }, [dispatch]);

  const onFinish = (values: any) => {
    setSaving(true);
    dispatch({
      type: 'platform/saveStorageConfig',
      payload: {
        host: values.host,
        port: values.port,
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
          <div className="air-grid-panel-title">Storage</div>
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
                port: 9000,
              }}
              style={{maxWidth: 640, padding: '0 24px 24px'}}
              disabled={loading}
          >
            <Form.Item label="主机" name="host" rules={[{required: true, message: '请输入主机地址'}]}>
              <Input placeholder="如 localhost 或 127.0.0.1"/>
            </Form.Item>
            <Form.Item label="端口" name="port" rules={[{required: true, message: '请输入端口'}]}>
              <InputNumber min={1} max={65535} placeholder="默认 9000" style={{width: '100%'}}/>
            </Form.Item>
          </Form>
        </div>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(StorageSettingsPanel);
