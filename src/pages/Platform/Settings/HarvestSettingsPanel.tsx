import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, GroupSplitter, Message} from 'air-design';
import {Form, InputNumber, Select, Switch} from 'antd';
import '../Admin/Settings/AdminPaasPanel.less';

/**
 * 内容采集设置面板
 *
 * 配置 JWebCrawler 多引擎爬虫系统的运行参数，包括引擎开关、超时、AI内容整理等。
 * 配置通过 AdminPaas 接口持久化到 H2，支持热更新。
 *
 * Created by ChaiMingXu, on 2026/05/07
 */
const HarvestSettingsPanel: React.FC<any> = (props) => {
  const {dispatch, frameSize} = props;
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [llmModelOptions, setLlmModelOptions] = useState<{value: string; label: string}[]>([]);
  const [ocrModelOptions, setOcrModelOptions] = useState<{value: string; label: string}[]>([]);
  const contentHeight = (frameSize?.height || 600) - 60;

  useEffect(() => {
    setLoading(true);
    // 获取启用的模型列表，用于 OCR 和 Refine 模型选择
    dispatch({
      type: 'llm/fetchActiveModels',
      callback: (resp: any) => {
        if (resp?.success && resp.data) {
          const allModels = resp.data || [];
          setLlmModelOptions(
            allModels.filter((m: any) => m.type !== 'embedding' && m.type !== 'ocr')
              .map((m: any) => ({value: m.model, label: m.name || m.model}))
          );
          setOcrModelOptions(
            allModels.filter((m: any) => m.type === 'ocr')
              .map((m: any) => ({value: m.model, label: m.name || m.model}))
          );
        }
      },
    });
    dispatch({
      type: 'platform/fetchCrawlConfig',
      callback: (resp: any) => {
        setLoading(false);
        if (resp?.success && resp?.data) {
          const d = resp.data;
          form.setFieldsValue({
            jsoupEnabled: d.jsoupEnabled ?? true,
            jsoupTimeoutMs: d.jsoupTimeoutMs ?? 10000,
            playwrightEnabled: d.playwrightEnabled ?? true,
            playwrightTimeoutMs: d.playwrightTimeoutMs ?? 30000,
            playwrightWaitStrategy: d.playwrightWaitStrategy ?? 'networkidle',
            playwrightMaxConcurrentPages: d.playwrightMaxConcurrentPages ?? 20,
            ocrEnabled: d.ocrEnabled ?? true,
            ocrModelName: d.ocrModelName ?? '',
            refineEnabled: d.refineEnabled ?? true,
            refineModelName: d.refineModelName ?? '',
            rateLimitEnabled: d.rateLimitEnabled ?? true,
            rateLimitRpm: d.rateLimitRpm ?? 30,
            proxyEnabled: d.proxyEnabled ?? false,
            fallbackEnabled: d.fallbackEnabled ?? true,
            maxRetriesPerEngine: d.maxRetriesPerEngine ?? 2,
          });
        } else {
          form.setFieldsValue({
            jsoupEnabled: true,
            jsoupTimeoutMs: 10000,
            playwrightEnabled: true,
            playwrightTimeoutMs: 30000,
            playwrightWaitStrategy: 'networkidle',
            playwrightMaxConcurrentPages: 20,
            ocrEnabled: true,
            ocrModelName: '',
            refineEnabled: true,
            refineModelName: '',
            rateLimitEnabled: true,
            rateLimitRpm: 30,
            proxyEnabled: false,
            fallbackEnabled: true,
            maxRetriesPerEngine: 2,
          });
        }
      },
    });
  }, [dispatch]);

  const onFinish = (values: any) => {
    setSaving(true);
    dispatch({
      type: 'platform/saveCrawlConfig',
      payload: values,
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
        <div className="air-grid-panel-title">内容采集</div>
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
            jsoupEnabled: true,
            jsoupTimeoutMs: 10000,
            playwrightEnabled: true,
            playwrightTimeoutMs: 30000,
            playwrightWaitStrategy: 'networkidle',
            playwrightMaxConcurrentPages: 20,
            ocrEnabled: true,
            ocrModelName: '',
            refineEnabled: true,
            refineModelName: '',
            rateLimitEnabled: true,
            rateLimitRpm: 30,
            proxyEnabled: false,
            fallbackEnabled: true,
            maxRetriesPerEngine: 2,
          }}
          style={{maxWidth: 640, padding: '0 24px 24px'}}
          disabled={loading}
        >
          <GroupSplitter title="L1 Jsoup 引擎" height={32}/>
          <Form.Item label="启用 Jsoup 引擎" name="jsoupEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="请求超时（毫秒）" name="jsoupTimeoutMs">
            <InputNumber min={1000} max={60000} step={1000} style={{width: '100%'}} placeholder="10000"/>
          </Form.Item>

          <GroupSplitter title="L2 Playwright 引擎" height={32} paddingTop={16}/>
          <Form.Item label="启用 Playwright 引擎" name="playwrightEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="页面加载超时（毫秒）" name="playwrightTimeoutMs">
            <InputNumber min={5000} max={120000} step={5000} style={{width: '100%'}} placeholder="30000"/>
          </Form.Item>
          <Form.Item label="页面等待策略" name="playwrightWaitStrategy">
            <Select options={[
              {value: 'networkidle', label: 'networkidle（网络空闲）'},
              {value: 'load', label: 'load（页面加载完成）'},
              {value: 'domcontentloaded', label: 'domcontentloaded（DOM就绪）'},
            ]}/>
          </Form.Item>
          <Form.Item label="最大并发页面数" name="playwrightMaxConcurrentPages">
            <InputNumber min={1} max={50} style={{width: '100%'}} placeholder="20"/>
          </Form.Item>

          <GroupSplitter title="L3 OCR 兜底引擎" height={32} paddingTop={16}/>
          <Form.Item label="启用 OCR 引擎" name="ocrEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="OCR 模型名称" name="ocrModelName">
            <Select allowClear placeholder="使用默认模型" options={ocrModelOptions} showSearch filterOption={() => true}/>
          </Form.Item>

          <GroupSplitter title="AI 内容整理" height={32} paddingTop={16}/>
          <Form.Item label="启用 AI 内容整理" name="refineEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="Refine 模型名称" name="refineModelName">
            <Select allowClear placeholder="使用默认模型" options={llmModelOptions} showSearch filterOption={() => true}/>
          </Form.Item>

          <GroupSplitter title="反爬与降级" height={32} paddingTop={16}/>
          <Form.Item label="启用请求限流" name="rateLimitEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="每分钟最大请求数" name="rateLimitRpm">
            <InputNumber min={1} max={200} style={{width: '100%'}} placeholder="30"/>
          </Form.Item>
          <Form.Item label="启用代理池" name="proxyEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="启用引擎降级" name="fallbackEnabled" valuePropName="checked">
            <Switch/>
          </Form.Item>
          <Form.Item label="单引擎最大重试次数" name="maxRetriesPerEngine">
            <InputNumber min={0} max={5} style={{width: '100%'}} placeholder="2"/>
          </Form.Item>

        </Form>
      </div>
    </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(HarvestSettingsPanel);
