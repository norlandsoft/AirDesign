import React, {useEffect, useState} from "react";
import {connect} from 'umi';
import {Button, Dialog, error, SlidePanel, Table, TableRowMenu} from 'air-design';
import {Form, Input, Select, Tag} from "antd";
import {LangModelProviderResponse, LangModelResponse} from '@/types/langModel';

const {TextArea} = Input;
const {Option} = Select;

/**
 * 语言模型管理面板
 *
 * 用于管理平台中的AI语言模型配置，包括模型的增删改查、启用禁用等操作。
 * 支持多种模型类型的配置管理。
 * 设计思路：列表展示模型信息，通过弹窗与侧边栏完成创建与编辑。
 *
 * @author ChaiMingXu
 * Created by ChaiMingXu, on 2026-02-08
 */
const LangModelSettingsPanel: React.FC<{
  dispatch: any;
  frameSize: { height: number };
  llm: {
    modelList: LangModelResponse[];
    providerList: LangModelProviderResponse[];
  };
}> = props => {
  const {
    dispatch,
    frameSize,
    llm: {modelList, providerList = []},
  } = props;

  const tableHeight = frameSize.height - 60;
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [emptyText, setEmptyText] = useState('暂无数据');
  const [showSlidePanel, setShowSlidePanel] = useState(false);

  // 模型类型选项：LLM-语言模型，Embedding-嵌入式模型，Vision-视觉模型，OCR-OCR识别模型
  const modelTypes = [
    {value: 'llm', label: '语言模型'},
    {value: 'embedding', label: '嵌入式模型'},
    {value: 'vision', label: '视觉模型'},
    {value: 'ocr', label: 'OCR识别'},
  ];

  // 模型服务接口类型选项
  const apiTypes = [
    {value: 'openai-completions', label: 'OpenAI Completions'},
    {value: 'openai-messages', label: 'OpenAI Messages'},
    {value: 'anthropic-messages', label: 'Anthropic Messages'},
    {value: 'google-messages', label: 'Google Messages'}
  ];

  // 获取类型显示文本
  const getTypeLabel = (type: string) => {
    const item = modelTypes.find(t => t.value === type);
    return item ? item.label : type;
  };

  useEffect(() => {
    // 获取模型列表
    dispatch({
      type: 'llm/fetchModels',
      payload: {},
      callback: resp => {
        if (!resp.success) {
          if (resp.code && resp.code.startsWith('9903')) {
            setEmptyText(resp.message);
          } else {
            error({
              title: '获取模型列表失败',
              message: resp.message
            });
          }
        }
      }
    });
    // 获取供应商列表
    dispatch({type: 'llm/fetchSuppliers'});
  }, []);

  // 规范化提交数据，避免空 API 密钥覆盖已有值
  const normalizeModelPayload = (values: any) => {
    const payload = {...values};
    if (!payload.apiKey || !String(payload.apiKey).trim()) {
      delete payload.apiKey;
    }
    return payload;
  };

  // 新建模型对话框
  const handleShowNewModelDialog = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      type: 'llm',
      api: 'openai-completions',
      provider: providerList.length > 0 ? providerList[0].code : 'lmstudio',
      status: 'A',
    });

    Dialog({
      title: '新建模型',
      width: 600,
      content: (
          <Form form={createForm} labelCol={{span: 5}} wrapperCol={{span: 18}}>
            <Form.Item
                label="名称"
                name="name"
                rules={[{required: true, message: '请输入名称'}]}
            >
              <Input placeholder="请输入模型名称，如：GPT-4"/>
            </Form.Item>
            <Form.Item
                label="描述"
                name="description"
            >
              <TextArea rows={3} placeholder="请输入模型描述"/>
            </Form.Item>
            <Form.Item
                label="类型"
                name="type"
                rules={[{required: true, message: '请选择模型类型'}]}
            >
              <Select placeholder="请选择模型类型">
                {modelTypes.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
                label="供应商"
                name="provider"
            >
              <Select placeholder="请选择供应商" allowClear>
                {providerList.map(p => (
                    <Option key={p.code} value={p.code}>{p.name || p.code}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
                label="模型"
                name="model"
                rules={[{required: true, message: '请输入模型标识'}]}
            >
              <Input placeholder="请输入API调用标识，如：gpt-4"/>
            </Form.Item>
            <Form.Item
                label="接口类型"
                name="api"
            >
              <Select placeholder="请选择模型服务接口类型" allowClear>
                {apiTypes.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
                label="BaseURL"
                name="baseUrl"
            >
              <Input placeholder="请输入API基础地址"/>
            </Form.Item>
            <Form.Item
                label="API密钥"
                name="apiKey"
            >
              <Input.Password placeholder="请输入API密钥"/>
            </Form.Item>
          </Form>
      ),
      onConfirm: dlg => {
        createForm.validateFields().then(values => {
          dispatch({
            type: 'llm/createModel',
            payload: {
              ...normalizeModelPayload(values),
              provider: values.provider || 'lmstudio',
              api: values.api || 'openai-completions'
            },
            callback: resp => {
              if (resp.success) {
                dlg.doCancel();
              } else {
                error({
                  title: '新建模型失败',
                  message: resp.message
                });
              }
            }
          });
        });
      }
    });
  };

  // 保存模型信息
  const handleSaveModelInfo = () => {
    editForm.validateFields().then(values => {
      const payload = normalizeModelPayload(values);
      if (!payload.api) {
        payload.api = 'openai-completions';
      }
      dispatch({
        type: 'llm/updateModel',
        payload,
        callback: resp => {
          if (resp.success) {
            setShowSlidePanel(false);
          } else {
            error({
              title: '更新模型失败',
              message: resp.message
            });
          }
        }
      });
    });
  };

  // 设置/取消默认模型
  const handleSetDefaultModel = (record: LangModelResponse) => {
    if (record.isDefault) {
      // 取消默认：通过更新模型的方式将 isDefault 设为 false
      Dialog({
        title: '取消默认模型',
        width: 400,
        content: <div>确定要取消模型 "{record.name}" 的默认设置吗？</div>,
        onConfirm: dlg => {
          dispatch({
            type: 'llm/updateModel',
            payload: {id: record.id, isDefault: false},
            callback: resp => {
              if (resp.success) {
                dlg.doCancel();
              } else {
                error({title: '取消默认失败', message: resp.message});
              }
            }
          });
        }
      });
    } else {
      // 设置默认
      Dialog({
        title: '设为默认模型',
        width: 400,
        content: <div>确定要将模型 "{record.name}" 设为系统默认模型吗？</div>,
        onConfirm: dlg => {
          dispatch({
            type: 'llm/setDefaultModel',
            payload: {id: record.id},
            callback: resp => {
              if (resp.success) {
                dlg.doCancel();
              } else {
                error({title: '设置默认失败', message: resp.message});
              }
            }
          });
        }
      });
    }
  };

  // 启用/禁用模型
  const handleToggleModelStatus = (record: LangModelResponse) => {
    const isEnable = record.status !== 'A';
    const actionType = isEnable ? 'llm/enableModel' : 'llm/disableModel';
    const actionText = isEnable ? '启用' : '禁用';

    Dialog({
      title: `${actionText}模型`,
      width: 400,
      content: <div>确定要{actionText}模型 "{record.name}" 吗？</div>,
      onConfirm: dlg => {
        dispatch({
          type: actionType,
          payload: {id: record.id},
          callback: resp => {
            if (resp.success) {
              dlg.doCancel();
            } else {
              error({
                title: `${actionText}模型失败`,
                message: resp.message
              });
            }
          }
        });
      }
    });
  };

  // 删除模型
  const handleDeleteModel = (record: LangModelResponse) => {
    Dialog({
      title: '删除模型',
      width: 400,
      content: <div>确定要删除模型 "{record.name}" 吗？此操作不可恢复。</div>,
      onConfirm: dlg => {
        dispatch({
          type: 'llm/deleteModel',
          payload: {id: record.id},
          callback: resp => {
            if (resp.success) {
              dlg.doCancel();
            } else {
              error({
                title: '删除模型失败',
                message: resp.message
              });
            }
          }
        });
      }
    });
  };

  // 所有类型均展示在列表中，embedding/vision 类型通过 Tag 标签区分
  const displayList = modelList || [];

  return (
      <div className='air-grid-panel'>
        <div className="air-grid-panel-top">
          <div className="air-grid-panel-title">
            模型管理
          </div>
          <div className="air-grid-panel-toolbar">
            <Button type={'primary'} onClick={handleShowNewModelDialog}>新建</Button>
          </div>
        </div>
        <div style={{height: tableHeight, overflow: 'hidden'}}>
          <Table
              data={displayList}
              columns={[
                {
                  title: '名称',
                  dataIndex: 'name',
                  width: 150,
                  render: (name: string, record: LangModelResponse) => (
                      <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                        <span>{name}</span>
                        {record.type === 'embedding' && <Tag color="orange" style={{
                          fontSize: 11,
                          lineHeight: '18px',
                          padding: '0 5px',
                          margin: 0
                        }}>嵌入式</Tag>}
                        {record.type === 'vision' && <Tag color="purple" style={{
                          fontSize: 11,
                          lineHeight: '18px',
                          padding: '0 5px',
                          margin: 0
                        }}>视觉</Tag>}
                        {record.type === 'ocr' && <Tag color="cyan" style={{
                          fontSize: 11,
                          lineHeight: '18px',
                          padding: '0 5px',
                          margin: 0
                        }}>OCR</Tag>}
                      </div>
                  ),
                },
                {
                  title: '模型',
                  dataIndex: 'model',
                  width: 180,
                  render: (_: unknown, record: LangModelResponse) => (
                      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <span style={{
                          fontSize: 14,
                          fontWeight: 500
                        }}>{record.providerText || record.provider || '-'}</span>
                        <span style={{fontSize: 12, color: '#666'}}>{record.model || '-'}</span>
                      </div>
                  ),
                },
                {
                  title: '接口',
                  dataIndex: 'api',
                  width: 200,
                  render: (_: unknown, record: LangModelResponse) => {
                    const api = record.api;
                    const item = apiTypes.find(t => t.value === api);
                    const apiLabel = item ? item.label : (api || 'OpenAI Completions');
                    return (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                          <span style={{fontSize: 14, fontWeight: 500}}>{apiLabel}</span>
                          <span style={{
                            fontSize: 12,
                            color: '#666',
                            wordBreak: 'break-all'
                          }}>{record.baseUrl || '-'}</span>
                        </div>
                    );
                  },
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  width: 80,
                  render: (status: string) => {
                    if (status === 'A') {
                      return <Tag color="success">启用</Tag>;
                    } else if (status === 'F') {
                      return <Tag color="error">禁用</Tag>;
                    } else {
                      return <Tag>{status || '未知'}</Tag>;
                    }
                  }
                },
                {
                  title: '默认',
                  dataIndex: 'isDefault',
                  width: 60,
                  render: (isDefault: boolean) => {
                    if (isDefault) {
                      return <Tag color="blue">Default</Tag>;
                    }
                    return null;
                  }
                },
                {
                  title: '操作',
                  width: 32,
                  render: (_, record) => {
                    const menuItems = [
                      ...((record.type === 'llm' || record.type === 'ocr') ? [{
                        key: 'setDefault',
                        label: record.isDefault ? '取消默认' : '设为默认',
                        onClick: () => handleSetDefaultModel(record)
                      }] : []),
                      { key: 'split-1', type: 'split' },
                      {
                        key: 'toggleStatus',
                        label: record.status === 'A' ? '禁用' : '启用',
                        onClick: () => handleToggleModelStatus(record)
                      },
                      {
                        key: 'delete',
                        label: '删除',
                        onClick: () => handleDeleteModel(record)
                      }
                    ];

                    return (
                        <TableRowMenu
                            items={menuItems}
                            data={record}
                        />
                    );
                  }
                }
              ]}
              height={tableHeight}
              rowHeight={56}
              padding={4}
              bordered={true}
              pagination={false}
              showEmpty={true}
              emptyText={emptyText}
              onItemClick={data => {
                editForm.resetFields();
                editForm.setFieldsValue({
                  ...data,
                  api: data.api || 'openai-completions',
                  provider: data.provider,
                });
                setShowSlidePanel(true);
              }}
          />
        </div>

        <SlidePanel
            title={'模型信息'}
            type={'medium'}
            open={showSlidePanel}
            closable={true}
            hasCloseButton={true}
            confirmButtonText={'保存'}
            closeButtonText={'关闭'}
            onConfirm={handleSaveModelInfo}
            onClose={() => setShowSlidePanel(false)}
        >
          <Form form={editForm} labelCol={{span: 5}} wrapperCol={{span: 18}}>
            <Form.Item name="id" hidden>
              <Input/>
            </Form.Item>
            <Form.Item
                label="名称"
                name="name"
                rules={[{required: true, message: '请输入模型名称'}]}
            >
              <Input placeholder="请输入模型名称"/>
            </Form.Item>
            <Form.Item
                label="描述"
                name="description"
            >
              <TextArea rows={3} placeholder="请输入模型描述"/>
            </Form.Item>
            <Form.Item
                label="供应商"
                name="provider"
            >
              <Select placeholder="请选择供应商" allowClear>
                {providerList.map(p => (
                    <Option key={p.code} value={p.code}>{p.name || p.code}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
                label="模型"
                name="model"
                rules={[{required: true, message: '请输入模型标识'}]}
            >
              <Input placeholder="请输入API调用标识"/>
            </Form.Item>
            <Form.Item
                label="接口类型"
                name="api"
            >
              <Select placeholder="请选择模型服务接口类型" allowClear>
                {apiTypes.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
                label="基础地址"
                name="baseUrl"
            >
              <Input placeholder="请输入API基础地址"/>
            </Form.Item>
            <Form.Item
                label="API密钥"
                name="apiKey"
            >
              <Input.Password placeholder="请输入API密钥"/>
            </Form.Item>
          </Form>
        </SlidePanel>
      </div>
  );
};

export default connect(({global, llm}) => ({
  frameSize: global.frameSize,
  llm,
}))(LangModelSettingsPanel);
