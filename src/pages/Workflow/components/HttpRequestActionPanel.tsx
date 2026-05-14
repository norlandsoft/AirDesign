import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, Form, Input, Select, Space} from 'antd';
import CodeEditor from '@/components/CodeEditor';
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import './HttpRequestActionPanel.less';

/**
 * HTTP请求节点配置面板
 *
 * 用于配置HTTP请求节点的参数，包括：
 * - 请求方法（GET、POST等）
 * - 请求URL
 * - 请求头（键值对形式）
 * - 请求体（对于POST等需要请求体的方法）
 *
 * @author ChaiMingXu, on 2026/1/1
 */
const HttpRequestActionPanel: React.FC<any> = props => {

  const {
    frameSize,
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  // Headers 列表状态
  const [headers, setHeaders] = useState<Array<{ key: string, value: string }>>([]);

  useEffect(() => {
    form.resetFields();

    // 从 action.props 解析 HTTP 请求配置
    let httpProps: any = {};
    if (action?.props) {
      try {
        httpProps = typeof action.props === 'string' ? JSON.parse(action.props) : action.props;
      } catch (e) {
        console.warn('解析 action.props 失败:', e);
      }
    }

    // 初始化 method 和 url：优先使用 props 中的数据，否则使用默认值
    const method = httpProps?.method || 'POST';
    const url = httpProps?.url || '';

    // 初始化 headers
    const headersMap = httpProps?.headers || extraProps?.headers || {};
    const headersList = Object.keys(headersMap).map(key => ({
      key,
      value: headersMap[key] || ''
    }));
    if (headersList.length === 0) {
      headersList.push({key: '', value: ''});
    }
    setHeaders(headersList);

    // 初始化 extraProps
    const initialExtraProps = {
      method,
      url,
      body: httpProps?.body || extraProps?.body || '',
      headers: headersMap
    };

    setExtraProps({
      ...extraProps,
      ...initialExtraProps
    });

    // 设置 form 的初始值
    form.setFieldsValue({
      ...action,
      method,
      url
    });
  }, []);

  // 更新 headers 到 extraProps
  const updateHeaders = (newHeaders: Array<{ key: string, value: string }>) => {
    setHeaders(newHeaders);
    const headersMap: Record<string, string> = {};
    newHeaders.forEach(item => {
      if (item.key && item.key.trim()) {
        headersMap[item.key.trim()] = item.value || '';
      }
    });
    setExtraProps({
      ...extraProps,
      headers: headersMap
    });
  };

  // 添加新的 header 行
  const handleAddHeader = () => {
    const newHeaders = [...headers, {key: '', value: ''}];
    updateHeaders(newHeaders);
  };

  // 删除 header 行
  const handleDeleteHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    if (newHeaders.length === 0) {
      newHeaders.push({key: '', value: ''});
    }
    updateHeaders(newHeaders);
  };

  // 更新 header 的 key 或 value
  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = {...newHeaders[index], [field]: value};
    updateHeaders(newHeaders);
  };

  // 处理表单值变化，同步到 extraProps
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const updates: any = {};
    if (changedValues.url !== undefined) {
      updates.url = changedValues.url || '';
    }
    if (changedValues.method !== undefined) {
      updates.method = changedValues.method || 'POST';
    }
    if (Object.keys(updates).length > 0) {
      setExtraProps({
        ...extraProps,
        ...updates
      });
    }
  };

  return (
      <div className={'air-agent-action-panel'}>
        <Form
            form={form}
            layout={'horizontal'}
            labelCol={{span: 2}}
            wrapperCol={{span: 22}}
            labelAlign={"left"}
            onValuesChange={handleValuesChange}
        >
          <Form.Item
              name={'action'}
              hidden={true}
          >
            <Input/>
          </Form.Item>
          <Form.Item
              label={'名称'}
              name={'name'}
              rules={[{required: true, message: '请输入名称'}]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
              label={'描述'}
              name={'description'}
          >
            <Input.TextArea rows={2} style={{resize: 'none'}}/>
          </Form.Item>

          <Form.Item
              label={'请求'}
          >
            <Space.Compact style={{width: '100%'}}>
              <Form.Item
                  name={'method'}
                  noStyle
              >
                <Select
                    style={{width: 100}}
                    options={['GET', 'POST'].map(item => ({
                      value: item,
                      label: item
                    }))}
                />
              </Form.Item>
              <Form.Item
                  name={'url'}
                  noStyle
              >
                <Input
                    placeholder="请输入请求URL"
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
              label={'请求头'}
              layout={'vertical'}
              labelCol={{span: 24}}
              wrapperCol={{span: 24}}
          >
            <div style={{border: '1px solid #e8e8e8', borderRadius: '4px', padding: '8px'}}>
              {headers.map((header, index) => (
                  <div key={index} style={{display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center'}}>
                    <Input
                        placeholder="Header名称"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        style={{flex: 1}}
                    />
                    <Input
                        placeholder="Header值"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        style={{flex: 2}}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined/>}
                        onClick={() => handleDeleteHeader(index)}
                        style={{flexShrink: 0}}
                    />
                  </div>
              ))}
              <Button
                  type="dashed"
                  icon={<PlusOutlined/>}
                  onClick={handleAddHeader}
                  block
                  style={{marginTop: '8px'}}
              >
                添加请求头
              </Button>
            </div>
          </Form.Item>

          <Form.Item
              label={'请求体:'}
              layout={'vertical'}
              labelCol={{span: 24}}
              wrapperCol={{span: 24}}
              hidden={extraProps.method === 'GET' || extraProps.method === 'DELETE'}
          >
            <CodeEditor
                width={'100%'}
                height={frameSize.height - 600}
                border={true}
                language={'markdown'}
                content={extraProps.body}
                showMap={false}
                onChange={(content: string) => {
                  setExtraProps({
                    ...extraProps,
                    body: content
                  })
                }}
            />
          </Form.Item>

          <Form.Item
              label={'输出'}
              name={'outputKey'}
          >
            <Input placeholder="用于保存请求返回的body内容，供后续节点使用"/>
          </Form.Item>
        </Form>
      </div>
  );
}

export default connect(({global}) => ({
  frameSize: global.frameSize
}))(HttpRequestActionPanel);

