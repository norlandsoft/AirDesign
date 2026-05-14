import React, {useEffect, useRef, useState} from 'react';
import {connect} from 'umi';
import {Button, Dialog, Table} from 'air-design';
import {Radio, Tag, Upload, message} from 'antd';
import JSZip from 'jszip';
import './BackupPanel.less';

/**
 * 智能体标准配置文件列表
 * 每个 workspace 下固定的 6 个 Markdown 文件
 */
const AGENT_MD_FILES = [
  'AGENTS.md', 'SOUL.md', 'TOOLS.md',
  'IDENTITY.md', 'USER.md', 'HEARTBEAT.md',
];

/** 导入预览中的技能条目 */
interface ImportPreviewItem {
  name: string;
  description: string;
  groupId: string;
  groupName: string;
  conflict: boolean;
  existingId: string;
}

/** 导入预览结果 */
interface ImportPreview {
  skills: ImportPreviewItem[];
  groups: any[];
  totalCount: number;
  conflictCount: number;
}

/**
 * 技能导入对话框内容组件
 * 封装上传ZIP和预览冲突两步流程，作为 Dialog 的 content 使用
 *
 * Created by ChaiMingXu, on 2026/05/03
 */
interface ImportContentProps {
  onClose: () => void;
  onComplete: () => void;
}

