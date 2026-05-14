import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {connect} from 'umi';
import {Button, Dialog, error, IconButton} from 'air-design';
import {Form, Input, message, Select, Tag} from 'antd';
import CodeEditor from '@/components/CodeEditor';
import {getAgentIconUrl, AGENT_ICON_OPTIONS} from '@/utils/AgentIconUtils';
import './AgentPanel.less';

/**
 * OpenClaw 标准配置文件列表
 */
const CORE_FILE_NAMES = [
  'AGENTS.md', 'SOUL.md', 'TOOLS.md', 'IDENTITY.md',
  'USER.md', 'HEARTBEAT.md',
];

/**
 * 平台管理 - 智能体管理面板
 *
 * 主-从布局：左侧智能体成员列表，右侧详情区（概览/设定两个 Tab）。
 * 概览 Tab 展示基本信息和模型选择；设定 Tab 提供文件编辑器。
 * 数据通过 platform DVA model 从后端 /api/openclaw/agents/* 获取。
 *
 * Created by ChaiMingXu, on 2026/04/30
 */
interface AgentPanelProps {
  frameSize?: { width: number; height: number };
  dispatch?: any;
  openclaw?: {
    openclawAgentList?: any[];
    primaryModel?: string;
    fallbackModels?: string[];
    availableModels?: any[];
    openclawWorkspace?: string;
  };
}

const LAYOUT = {
  LIST_WIDTH: 240,
  LIST_HEADER_H: 52,
  DETAIL_HEADER_H: 52,
  TABS_H: 36,
  CONTENT_PAD_V: 6,
  CONTENT_PAD_H: 8,
  FILE_LIST_WIDTH: 150,
  FILES_GAP: 4,
  FILE_LIST_HEADER_H: 50,
  FILE_EDITOR_HEADER_H: 50,
  FILE_EDITOR_BORDER: 1,
  NAVI_BAR_WIDTH: 220,
};

