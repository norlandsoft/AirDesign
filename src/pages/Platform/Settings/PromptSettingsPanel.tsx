import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {error, SlidePanel, Table} from 'air-design';
import CodeEditor from '@/components/CodeEditor';
import {Form, Input} from 'antd';
import type {LangPromptResponse} from '@/types/prompt';

/** 适配 Form.Item 的 CodeEditor：接收 value/onChange，转成 content/onChange 供 CodeEditor 使用 */
const CodeEditorFormField: React.FC<any> = ({value, onChange, ...rest}) => (
    <CodeEditor content={value ?? ''} onChange={onChange} {...rest} />
);

/**
 * 提示词管理面板
 * 支持名称与内容更新，不支持新增、删除；状态固定为启用
 *
 * @author ChaiMingXu
 */
const PromptSettingsPanel: React.FC<any> = props => {
  const {dispatch, frameSize, prompt: promptState} = props;
  const {promptList = []} = promptState || {};

  const tableHeight = frameSize.height - 60;
  const [editForm] = Form.useForm();
  const [emptyText, setEmptyText] = useState('暂无数据');
  const [showSlidePanel, setShowSlidePanel] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'prompt/fetchList',
      payload: {},
      callback: (resp: any) => {
        if (!resp?.success && resp?.code?.startsWith?.('9903')) {
          setEmptyText(resp?.message || '暂无数据');
        } else if (!resp?.success) {
          error({title: '获取提示词列表失败', message: resp?.message});
        }
      },
    });
  }, []);

  const handleSaveEdit = () => {
    editForm.validateFields().then(values => {
      dispatch({
        type: 'prompt/update',
        payload: {id: values.id, name: values.name, content: values.content},
        callback: (resp: any) => {
          if (resp?.success) setShowSlidePanel(false);
          else error({title: '保存失败', message: resp?.message});
        },
      });
    });
  };

  return (
      <div className="air-grid-panel">
        <div className="air-grid-panel-top">
          <div className="air-grid-panel-title">提示词管理</div>
        </div>
        <div style={{height: tableHeight, overflow: 'hidden'}}>
          <Table
              data={promptList}
              columns={[
                {
                  title: '名称 / ID',
                  width: 300,
                  render: (_: any, record: LangPromptResponse) => (
                      <div style={{lineHeight: 1.4}}>
                        <div style={{fontWeight: 500}}>{record.name || '—'}</div>
                        <div style={{
                          fontSize: 12,
                          color: 'var(--semi-color-text-2, #666)',
                          marginTop: 2
                        }}>{record.id || '—'}</div>
                      </div>
                  ),
                },
                {
                  title: '描述',
                  dataIndex: 'description',
                  flex: 1,
                  ellipsis: false,
                  render: (text: string) => (
                      <div
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as any,
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}
                          title={text}
                      >
                        {text || '—'}
                      </div>
                  ),
                },
              ]}
              height={tableHeight}
              rowHeight={56}
              padding={4}
              bordered
              pagination
              showEmpty
              emptyText={emptyText}
              onItemClick={(record: LangPromptResponse) => {
                editForm.resetFields();
                editForm.setFieldsValue({id: record.id, name: record.name, content: record.content});
                setShowSlidePanel(true);
              }}
          />
        </div>

        <SlidePanel
            title="编辑提示词内容"
            type="huge"
            open={showSlidePanel}
            closable
            hasCloseButton
            confirmButtonText="保存"
            closeButtonText="关闭"
            onConfirm={handleSaveEdit}
            onClose={() => setShowSlidePanel(false)}
        >
          <Form form={editForm} labelCol={{span: 1}} wrapperCol={{span: 23}}>
            <Form.Item name="id" label="编号">
              <Input disabled/>
            </Form.Item>
            <Form.Item name="name" label="名称">
              <Input placeholder="提示词展示名称"/>
            </Form.Item>
            <Form.Item name="content" label="内容" rules={[{required: true, message: '请输入提示词内容'}]}>
              <CodeEditorFormField
                  width="100%"
                  height={Math.max(400, (frameSize?.height ?? 600) - 280)}
                  language="markdown"
                  border
                  showMap={false}
                  wordWrap="on"
              />
            </Form.Item>
          </Form>
        </SlidePanel>
      </div>
  );
};

export default connect(({global, prompt}: any) => ({
  frameSize: global.frameSize,
  prompt,
}))(PromptSettingsPanel);
