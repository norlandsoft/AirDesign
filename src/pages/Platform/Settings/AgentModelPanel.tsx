import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, Dialog, error, Table, TableRowMenu} from 'air-design';
import {message} from 'antd';
import type {LangModelResponse} from '@/types/langModel';
import './AgentModelPanel.less';

/**
 * 单条模型配置（来自 openclaw.json models，供智能体选用）
 */
interface WorkspaceModelItem {
  id: string;
  name?: string;
  provider: string;
  providerText?: string;
  modelId: string;
  providerApi?: string;
}

/**
 * 平台管理 - 智能体模型配置面板
 *
 * 管理 openclaw 工作区模型列表，供智能体选用。
 * 添加模型时从平台已配置的模型中选择，选中后添加到工作室模型设置。
 * 参考 JettoAuthor AgentModel 页面。
 *
 * Created by ChaiMingXu, on 2026/04/30
 */
interface AgentModelPanelProps {
  frameSize?: { width: number; height: number };
  dispatch?: any;
  openclaw?: {
    workspaceModels?: any[];
  };
}

const API_TYPES: Record<string, string> = {
  'openai-completions': 'OpenAI Completions',
  'openai-messages': 'OpenAI Messages',
  'anthropic-messages': 'Anthropic Messages',
  'google-messages': 'Google Messages',
};

const getApiLabel = (api?: string) => {
  if (!api) return '—';
  return API_TYPES[api] || api;
};