const AgentPanel: React.FC<AgentPanelProps> = (props) => {
  const {dispatch, openclaw} = props;
  const agentList = openclaw?.openclawAgentList || [];
  const primaryModel = openclaw?.primaryModel || '';
  const fallbackModels = openclaw?.fallbackModels || [];
  const availableModels = openclaw?.availableModels || [];
  const openclawWorkspace = openclaw?.openclawWorkspace || '';

  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'files'>('overview');
  const [createForm] = Form.useForm();
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  /** 关闭头像选择面板 */
  const closeAvatarPicker = () => setAvatarPickerVisible(false);

  /** 选中某个头像图标：更新表单值并关闭面板 */
  const handlePickAvatar = (key: string) => {
    createForm.setFieldsValue({emoji: key});
    setAvatarPickerVisible(false);
  };

  // ---- 概览 Tab: 模型相关 ----
  const [modelLoading, setModelLoading] = useState(false);

  // ---- 设定 Tab: 文件编辑相关 ----
  const [selectedFile, setSelectedFile] = useState<string>(CORE_FILE_NAMES[0]);
  const [fileContent, setFileContent] = useState('');
  const [fileContentDirty, setFileContentDirty] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  /** 布局计算 */
  const layout = useMemo(() => {
    const fw = props.frameSize?.width ?? 1200;
    const fh = props.frameSize?.height ?? 800;
    const listBodyH = fh - LAYOUT.LIST_HEADER_H;
    const detailW = fw - LAYOUT.LIST_WIDTH;
    const contentH = fh - LAYOUT.DETAIL_HEADER_H - LAYOUT.TABS_H - LAYOUT.CONTENT_PAD_V * 2;
    const editorW = detailW
      - LAYOUT.CONTENT_PAD_H * 2
      - LAYOUT.FILE_LIST_WIDTH
      - LAYOUT.FILES_GAP
      - LAYOUT.FILE_EDITOR_BORDER * 2
      - LAYOUT.NAVI_BAR_WIDTH;
    const editorH = contentH
      - LAYOUT.FILE_EDITOR_HEADER_H
      - LAYOUT.FILE_EDITOR_BORDER * 2;
    return {listBodyH, detailW, contentH, editorW, editorH};
  }, [props.frameSize?.width, props.frameSize?.height]);

  /** 加载智能体列表 */
  const loadAgentList = () => {
    if (!dispatch) return;
    dispatch({
      type: 'openclaw/fetchOpenclawAgents',
      callback: (resp: any) => {
        if (!resp?.success) {
          error({title: '获取智能体列表失败', message: resp?.message || '请确认服务已启动'});
        } else {
          const list = resp.data || [];
          if (list.length > 0 && !selectedAgent) {
            setSelectedAgent(list[0]);
          }
        }
      },
    });
  };

  useEffect(() => { loadAgentList(); }, [dispatch]);

  /** 选中智能体变化时加载模型配置 */
  useEffect(() => {
    if (selectedAgent?.id && dispatch) {
      dispatch({type: 'openclaw/fetchModelOptions'});
      dispatch({type: 'openclaw/fetchModelDefaults'});
    }
  }, [selectedAgent?.id]);

  /** 文件选择或智能体变化时加载文件内容 */
  useEffect(() => {
    if (!selectedAgent?.id || !selectedFile || !dispatch) return;
    setFileLoading(true);
    dispatch({
      type: 'openclaw/markdownGet',
      payload: {agentId: selectedAgent.id, file: selectedFile},
      callback: (resp: any) => {
        setFileLoading(false);
        if (resp?.success) {
          setFileContent(resp.data?.content || '');
          setFileContentDirty(false);
        } else {
          setFileContent('');
          setFileContentDirty(false);
        }
      },
    });
  }, [selectedAgent?.id, selectedFile]);

  /** 保存文件 */
  const handleSaveFile = () => {
    if (!selectedAgent?.id || !selectedFile || !dispatch) return;
    setFileLoading(true);
    dispatch({
      type: 'openclaw/markdownSave',
      payload: {agentId: selectedAgent.id, file: selectedFile, content: fileContent},
      callback: (resp: any) => {
        setFileLoading(false);
        if (resp?.success) {
          message.success('保存成功');
          setFileContentDirty(false);
        } else {
          message.error(resp?.message || '保存失败');
        }
      },
    });
  };

  /** 重置文件（重新加载） */
  const handleResetFile = () => {
    if (!selectedAgent?.id || !selectedFile || !dispatch) return;
    setFileLoading(true);
    dispatch({
      type: 'openclaw/markdownGet',
      payload: {agentId: selectedAgent.id, file: selectedFile},
      callback: (resp: any) => {
        setFileLoading(false);
        if (resp?.success) {
          setFileContent(resp.data?.content || '');
          setFileContentDirty(false);
        }
      },
    });
  };

  /** 新建智能体 */
  const handleCreate = () => {
    createForm.resetFields();
    Dialog({
      title: '新建智能体',
      width: 520,
      content: (
        <Form form={createForm} layout="vertical" autoComplete="off">
          <Form.Item
            name="agentId" label="智能体 ID"
            rules={[
              {required: true, message: '请输入智能体 ID'},
              {pattern: /^[a-zA-Z0-9_-]+$/, message: '仅支持英文字母、数字、下划线和连字符'},
            ]}
            extra="唯一标识，创建后不可修改"
          >
            <Input placeholder="例如：programmer、tester"/>
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{required: true, message: '请输入名称'}]}>
            <Input placeholder="例如：张三"/>
          </Form.Item>
          <Form.Item name="emoji" hidden><Input/></Form.Item>
          <Form.Item label="头像" shouldUpdate={(prev: any, cur: any) => prev.emoji !== cur.emoji}>
            {({getFieldValue}: any) => (
              <img
                src={getAgentIconUrl(getFieldValue('emoji') || '01')}
                alt=""
                className="air-avatar-selectable"
                onClick={() => setAvatarPickerVisible(true)}
              />
            )}
          </Form.Item>
        </Form>
      ),
      onConfirm: (dlg: any) => {
        createForm.validateFields().then((values: any) => {
          dispatch({
            type: 'openclaw/createOpenclawAgent',
            payload: {
              agentId: values.agentId.trim(),
              name: values.name?.trim(),
              emoji: values.emoji || '01',
            },
            callback: (resp: any) => {
              if (resp?.success) {
                message.success('智能体创建成功');
                dlg.doCancel();
                createForm.resetFields();
                if (resp.data) setSelectedAgent(resp.data);
              } else {
                error({title: '创建失败', message: resp?.message || '未知错误'});
              }
            },
          });
        });
      },
    });
  };

  /** 编辑智能体 */
  const handleEdit = () => {
    if (!selectedAgent) return;
    createForm.setFieldsValue({
      agentId: selectedAgent.id,
      name: selectedAgent.name || '',
      emoji: selectedAgent.emoji || '01',
    });
    Dialog({
      title: '编辑智能体',
      width: 520,
      content: (
        <Form form={createForm} layout="vertical" autoComplete="off">
          <Form.Item name="agentId" label="智能体 ID">
            <Input disabled/>
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{required: true, message: '请输入名称'}]}>
            <Input placeholder="例如：张三"/>
          </Form.Item>
          <Form.Item name="emoji" hidden><Input/></Form.Item>
          <Form.Item label="头像" shouldUpdate={(prev: any, cur: any) => prev.emoji !== cur.emoji}>
            {({getFieldValue}: any) => (
              <img
                src={getAgentIconUrl(getFieldValue('emoji') || '01')}
                alt=""
                className="air-avatar-selectable"
                onClick={() => setAvatarPickerVisible(true)}
              />
            )}
          </Form.Item>
        </Form>
      ),
      onConfirm: (dlg: any) => {
        createForm.validateFields().then((values: any) => {
          dispatch({
            type: 'openclaw/updateOpenclawAgent',
            payload: {
              agentId: values.agentId,
              name: values.name?.trim(),
              emoji: values.emoji || '01',
            },
            callback: (resp: any) => {
              if (resp?.success) {
                message.success('更新成功');
                setSelectedAgent({
                  ...selectedAgent,
                  name: values.name?.trim(),
                  emoji: values.emoji || '01',
                });
                dlg.doCancel();
              } else {
                error({title: '更新失败', message: resp?.message || '未知错误'});
              }
            },
          });
        });
      },
    });
  };

  /** 删除智能体 */
  const handleDelete = () => {
    if (!selectedAgent?.id) return;
    Dialog({
      title: '确认删除智能体',
      width: 520,
      content: (
        <div>
          <p>即将删除智能体 <strong>{selectedAgent.name || selectedAgent.id}</strong>（ID: {selectedAgent.id}）</p>
          <p style={{color: '#ff4d4f', fontWeight: 'bold'}}>此操作不可恢复！</p>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'openclaw/deleteOpenclawAgent',
          payload: {agentId: selectedAgent.id},
          callback: (resp: any) => {
            if (resp?.success) {
              message.success('智能体已删除');
              setSelectedAgent(null);
              dlg.doCancel();
            } else {
              error({title: '删除失败', message: resp?.message || '未知错误'});
            }
          },
        });
      },
    });
  };

  /** 更新主模型 */
  const handlePrimaryModelChange = (value: string) => {
    if (!dispatch) return;
    setModelLoading(true);
    dispatch({
      type: 'openclaw/setModelDefaults',
      payload: {primary: value, fallbacks: fallbackModels},
      callback: (resp: any) => {
        setModelLoading(false);
        if (resp?.success) {
          message.success('主模型已更新');
        } else {
          message.error(resp?.message || '更新失败');
        }
      },
    });
  };

  /** 更新备用模型（单选，"__none__" 表示无备用模型） */
  const handleFallbackModelChange = (value: string) => {
    if (!dispatch) return;
    const fallbacks = value === '__none__' ? [] : [value];
    setModelLoading(true);
    dispatch({
      type: 'openclaw/setModelDefaults',
      payload: {primary: primaryModel, fallbacks},
      callback: (resp: any) => {
        setModelLoading(false);
        if (resp?.success) {
          message.success('备用模型已更新');
        } else {
          message.error(resp?.message || '更新失败');
        }
      },
    });
  };

  /** 备用模型下拉选项（含"无"选项） */
  const fallbackSelectOptions = useMemo(() => {
    const opts: {value: string; label: string}[] = [{value: '__none__', label: '无'}];
    (availableModels || []).forEach((m: any) => {
      if (m.value !== primaryModel) {
        opts.push({value: m.value, label: m.label});
      }
    });
    return opts;
  }, [availableModels, primaryModel]);

  /** 备用模型当前选中值 */
  const fallbackValue = useMemo(() => {
    if (!fallbackModels || fallbackModels.length === 0) return '__none__';
    return fallbackModels[0];
  }, [fallbackModels]);

  /** 模型选项格式化为 Select options */
  const modelSelectOptions = (availableModels || []).map((m: any) => ({
    value: m.value,
    label: m.label,
  }));

  if (!props.frameSize) return null;

  return (
    <div className="air-agent-panel">
      {/* 左侧成员列表 */}
      <div className="air-agent-list">
        <div className="air-agent-list-header">
          <div className="air-agent-list-title">智能体</div>
          <div className="air-agent-list-actions">
            <IconButton icon="plus" tooltip="新建" size={24} bordered onClick={handleCreate}/>
            <IconButton icon="reload" tooltip="刷新" size={24} bordered onClick={loadAgentList}/>
          </div>
        </div>
        <div className="air-agent-list-body" style={{height: layout.listBodyH}}>
          {agentList.length === 0 ? (
            <div className="air-agent-empty-tip">暂无智能体，点击「+」创建</div>
          ) : (
            agentList.map((agent: any) => (
              <div
                key={agent.id}
                className={`air-agent-item ${selectedAgent?.id === agent.id ? 'active' : ''}`}
                onClick={() => setSelectedAgent(agent)}
              >
                <span className="air-agent-item-icon">
                  <img src={getAgentIconUrl(agent.emoji)} alt=""/>
                </span>
                <div className="air-agent-item-main">
                  <div className="air-agent-item-name">
                    {agent.name || agent.id}
                    {agent.id === 'main' && <Tag color="default">DEFAULT</Tag>}
                  </div>
                  <div className="air-agent-item-id">{agent.id}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右侧详情区 */}
      <div className="air-agent-detail">
        {selectedAgent ? (
          <>
            <div className="air-agent-detail-header">
              <span className="air-agent-detail-icon">
                <img src={getAgentIconUrl(selectedAgent.emoji)} alt=""/>
              </span>
              <span className="air-agent-detail-name">{selectedAgent.name || selectedAgent.id}</span>
              <div className="air-agent-detail-tags">
                {selectedAgent.id === 'main' && <Tag color="default">DEFAULT</Tag>}
              </div>
              <div className="air-agent-detail-actions">
                {selectedAgent.id !== 'main' && (
                  <>
                    <Button onClick={handleEdit}>编辑</Button>
                    <Button style={{color: '#ff4d4f', borderColor: '#ff4d4f', border: '1px solid #ff4d4f'}} onClick={handleDelete}>
                      删除
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="air-agent-detail-tabs">
              <button
                type="button"
                className={`air-agent-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                概览
              </button>
              <button
                type="button"
                className={`air-agent-tab ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                设定
              </button>
            </div>
            <div className="air-agent-detail-content" style={{height: layout.contentH}}>
              {activeTab === 'overview' && (
                <div className="air-agent-overview">
                  {/* 基本信息 */}
                  <div className="air-agent-info-card">
                    <div className="air-agent-info-row">
                      <span className="air-agent-info-label">ID</span>
                      <span className="air-agent-info-value">{selectedAgent.id}</span>
                    </div>
                    <div className="air-agent-info-row">
                      <span className="air-agent-info-label">名称</span>
                      <span className="air-agent-info-value">{selectedAgent.name || '—'}</span>
                    </div>
                    {selectedAgent.workspace && (
                      <div className="air-agent-info-row">
                        <span className="air-agent-info-label">工作目录</span>
                        <span className="air-agent-info-value" style={{fontSize: '0.8rem', color: '#666'}}>
                          {selectedAgent.workspace}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 模型配置（非 main 智能体只读） */}
                  <div className="air-agent-model-section">
                    <div className="air-agent-model-section-title">模型配置</div>
                    <div className="air-agent-model-row">
                      <span className="air-agent-model-label">主模型</span>
                      <Select
                        style={{flex: 1}}
                        value={primaryModel || undefined}
                        placeholder="选择主模型"
                        loading={modelLoading}
                        options={modelSelectOptions}
                        onChange={handlePrimaryModelChange}
                        disabled={selectedAgent.id !== 'main'}
                      />
                    </div>
                    <div className="air-agent-model-row">
                      <span className="air-agent-model-label">备用模型</span>
                      <Select
                        style={{flex: 1}}
                        value={fallbackValue}
                        placeholder="选择备用模型"
                        loading={modelLoading}
                        options={fallbackSelectOptions}
                        onChange={handleFallbackModelChange}
                        disabled={selectedAgent.id !== 'main'}
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'files' && (
                <div className="air-agent-files" style={{height: layout.contentH}}>
                  {/* 文件列表 */}
                  <div className="air-agent-file-list">
                    <div className="air-agent-file-list-header">文件</div>
                    <div className="air-agent-file-list-body">
                      {CORE_FILE_NAMES.map((name) => (
                        <div
                          key={name}
                          className={`air-agent-file-item ${selectedFile === name ? 'active' : ''}`}
                          onClick={() => setSelectedFile(name)}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 编辑器 */}
                  <div className="air-agent-file-editor">
                    <div className="air-agent-file-editor-header">
                      <span>{selectedFile}</span>
                      <div className="air-agent-file-editor-actions">
                        <Button type="primary" size="small" onClick={handleSaveFile} disabled={!fileContentDirty || fileLoading}>
                          保存
                        </Button>
                        <Button size="small" onClick={handleResetFile} disabled={fileLoading}>
                          重置
                        </Button>
                      </div>
                    </div>
                    <div style={{flex: 1, overflow: 'hidden'}}>
                      <CodeEditor
                        language="markdown"
                        width={layout.editorW}
                        height={layout.editorH}
                        content={fileContent}
                        border={false}
                        onChange={(val: string) => {
                          setFileContent(val);
                          setFileContentDirty(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="air-agent-empty-state">请从左侧选择一个智能体</div>
        )}
      </div>

      {/* 头像选择面板：通过 Portal 渲染到 document.body，脱离父级层叠上下文 */}
      {avatarPickerVisible && createPortal(
        <div className="air-avatar-picker-mask" onClick={closeAvatarPicker}>
          <div className="air-avatar-picker-panel" onClick={(e) => e.stopPropagation()}>
            <div className="air-avatar-picker-header">
              <span className="air-avatar-picker-title">选择头像</span>
              <IconButton icon="close" size={20} bordered={false} onClick={closeAvatarPicker}/>
            </div>
            <div className="air-icon-picker-grid">
              {AGENT_ICON_OPTIONS.map((key) => (
                <div
                  key={key}
                  className={`air-icon-picker-item ${createForm.getFieldValue('emoji') === key ? 'active' : ''}`}
                  onClick={() => handlePickAvatar(key)}
                >
                  <img src={getAgentIconUrl(key)} alt=""/>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default connect(({global, openclaw}: any) => ({
  frameSize: global.frameSize,
  openclaw,
}))(AgentPanel);