const ImportDialogContent: React.FC<ImportContentProps> = ({onClose, onComplete}) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<File | null>(null);

  /** 上传ZIP后调用预览接口 */
  const handleFileUpload = async (file: File) => {
    fileRef.current = file;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = sessionStorage.getItem('air-machine-token') || '';
      const userId = sessionStorage.getItem('air-machine-user') || '';
      const result = await fetch('/api/openclaw/skills/import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: formData,
      }).then((r) => r.json());

      if (result?.success && result?.data) {
        const data: ImportPreview = result.data;
        setPreview(data);

        // 初始化默认策略：冲突默认跳过，新增默认新建
        const defaults: Record<string, string> = {};
        data.skills.forEach((s) => {
          defaults[s.name] = s.conflict ? 'skip' : 'create';
        });
        setResolutions(defaults);
        setStep('preview');
      } else {
        message.error(result?.message || '解析ZIP文件失败');
      }
    } catch (err: any) {
      message.error('解析ZIP文件失败: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
    return false;
  };

  /** 修改单个技能的冲突解决策略 */
  const handleResolutionChange = (name: string, action: string) => {
    setResolutions((prev) => ({...prev, [name]: action}));
  };

  /** 确认执行导入 */
  const handleConfirmImport = async () => {
    if (!fileRef.current) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileRef.current);

      const resolutionList = Object.entries(resolutions).map(([name, action]) => ({
        name, action,
      }));
      formData.append('resolutions', JSON.stringify(resolutionList));

      const token = sessionStorage.getItem('air-machine-token') || '';
      const userId = sessionStorage.getItem('air-machine-user') || '';
      const result = await fetch('/api/openclaw/skills/import/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: formData,
      }).then((r) => r.json());

      if (result?.success && result?.data) {
        const {created, overwritten, skipped} = result.data;
        message.success(`导入完成：新建 ${created}，覆盖 ${overwritten}，跳过 ${skipped}`);
        onComplete();
        onClose();
      } else {
        message.error(result?.message || '导入失败');
      }
    } catch (err: any) {
      message.error('导入失败: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  /** 预览表格列定义 */
  const columns = [
    {
      title: '技能名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text: string, record: ImportPreviewItem) => (
        <span title={record.description || ''}>{text}</span>
      ),
    },
    {
      title: '所属分组',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 120,
      render: (text: string) => text || '未分组',
    },
    {
      title: '状态',
      dataIndex: 'conflict',
      key: 'conflict',
      width: 80,
      render: (conflict: boolean) =>
        conflict
          ? <Tag color="orange">冲突</Tag>
          : <Tag color="green">新增</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_: any, record: ImportPreviewItem) => {
        if (!record.conflict) {
          return <span className="import-action-label">新建</span>;
        }
        return (
          <Radio.Group
            size="small"
            value={resolutions[record.name] || 'skip'}
            onChange={(e) => handleResolutionChange(record.name, e.target.value)}
          >
            <Radio.Button value="create">新建</Radio.Button>
            <Radio.Button value="overwrite">覆盖</Radio.Button>
            <Radio.Button value="skip">跳过</Radio.Button>
          </Radio.Group>
        );
      },
    },
  ];

  return (
    <div className="import-content-wrapper">
      {step === 'upload' && (
        <div className="import-upload-area">
          <Upload.Dragger
            accept=".zip"
            showUploadList={false}
            beforeUpload={(file: File) => {
              handleFileUpload(file);
              return false;
            }}
            disabled={loading}
          >
            <div className="import-upload-content">
              <p style={{fontSize: 28, color: '#1890ff', margin: 0}}>&#128230;</p>
              <p style={{marginTop: 12, fontSize: 15}}>点击或拖拽 ZIP 文件到此处</p>
              <p style={{fontSize: 13, color: '#999'}}>仅支持 .zip 格式的技能备份文件</p>
            </div>
          </Upload.Dragger>
        </div>
      )}
      {step === 'preview' && preview && (
        <div className="import-preview-layout">
          <div className="import-preview-summary">
            共 {preview.totalCount} 个技能，其中{' '}
            <span className="import-conflict-count">{preview.conflictCount}</span>{' '}
            个与已有技能同名
          </div>
          <div className="import-preview-table">
            <Table
              columns={columns}
              data={preview.skills}
              rowKey="name"
              height={340}
              pagination={false}
              bordered
            />
          </div>
          <div className="import-content-footer">
            <Button type="primary" onClick={handleConfirmImport} loading={loading}>
              确认导入
            </Button>
            <Button onClick={onClose}>取消</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 工作流导入对话框内容组件
 * 调用后端批量导入API完成预览和执行，不再前端解析ZIP
 *
 * 流程：
 * 1. 上传ZIP → 调用 /rest/workflow/import/preview 获取预览
 * 2. 用户选择冲突策略 → 调用 /rest/workflow/import/execute 执行导入
 *
 * Created by ChaiMingXu, on 2026/05/04
 */
interface WorkflowImportProps {
  onClose: () => void;
  onComplete: () => void;
}

/** 工作流导入预览条目 */
interface WorkflowImportItem {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  conflict: boolean;
  existingId: string;
}

/** 工作流导入预览结果 */
interface WorkflowImportPreview {
  workflows: WorkflowImportItem[];
  totalCount: number;
  conflictCount: number;
}

const WorkflowImportDialogContent: React.FC<WorkflowImportProps> = ({
  onClose, onComplete,
}) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [preview, setPreview] = useState<WorkflowImportPreview | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<File | null>(null);

  /** 上传ZIP后调用后端预览接口 */
  const handleFileUpload = async (file: File) => {
    fileRef.current = file;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = sessionStorage.getItem('air-machine-token') || '';
      const userId = sessionStorage.getItem('air-machine-user') || '';
      const result = await fetch('/rest/workflow/import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: formData,
      }).then((r) => r.json());

      if (result?.success && result?.data) {
        const data: WorkflowImportPreview = result.data;
        setPreview(data);

        // 初始化默认策略：冲突默认跳过，新增默认新建
        const defaults: Record<string, string> = {};
        data.workflows.forEach((w) => {
          defaults[w.id] = w.conflict ? 'skip' : 'create';
        });
        setResolutions(defaults);
        setStep('preview');
      } else {
        message.error(result?.message || '解析ZIP文件失败');
      }
    } catch (err: any) {
      message.error('解析ZIP文件失败: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
    return false;
  };

  /** 确认执行导入 */
  const handleConfirmImport = async () => {
    if (!fileRef.current) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileRef.current);

      const resolutionList = Object.entries(resolutions).map(([id, action]) => ({
        id, action,
      }));
      formData.append('resolutions', JSON.stringify(resolutionList));

      const token = sessionStorage.getItem('air-machine-token') || '';
      const userId = sessionStorage.getItem('air-machine-user') || '';
      const result = await fetch('/rest/workflow/import/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: formData,
      }).then((r) => r.json());

      if (result?.success && result?.data) {
        const {created, overwritten, skipped} = result.data;
        message.success(`导入完成：新建 ${created}，覆盖 ${overwritten}，跳过 ${skipped}`);
        onComplete();
        onClose();
      } else {
        message.error(result?.message || '导入失败');
      }
    } catch (err: any) {
      message.error('导入失败: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  /** 预览表格列定义 */
  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: WorkflowImportItem) => (
        <span title={record.description || ''}>{text}</span>
      ),
    },
    {
      title: '节点数',
      dataIndex: 'nodeCount',
      key: 'nodeCount',
      width: 80,
    },
    {
      title: '连线数',
      dataIndex: 'edgeCount',
      key: 'edgeCount',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'conflict',
      key: 'conflict',
      width: 80,
      render: (conflict: boolean) =>
        conflict
          ? <Tag color="orange">冲突</Tag>
          : <Tag color="green">新增</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_: any, record: WorkflowImportItem) => {
        if (!record.conflict) {
          return <span className="import-action-label">新建</span>;
        }
        return (
          <Radio.Group
            size="small"
            value={resolutions[record.id] || 'skip'}
            onChange={(e) => setResolutions((prev) => ({...prev, [record.id]: e.target.value}))}
          >
            <Radio.Button value="create">新建</Radio.Button>
            <Radio.Button value="overwrite">覆盖</Radio.Button>
            <Radio.Button value="skip">跳过</Radio.Button>
          </Radio.Group>
        );
      },
    },
  ];

  return (
    <div className="import-content-wrapper">
      {step === 'upload' && (
        <div className="import-upload-area">
          <Upload.Dragger
            accept=".zip"
            showUploadList={false}
            beforeUpload={(file: File) => {
              handleFileUpload(file);
              return false;
            }}
            disabled={loading}
          >
            <div className="import-upload-content">
              <p style={{fontSize: 28, color: '#1890ff', margin: 0}}>&#128230;</p>
              <p style={{marginTop: 12, fontSize: 15}}>点击或拖拽 ZIP 文件到此处</p>
              <p style={{fontSize: 13, color: '#999'}}>仅支持 .zip 格式的工作流备份文件</p>
            </div>
          </Upload.Dragger>
        </div>
      )}
      {step === 'preview' && preview && (
        <div className="import-preview-layout">
          <div className="import-preview-summary">
            共 {preview.totalCount} 个工作流，其中{' '}
            <span className="import-conflict-count">{preview.conflictCount}</span>{' '}
            个与已有工作流冲突
          </div>
          <div className="import-preview-table">
            <Table
              columns={columns}
              data={preview.workflows}
              rowKey="id"
              height={340}
              pagination={false}
              bordered
            />
          </div>
          <div className="import-content-footer">
            <Button type="primary" onClick={handleConfirmImport} loading={loading}>
              确认导入
            </Button>
            <Button onClick={onClose}>取消</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/** 单个备份卡片属性 */
interface BackupCardProps {
  title: string;
  description: string;
  count: number;
  countLabel: string;
  loading: boolean;
  onExport: () => void;
  onImport?: () => void;
  onRefresh: () => void;
}

/**
 * 单个备份卡片组件
 * 每种备份类型对应一张卡片，提供刷新、导出和导入操作
 *
 * Created by ChaiMingXu, on 2026/05/01
 */
const BackupCard: React.FC<BackupCardProps> = (props) => {
  const {title, description, count, countLabel, loading, onExport, onImport, onRefresh} = props;

  return (
    <div className="backup-card">
      <div className="backup-card-header">
        <div className="backup-card-title">{title}</div>
        <div className="backup-card-toolbar">
          <Button type="primary" size="small" onClick={onExport} disabled={loading}>
            {loading ? '导出中...' : '导出'}
          </Button>
          {onImport && (
            <Button type="default" size="small" onClick={onImport} disabled={loading}>导入</Button>
          )}
          <Button type="default" size="small" onClick={onRefresh} disabled={loading}>刷新</Button>
        </div>
      </div>
      <div className="backup-card-body">
        <div className="backup-card-desc">{description}</div>
        <div className="backup-card-count">
          <span className="count-num">{count}</span>
          <span className="count-label">{countLabel}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 数据备份设置组件
 *
 * 页面垂直排列三张备份卡片：智能体、工作流、技能。
 * 每个卡片提供导出、导入（技能）、刷新操作。
 * 技能导入采用两步流程：上传ZIP → 预览冲突 → 确认导入。
 *
 * Created by ChaiMingXu, on 2026/05/01
 */
interface BackupPanelProps {
  dispatch?: any;
  frameSize?: { width: number; height: number };
}

const BackupPanel: React.FC<BackupPanelProps> = (props) => {
  const {dispatch} = props;

  // 各模块数据
  const [agents, setAgents] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [skillGroups, setSkillGroups] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);

  // 加载状态
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);

  /** 加载智能体列表 */
  const loadAgents = () => {
    if (!dispatch) return;
    setAgentsLoading(true);
    dispatch({
      type: 'openclaw/fetchOpenclawAgents',
      callback: (resp: any) => {
        setAgentsLoading(false);
        if (resp?.success && resp?.data) {
          setAgents(Array.isArray(resp.data) ? resp.data : []);
        }
      },
    });
  };

  /** 加载技能和技能组 */
  const loadSkills = () => {
    if (!dispatch) return;
    setSkillsLoading(true);
    Promise.all([
      new Promise<void>((resolve) => {
        dispatch({
          type: 'skill/fetchSkillList',
          callback: (resp: any) => {
            if (resp?.success && resp?.data) {
              setSkills(Array.isArray(resp.data) ? resp.data : []);
            }
            resolve();
          },
        });
      }),
      new Promise<void>((resolve) => {
        dispatch({
          type: 'skill/fetchSkillGroupTree',
          callback: (resp: any) => {
            if (resp?.success && resp?.data) {
              setSkillGroups(Array.isArray(resp.data) ? resp.data : []);
            }
            resolve();
          },
        });
      }),
    ]).finally(() => setSkillsLoading(false));
  };

  /** 加载工作流列表 */
  const loadWorkflows = () => {
    if (!dispatch) return;
    setWorkflowsLoading(true);
    dispatch({
      type: 'workflow/fetchWorkflowList',
      payload: {},
      callback: (resp: any) => {
        setWorkflowsLoading(false);
        if (resp?.success && resp?.data) {
          setWorkflows(Array.isArray(resp.data) ? resp.data : []);
        }
      },
    });
  };

  useEffect(() => {
    loadAgents();
    loadSkills();
    loadWorkflows();
  }, []);

  // ==================== 文件工具 ====================

  /** 下载文件 */
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** 格式化日期为 YYYYMMDD */
  const formatDate = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');

  /** 读取指定智能体的所有 Markdown 文件内容 */
  const loadAgentMarkdownFiles = (agentId: string): Promise<Record<string, string>> => {
    return new Promise((resolve) => {
      if (!dispatch) { resolve({}); return; }
      const promises = AGENT_MD_FILES.map(
        (file) =>
          new Promise<{ name: string; content: string }>((r) => {
            dispatch({
              type: 'openclaw/markdownGet',
              payload: {agentId, file},
              callback: (fileRes: any) => {
                r({name: file, content: fileRes?.success ? (fileRes?.data?.content || '') : ''});
              },
            });
          }),
      );
      Promise.all(promises).then((results) => {
        const map: Record<string, string> = {};
        results.forEach(({name, content}) => {
          if (content) map[name] = content;
        });
        resolve(map);
      });
    });
  };

  // ==================== 智能体导出 ====================

  /** 导出智能体数据 */
  const handleExportAgents = async () => {
    setAgentsLoading(true);
    try {
      const zip = new JSZip();
      const exportTime = new Date().toISOString();

      zip.file('meta.json', JSON.stringify({
        version: '1.0', exportTime, type: 'agents', count: agents.length,
      }, null, 2));

      zip.file('index.json', JSON.stringify({
        type: 'agents',
        items: agents.map((m: any) => ({
          id: m.id, name: m.name, folder: `data/${m.id}`,
        })),
      }, null, 2));

      const dataFolder = zip.folder('data');
      if (dataFolder) {
        for (const agent of agents) {
          const agentFolder = dataFolder.folder(agent.id);
          if (agentFolder) {
            agentFolder.file(`${agent.id}.json`, JSON.stringify(agent, null, 2));
            const mdContents = await loadAgentMarkdownFiles(agent.id);
            Object.entries(mdContents).forEach(([name, content]) => {
              if (content) agentFolder.file(name, content);
            });
          }
        }
      }

      const blob = await zip.generateAsync({type: 'blob'});
      downloadFile(blob, `openclaw-agents-${formatDate()}.zip`);
      message.success('智能体数据导出成功');
    } catch {
      message.error('导出失败');
    } finally {
      setAgentsLoading(false);
    }
  };

  // ==================== 技能导出 ====================

  /**
   * 将 base64 字符串解码为 Uint8Array
   * 用于将后端返回的 byte[] (JSON 序列化为 base64) 还原为二进制数据
   */
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  /**
   * 生成 YAML 安全的字符串值
   * 去除内部双引号，外层用双引号包裹
   */
  const yamlSafe = (v: string | null | undefined): string => {
    const s = v || '';
    return `"${s.replace(/"/g, '')}"`;
  };

  /**
   * 导出技能数据（ClawHub 格式，含附件文件）
   *
   * ZIP 结构：
   * groups.json                    -- 技能组定义（可选，用于保留分组信息）
   * {skillName}/SKILL.md           -- YAML frontmatter (name, description, groupId) + 正文
   * {skillName}/scripts/run.sh     -- 附件文件直接放在技能文件夹下
   * {skillName}/references/doc.pdf -- 更多附件
   */
  const handleExportSkills = async () => {
    setSkillsLoading(true);
    try {
      const zip = new JSZip();

      // 获取所有技能的附件文件（含二进制内容）
      const allFiles: any[] = await new Promise((resolve) => {
        if (!dispatch) { resolve([]); return; }
        dispatch({
          type: 'skill/fetchAllSkillFilesWithContent',
          callback: (resp: any) => {
            resolve(resp?.success && resp?.data ? resp.data : []);
          },
        });
      });

      // 按 skillId 分组附件文件
      const filesBySkillId: Record<string, any[]> = {};
      allFiles.forEach((f: any) => {
        if (!filesBySkillId[f.skillId]) filesBySkillId[f.skillId] = [];
        filesBySkillId[f.skillId].push(f);
      });

      // 每个技能生成一个 {skillName}/ 目录，包含 SKILL.md 和附件
      skills.forEach((s: any) => {
        const skillFolder = zip.folder(s.name);
        if (skillFolder) {
          // 生成 SKILL.md：YAML frontmatter + 正文内容
          const frontmatter = [
            '---',
            `name: ${yamlSafe(s.name)}`,
            `description: ${yamlSafe(s.description)}`,
            `groupId: ${s.groupId || ''}`,
            '---',
            '',
          ].join('\n');
          skillFolder.file('SKILL.md', frontmatter + (s.content || ''));

          // 附件文件直接放在技能文件夹下，保持原始 path
          const skillFiles = filesBySkillId[s.id] || [];
          skillFiles.forEach((f: any) => {
            if (f.content && f.path) {
              skillFolder.file(f.path, base64ToUint8Array(f.content));
            }
          });
        }
      });

      // 技能组定义写入根目录 groups.json
      if (skillGroups && skillGroups.length > 0) {
        zip.file('groups.json', JSON.stringify({skillGroups}, null, 2));
      }

      const blob = await zip.generateAsync({type: 'blob'});
      downloadFile(blob, `agent-skills-${formatDate()}.zip`);
      message.success('技能数据导出成功');
    } catch {
      message.error('导出失败');
    } finally {
      setSkillsLoading(false);
    }
  };

  // ==================== 工作流导出 ====================

  /** 获取单个工作流的完整数据（包含节点和边） */
  const fetchWorkflowData = (workflowId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!dispatch) { resolve(null); return; }
      dispatch({
        type: 'workflow/fetchWorkflow',
        payload: {id: workflowId},
        callback: (resp: any) => {
          resolve(resp?.success ? resp.data : null);
        },
      });
    });
  };

  /** 导出工作流数据，将所有工作流及其节点、边打包为 ZIP */
  const handleExportWorkflows = async () => {
    if (workflows.length === 0) {
      message.warning('没有可导出的工作流');
      return;
    }

    setWorkflowsLoading(true);
    try {
      const zip = new JSZip();
      const exportTime = new Date().toISOString();

      zip.file('meta.json', JSON.stringify({
        version: '1.0', exportTime, type: 'workflows', count: workflows.length,
      }, null, 2));

      zip.file('index.json', JSON.stringify({
        type: 'workflows',
        items: workflows.map((w: any) => ({
          id: w.id, name: w.name, folder: `data/${w.id}`,
        })),
      }, null, 2));

      const dataFolder = zip.folder('data');
      if (dataFolder) {
        for (const wf of workflows) {
          const wfData = await fetchWorkflowData(wf.id);
          if (wfData) {
            const wfFolder = dataFolder.folder(wf.id);
            if (wfFolder) {
              wfFolder.file('workflow.json', JSON.stringify(wfData, null, 2));
            }
          }
        }
      }

      const blob = await zip.generateAsync({type: 'blob'});
      downloadFile(blob, `workflows-${formatDate()}.zip`);
      message.success('工作流数据导出成功');
    } catch {
      message.error('导出失败');
    } finally {
      setWorkflowsLoading(false);
    }
  };

  // ==================== 工作流导入流程 ====================

  /** 打开工作流导入对话框 */
  const handleOpenWorkflowImport = () => {
    let dialogRef: any = null;

    Dialog({
      title: '导入工作流数据',
      width: 720,
      showFooter: false,
      closable: true,
      content: (
        <WorkflowImportDialogContent
          onClose={() => dialogRef?.doCancel()}
          onComplete={() => { loadWorkflows(); }}
        />
      ),
      onInit: (ref: any) => {
        dialogRef = ref;
      },
    });
  };

  // ==================== 技能导入流程 ====================

  /** 打开导入对话框（使用 AirDesign Dialog 命令式调用） */
  const handleOpenImport = () => {
    let dialogRef: any = null;

    Dialog({
      title: '导入技能数据',
      width: 720,
      showFooter: false,
      closable: true,
      content: (
        <ImportDialogContent
          onClose={() => dialogRef?.doCancel()}
          onComplete={loadSkills}
        />
      ),
      onInit: (ref: any) => {
        dialogRef = ref;
      },
    });
  };

  // ==================== 渲染 ====================

  const contentHeight = props.frameSize ? props.frameSize.height - 60 : 400;

  return (
    <div className="air-grid-panel">
      <div className="air-grid-panel-top">
        <div className="air-grid-panel-title">数据备份</div>
      </div>
      <div style={{height: contentHeight, overflow: 'auto', padding: 16}}>
        <BackupCard
          title="智能体"
          description="导出智能体列表，包含智能体名称、角色、描述以及 workspace 配置文件"
          count={agents.length}
          countLabel="个智能体"
          loading={agentsLoading}
          onRefresh={loadAgents}
          onExport={handleExportAgents}
        />
        <BackupCard
          title="工作流"
          description="导出工作流定义，包含节点配置、连接关系和执行参数。支持导入 ZIP 备份文件"
          count={workflows.length}
          countLabel="个工作流"
          loading={workflowsLoading}
          onRefresh={loadWorkflows}
          onExport={handleExportWorkflows}
          onImport={handleOpenWorkflowImport}
        />
        <BackupCard
          title="技能"
          description="导出技能、技能组和附件文件（ClawHub 格式），包含技能内容、附件和分组信息。支持导入 ZIP 备份文件"
          count={skills.length}
          countLabel="个技能"
          loading={skillsLoading}
          onRefresh={loadSkills}
          onExport={handleExportSkills}
          onImport={handleOpenImport}
        />
      </div>
    </div>
  );
};

export default connect(({global, openclaw, skill, workflow}: any) => ({
  frameSize: global.frameSize,
  openclaw,
  skill,
  workflow,
}))(BackupPanel);