const AgentModelPanel: React.FC<AgentModelPanelProps> = (props) => {
  const {dispatch, openclaw} = props;
  const workspaceModels = openclaw?.workspaceModels || [];

  const [loading, setLoading] = useState(false);

  /** 加载工作区模型列表 */
  const loadModels = () => {
    if (!dispatch) return;
    setLoading(true);
    dispatch({
      type: 'openclaw/fetchWorkspaceModels',
      callback: (resp: any) => {
        setLoading(false);
        if (!resp?.success) {
          message.error(resp?.message || '获取模型列表失败');
        }
      },
    });
  };

  useEffect(() => { loadModels(); }, [dispatch]);

  /** 添加模型：从平台数据库模型列表中选择 */
  const handleAdd = () => {
    if (!dispatch) return;

    dispatch({
      type: 'llm/fetchModels',
      payload: {},
      callback: (res: any) => {
        if (!res?.success) {
          error({title: '获取平台模型失败', message: res?.message || '请检查平台服务'});
          return;
        }

        // 过滤掉 embedding 类型的模型
        const platformModels: LangModelResponse[] = (res?.data || []).filter(
          (m: LangModelResponse) => m.type !== 'embedding'
        );

        if (platformModels.length === 0) {
          error({title: '暂无可用模型', message: '请先在「模型服务 - 语言模型管理」中配置模型'});
          return;
        }

        // 过滤已添加到工作区的模型
        const selectableModels = platformModels.filter((m: LangModelResponse) => {
          const modelKey = `${m.provider}/${m.model}`;
          return !workspaceModels.some((wm: any) => {
            const wmKey = `${wm.provider}/${wm.model}`;
            return wmKey === modelKey;
          });
        });

        if (selectableModels.length === 0) {
          message.info('所有平台模型均已添加到工作区');
          return;
        }

        const selectedRef = {current: null as LangModelResponse | null};
        const AddModelSelectContent: React.FC = () => {
          const [selected, setSelected] = useState<LangModelResponse | null>(null);
          return (
            <div style={{marginTop: 8, marginBottom: 8}}>
              <div style={{marginBottom: 8, color: '#666', fontSize: 12}}>
                从平台已配置的模型中选择一个，点击确定添加到工作室模型设置
              </div>
              <div style={{
                marginBottom: 8, height: 22, lineHeight: '22px',
                fontSize: 13, color: selected ? '#1890ff' : '#999',
              }}>
                {selected ? `已选择：${selected.provider}/${selected.model}` : '请选择列表中的模型'}
              </div>
              <Table
                columns={[
                  {title: '供应商', dataIndex: 'providerText', key: 'provider', width: 100},
                  {title: '模型', dataIndex: 'model', key: 'model', width: 140},
                  {title: '接口类型', dataIndex: 'api', key: 'api', width: 140},
                ]}
                data={selectableModels}
                rowKey="id"
                height={300}
                padding={4}
                bordered
                showHeader
                pagination={false}
                onItemClick={(row: LangModelResponse) => {
                  selectedRef.current = row;
                  setSelected(row);
                }}
              />
            </div>
          );
        };

        Dialog({
          title: '添加模型',
          width: 640,
          content: <AddModelSelectContent/>,
          okText: '确定',
          cancelText: '取消',
          onConfirm: (dlg: any) => {
            const m = selectedRef.current;
            if (!m) {
              error({title: '请选择模型', message: '请从列表中点击选择要添加的模型'});
              return;
            }
            dispatch({
              type: 'openclaw/addWorkspaceModel',
              payload: {
                provider: m.provider,
                modelId: m.model,
                name: m.name || m.model,
                api: m.api,
                baseUrl: m.baseUrl,
                apiKey: m.apiKey,
              },
              callback: (resp: any) => {
                if (resp?.success) {
                  message.success('添加成功');
                  loadModels();
                  dlg.doCancel();
                } else {
                  error({title: '添加失败', message: resp?.message || '未知错误'});
                }
              },
            });
          },
        });
      },
    });
  };

  /** 删除模型 */
  const handleDelete = (record: WorkspaceModelItem) => {
    Dialog({
      title: '确认删除',
      width: 400,
      content: (
        <div>
          确定要删除模型「{record.name || record.modelId}」吗？删除后智能体若引用该模型需重新选择。
        </div>
      ),
      okText: '删除',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'openclaw/removeWorkspaceModel',
          payload: {provider: record.provider, modelId: record.modelId},
          callback: (resp: any) => {
            if (resp?.success) {
              message.success('已删除');
              loadModels();
              dlg.doCancel();
            } else {
              error({title: '删除失败', message: resp?.message || '未知错误'});
            }
          },
        });
      },
    });
  };

  /** 将工作区模型转为表格数据 */
  const tableData: WorkspaceModelItem[] = (workspaceModels || []).map((m: any) => ({
    id: `${m.provider}/${m.modelId}`,
    name: m.name,
    provider: m.provider || '—',
    providerText: m.providerText,
    modelId: m.modelId || '—',
    providerApi: m.api,
  }));

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 180,
      ellipsis: true,
      render: (name: string) => name || '—',
    },
    {
      title: '模型',
      dataIndex: 'modelId',
      width: 200,
      render: (_: unknown, r: WorkspaceModelItem) => `${r.providerText || r.provider} / ${r.modelId}`,
    },
    {
      title: '接口',
      dataIndex: 'providerApi',
      width: 240,
      render: (_: unknown, r: WorkspaceModelItem) => getApiLabel(r.providerApi),
    },
    {
      title: '操作',
      width: 40,
      render: (_: any, r: WorkspaceModelItem) => (
        <TableRowMenu
          items={[{key: 'delete', label: '删除', onClick: () => handleDelete(r)}]}
          data={r}
        />
      ),
    },
  ];

  const contentHeight = props.frameSize ? props.frameSize.height - 52 - 32 : 400;

  return (
    <div className="air-agent-model-panel">
      <div className="air-agent-model-top">
        <div className="air-agent-model-title">模型配置</div>
        <div className="air-agent-model-toolbar">
          <Button type="primary" onClick={handleAdd}>添加模型</Button>
          <Button type="default" onClick={loadModels} disabled={loading}>刷新</Button>
        </div>
      </div>
      <div className="air-agent-model-content" style={{height: contentHeight}}>
        {tableData.length === 0 && !loading ? (
          <div className="air-agent-model-empty">暂无模型，点击「添加模型」配置</div>
        ) : (
          <Table
            columns={columns}
            data={tableData}
            rowKey="id"
            height={contentHeight}
            rowHeight={40}
            loading={loading}
            padding={4}
            bordered
            showHeader
            showEmpty
            emptyText="暂无模型，点击「添加模型」配置"
          />
        )}
      </div>
    </div>
  );
};

export default connect(({global, openclaw}: any) => ({
  frameSize: global.frameSize,
  openclaw,
}))(AgentModelPanel);
