import React, {useCallback, useEffect, useRef, useState} from 'react';
import {connect} from 'umi';
import {Button, Card, Col, Empty, Form, Input, Modal, Row, Upload} from 'antd';
import type {RcFile} from 'antd/lib/upload';
import {Dialog, Icon, Message, SlidePanel, Table, TableRowMenu} from 'air-design';
import CodeEditor from '@/components/CodeEditor';
import {POST} from '@/utils/HttpRequest';
import type {
  ExecutionStatusCode,
  JobExecutionContextResponse,
  JobCreateRequest,
  JobLogResponse,
  JobResponse,
  JobUpdateRequest,
} from '@/types/job';
import {EXECUTION_STATUS_CODE_MAP, EXECUTION_STATUS_MAP, SESSION_PHASE_MAP} from '@/types/job';
import './index.less';

const {TextArea} = Input;

/** 适配 Form.Item：value/onChange 转成 content/onChange 供 CodeEditor 使用 */
const CodeEditorFormField: React.FC<any> = ({value, onChange, ...rest}) => (
    <CodeEditor content={value ?? ''} onChange={onChange} {...rest} />
);

/** 侧边栏模式：新建 | 编辑 */
type PanelMode = 'create' | 'edit';

/**
 * 智能任务 - 概览页
 *
 * 左侧主内容区：概览统计卡片 + 工作列表（行点击打开侧边栏维护）。每项工作可分解为多任务在 Kanban 中管理。
 * 右侧快捷操作区：新建工作（SlidePanel 侧边栏表单）。
 * 操作列：下拉菜单（运行、查看日志、编辑、删除），运行项在执行中时禁用。
 *
 * @author ChaiMingXu, on 2026/3/29
 */
interface JobsOverviewProps {
  frameSize: { width: number; height: number };
  dispatch?: any;
  jobList: JobResponse[];
  loading: boolean;
  runningContexts: JobExecutionContextResponse[];
}

const JobsOverview: React.FC<JobsOverviewProps> = (props) => {
  const {frameSize, dispatch, jobList, loading, runningContexts} = props;
  /** 首页运行列表仅显示正在运行与已暂停的工作（后端返回状态码 R/S，非枚举名） */
  const activeRunningContexts = (runningContexts ?? []).filter(
      (ctx) => (ctx.status as ExecutionStatusCode | undefined) === 'R' || (ctx.status as ExecutionStatusCode | undefined) === 'S'
  );

  const [jobForm] = Form.useForm();

  // 侧边栏：新建/编辑共用，由 panelMode 区分
  const [showSlidePanel, setShowSlidePanel] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('create');
  const [currentJob, setCurrentJob] = useState<JobResponse | null>(null);

  // 日志弹窗
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<JobLogResponse[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // 工作附件：创建模式暂存待上传文件，编辑模式展示已上传
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; filename: string; blobUrl?: string }[]>([]);
  const [fileListLoading, setFileListLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const PLAN_BUCKET = 'studio';
  const PLAN_OWNER_TYPE = 'job';

  // 执行日志侧边栏：点击运行中任务时展示
  const [logPanelOpen, setLogPanelOpen] = useState(false);
  const [selectedRunningContext, setSelectedRunningContext] = useState<JobExecutionContextResponse | null>(null);
  const [logPanelLogs, setLogPanelLogs] = useState<JobLogResponse[]>([]);
  const [logPanelLoading, setLogPanelLoading] = useState(false);

  // 加载工作列表
  useEffect(() => {
    loadJobList();
  }, [dispatch]);

  // 加载运行中的工作列表
  const loadRunningJobs = () => {
    if (!dispatch) return;
    dispatch({type: 'studio/fetchRunningJobs'});
  };

  // 有运行中或暂停任务时轮询刷新执行状态（3 秒间隔）
  useEffect(() => {
    loadRunningJobs();
    if (activeRunningContexts.length === 0) return;
    const timer = setInterval(loadRunningJobs, 3000);
    return () => clearInterval(timer);
  }, [dispatch, activeRunningContexts.length]);

  const loadJobList = () => {
    if (!dispatch) return;
    dispatch({
      type: 'studio/fetchJobList',
      payload: {},
    });
  };

  /**
   * 加载工作已上传的附件列表（编辑模式）
   */
  const loadPlanFiles = useCallback(async () => {
    if (!currentJob?.id) {
      setUploadedFiles([]);
      return;
    }
    setFileListLoading(true);
    try {
      const resp: any = await POST('/rest/platform/storage/list', {
        ownerType: PLAN_OWNER_TYPE,
        ownerId: currentJob.id,
      });
      if (resp?.success && Array.isArray(resp.data)) {
        const list = resp.data
            .filter((f: any) => f.bucket === PLAN_BUCKET)
            .map((f: any) => ({
              id: f.id,
              filename: f.filename,
              blobUrl: f.id ? `/rest/file/download/${f.id}` : undefined,
            }));
        setUploadedFiles(list);
      } else {
        setUploadedFiles([]);
      }
    } catch {
      setUploadedFiles([]);
    } finally {
      setFileListLoading(false);
    }
  }, [currentJob?.id]);

  useEffect(() => {
    if (showSlidePanel && currentJob?.id) {
      loadPlanFiles();
    } else if (showSlidePanel && !currentJob) {
      setUploadedFiles([]);
    }
  }, [showSlidePanel, currentJob?.id, loadPlanFiles]);

  /**
   * 删除已上传的文件（调用 storage delete 接口）
   */
  const deletePlanFile = async (fileId: string): Promise<boolean> => {
    try {
      const resp: any = await POST('/rest/platform/storage/delete', {id: fileId});
      if (resp?.success) {
        Message.success('文件已删除');
        loadPlanFiles();
        return true;
      }
      Message.error(resp?.message || '删除失败');
      return false;
    } catch {
      Message.error('删除失败');
      return false;
    }
  };

  /**
   * 上传文件到 air-server-storage（bucket=studio, ownerType=job, ownerId=jobId）
   */
  const uploadPlanFiles = async (files: File[], ownerId: string): Promise<boolean> => {
    if (files.length === 0) return true;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      formData.append('bucket', PLAN_BUCKET);
      formData.append('ownerType', PLAN_OWNER_TYPE);
      formData.append('ownerId', ownerId);
      const token = sessionStorage.getItem('air-machine-token');
      const res = await fetch('/rest/file/upload', {
        method: 'POST',
        headers: {Authorization: 'Bearer ' + token},
        body: formData,
      });
      const resp = await res.json();
      if (resp?.success) {
        return true;
      }
      Message.error(resp?.message || '文件上传失败');
      return false;
    } catch (e) {
      Message.error('文件上传失败');
      return false;
    } finally {
      setUploading(false);
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (time?: string): string => {
    if (!time) return '-';
    try {
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  };

  /**
   * 导入工作：触发文件选择
   */
  const handleImportPlan = () => {
    importFileInputRef.current?.click();
  };

  /**
   * 文件选择后处理导入（框架：后续接入导入 API）
   */
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    Message.info('导入功能开发中');
  };

  /**
   * 打开新建工作侧边栏
   */
  const openCreatePanel = () => {
    setPanelMode('create');
    setCurrentJob(null);
    setPendingFiles([]);
    jobForm.resetFields();
    setShowSlidePanel(true);
  };

  /**
   * 打开编辑侧边栏（列表行点击或操作「编辑」时调用）
   */
  const openEditPanel = (job: JobResponse) => {
    setPanelMode('edit');
    setCurrentJob(job);
    jobForm.setFieldsValue({
      title: job.title,
      description: job.description,
    });
    setShowSlidePanel(true);
  };

  /**
   * 侧边栏确认：新建则创建，编辑则更新
   */
  const handlePanelConfirm = () => {
    jobForm.validateFields().then(async (values: any) => {
      if (!dispatch) return;
      if (panelMode === 'create') {
        const payload: JobCreateRequest = {
          title: values.title,
          description: values.description,
        };
        dispatch({
          type: 'studio/createJob',
          payload,
          callback: async (resp: any) => {
            if (resp?.success && resp?.data?.id) {
              const jobId = resp.data.id;
              if (pendingFiles.length > 0) {
                const ok = await uploadPlanFiles(pendingFiles, jobId);
                if (!ok) return;
              }
              Message.success('创建工作成功');
              setShowSlidePanel(false);
              setPendingFiles([]);
              loadJobList();
            } else {
              Message.error(resp?.message || '创建失败');
            }
          },
        });
      } else if (currentJob) {
        const payload: JobUpdateRequest = {
          id: currentJob.id,
          title: values.title,
          description: values.description,
        };
        dispatch({
          type: 'studio/updateJob',
          payload,
          callback: (resp: any) => {
            if (resp?.success) {
              Message.success('更新工作成功');
              setShowSlidePanel(false);
              setCurrentJob(null);
              setUploadedFiles([]);
              loadJobList();
            } else {
              Message.error(resp?.message || '更新失败');
            }
          },
        });
      }
    }).catch(() => {
    });
  };

  /**
   * 关闭侧边栏
   */
  const handleCloseSlidePanel = () => {
    setShowSlidePanel(false);
    setCurrentJob(null);
    setPendingFiles([]);
    setUploadedFiles([]);
    jobForm.resetFields();
  };

  /**
   * 删除工作（使用 aird Dialog 确认）
   */
  const handleDelete = (job: JobResponse) => {
    Dialog({
      title: '确认删除',
      width: 400,
      content: <div>确定要删除工作「{job.title}」吗？此操作不可恢复。</div>,
      okText: '删除',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        if (!dispatch) return;
        dispatch({
          type: 'studio/deleteJob',
          payload: {id: job.id},
          callback: (resp: any) => {
            if (resp?.success) {
              Message.success('删除工作成功');
              dlg?.doCancel?.();
              loadJobList();
            } else {
              Message.error(resp?.message || '删除失败');
            }
          },
        });
      },
    });
  };

  /**
   * 打开运行工作对话框，确认后调用后端启动执行。
   * 执行策略：若该工作已有正在运行的 Session，则仅显示警告不发起请求；其它状态均可重新运行（新建 Session）。
   */
  const handleOpenRunDialog = (job: JobResponse) => {
    const hasRunningSession = (runningContexts ?? []).some(
        (ctx) => ctx.jobId === job.id && (ctx.status as ExecutionStatusCode | undefined) === 'R'
    );
    if (hasRunningSession) {
      Message.warning('该工作已有正在运行的 Session，请勿重复启动');
      return;
    }
    const jobTitle = job.title || '未命名';
    Dialog({
      title: '运行工作',
      width: 400,
      content: (
          <div className="job-run-dialog-content">
            运行工作：【{jobTitle}】是否确认执行？
          </div>
      ),
      okText: '确认运行',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        // 先关闭对话框，防止重复点击
        dlg?.doCancel?.();
        if (!dispatch) return;
        dispatch({
          type: 'studio/startJob',
          payload: {id: job.id},
          callback: (resp: any) => {
            if (resp?.success) {
              Message.success('工作已开始执行');
              loadJobList();
              loadRunningJobs();
            } else {
              Message.error(resp?.message || '启动执行失败');
            }
          },
        });
      },
    });
  };

  /**
   * 打开运行中任务的执行日志侧边栏
   */
  const handleOpenLogPanel = (ctx: JobExecutionContextResponse) => {
    setSelectedRunningContext(ctx);
    setLogPanelOpen(true);
    setLogPanelLogs([]);
    setLogPanelLoading(true);
    if (!dispatch) return;
    dispatch({
      type: 'studio/fetchLogs',
      payload: {jobId: ctx.jobId},
      callback: (resp: any) => {
        setLogPanelLoading(false);
        if (resp?.success && resp.data?.logs) {
          setLogPanelLogs(resp.data.logs);
        }
      },
    });
  };

  /**
   * 关闭执行日志侧边栏
   */
  const handleCloseLogPanel = () => {
    setLogPanelOpen(false);
    setSelectedRunningContext(null);
    setLogPanelLogs([]);
  };

  /**
   * 取消运行中的工作
   */
  const handleCancelRunning = (ctx: JobExecutionContextResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dispatch) return;

    // 如果 jobId 为空，直接提示并跳转强制清除
    if (!ctx.jobId) {
      Dialog({
        title: '运行记录异常',
        width: 420,
        content: <div>该工作记录的数据异常（缺少工作ID），无法正常取消。是否强制清除所有异常的运行记录？</div>,
        okText: '强制清除',
        cancelText: '取消',
        onConfirm: (dlg: any) => {
          dispatch({
            type: 'studio/cleanupStaleSessions',
            callback: (resp: any) => {
              if (resp?.success) {
                Message.success('清理完成，已清除 ' + (resp.data?.cleanedCount ?? 0) + ' 条异常记录');
                dlg?.doCancel?.();
                loadRunningJobs();
                handleCloseLogPanel();
              } else {
                Message.error(resp?.message || '清理失败');
              }
            },
          });
        },
      });
      return;
    }

    dispatch({
      type: 'studio/cancelJob',
      payload: {id: ctx.jobId},
      callback: (resp: any) => {
        if (resp?.success) {
          Message.success('已取消执行');
          loadRunningJobs();
          if (selectedRunningContext?.jobId === ctx.jobId) {
            handleCloseLogPanel();
          }
        } else {
          // 正常取消失败时，提示是否强制清除
          Dialog({
            title: '取消失败',
            width: 420,
            content: <div>正常取消操作失败，可能由于服务已重启或状态异常。是否强制清除该工作记录？</div>,
            okText: '强制清除',
            cancelText: '取消',
            onConfirm: (dlg: any) => {
              dispatch({
                type: 'studio/forceClearJob',
                payload: {id: ctx.jobId!},
                callback: (clearResp: any) => {
                  if (clearResp?.success) {
                    Message.success('强制清除成功');
                    dlg?.doCancel?.();
                    loadRunningJobs();
                    if (selectedRunningContext?.jobId === ctx.jobId) {
                      handleCloseLogPanel();
                    }
                  } else {
                    Message.error(clearResp?.message || '强制清除失败');
                  }
                },
              });
            },
          });
        }
      },
    });
  };

  // 日志侧边栏打开且选中运行中任务时，定时刷新日志
  useEffect(() => {
    if (!logPanelOpen || !selectedRunningContext || !dispatch) return;
    const timer = setInterval(() => {
      dispatch({
        type: 'studio/fetchLogs',
        payload: {jobId: selectedRunningContext.jobId},
        callback: (resp: any) => {
          if (resp?.success && resp.data?.logs) {
            setLogPanelLogs(resp.data.logs);
          }
        },
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [logPanelOpen, selectedRunningContext?.jobId, dispatch]);

  /**
   * 查看工作日志
   */
  const handleViewLogs = (job: JobResponse) => {
    setCurrentJob(job);
    setLogModalOpen(true);
    setLogsLoading(true);
    setCurrentLogs([]);
    if (!dispatch) return;
    dispatch({
      type: 'studio/fetchLogs',
      payload: {jobId: job.id},
      callback: (resp: any) => {
        setLogsLoading(false);
        if (resp?.success && resp.data?.logs) {
          setCurrentLogs(resp.data.logs);
        }
      },
    });
  };

  /**
   * 获取日志级别样式
   */
  const getLogLevelClass = (level?: string): string => {
    switch (level) {
      case 'INFO':
        return 'level-info';
      case 'WARN':
        return 'level-warn';
      case 'ERROR':
        return 'level-error';
      default:
        return 'level-info';
    }
  };

  // 计算统计数据（使用 sessionStatus 而非 job.status）
  const totalCount = jobList.length;
  const pendingCount = jobList.filter((p) => !p.sessionStatus).length;
  const runningCount = jobList.filter((p) => p.sessionStatus === 'R').length;
  const completedCount = jobList.filter((p) => p.sessionStatus === 'C').length;
  const failedCount = jobList.filter((p) => p.sessionStatus === 'F').length;

  // 过滤后的列表
  const filteredList = jobList.filter((item) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
        item.title?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
    );
  });

  return (
      <div className="studio-home" style={{width: frameSize.width, height: frameSize.height}}>
        <input
            ref={importFileInputRef}
            type="file"
            accept=".json,.md,.txt"
            style={{display: 'none'}}
            onChange={handleImportFileChange}
        />
        <div className="job-layout">
          {/* 左侧主内容区 */}
          <div className="job-main-content">
            {/* 顶部概览区域 */}
            <div className="job-overview">
              <Row gutter={[16, 16]} className="job-statistics">
                <Col span={6}>
                  <Card className="stat-card stat-card-total">
                    <div className="stat-content">
                      <div className="stat-info">
                        <div className="stat-title">工作</div>
                        <div className="stat-value">{totalCount}</div>
                        <div className="stat-desc">总工作数</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="stat-card stat-card-pending">
                    <div className="stat-content">
                      <div className="stat-info">
                        <div className="stat-title">待处理</div>
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-desc">等待执行</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="stat-card stat-card-running">
                    <div className="stat-content">
                      <div className="stat-info">
                        <div className="stat-title">执行中</div>
                        <div className="stat-value">{runningCount}</div>
                        <div className="stat-desc">正在执行</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="stat-card stat-card-completed">
                    <div className="stat-content">
                      <div className="stat-info">
                        <div className="stat-title">已完成</div>
                        <div className="stat-value">{completedCount}</div>
                        <div className="stat-desc">执行完成</div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>

            {/* 工作列表区域 */}
            <Card className="job-list-card">
              <div className="job-list-search">
                <Form>
                  <Form.Item style={{marginBottom: 0}}>
                    <Input
                        placeholder="搜索工作"
                        prefix={<Icon name="search" size={16}/>}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{minWidth: 360}}
                        allowClear
                    />
                  </Form.Item>
                </Form>
              </div>
              {filteredList.length > 0 ? (
                  <Table
                      data={filteredList}
                      height={400}
                      rowHeight={72}
                      pagination={false}
                      showEmpty
                      emptyText="暂无工作"
                      onItemClick={(record: JobResponse) => openEditPanel(record)}
                      columns={[
                        {
                          title: '工作',
                          dataIndex: 'title',
                          width: 320,
                          render: (_: any, record: JobResponse) => (
                              <div className="job-list-plan-cell">
                                <div className="job-list-plan-title">{record.title || '未命名'}</div>
                                <div className="job-list-plan-desc">{record.description || '-'}</div>
                              </div>
                          ),
                        },
                        {
                          title: '附件',
                          dataIndex: 'attachmentCount',
                          width: 56,
                          align: 'center',
                          render: (count: number) => (
                              <div className="job-list-attach-cell">
                        <span className="job-list-attach-count">
                          {count != null && count > 0 ? count : '-'}
                        </span>
                              </div>
                          ),
                        },
                        {
                          title: '创建时间',
                          dataIndex: 'createTime',
                          width: 80,
                          render: (time: string) => formatTime(time),
                        },
                        {
                          title: '操作',
                          width: 30,
                          render: (_: any, record: JobResponse) => {
                            // 执行策略：仅当该工作已有正在运行的 Session 时禁用「运行」（后端状态码 R）
                            const isRunning = (runningContexts ?? []).some(
                                (ctx) => ctx.jobId === record.id && (ctx.status as ExecutionStatusCode | undefined) === 'R'
                            );
                            return (
                                <div
                                    className="job-action-cell"
                                    style={{display: 'flex', alignItems: 'center'}}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                  <TableRowMenu
                                      items={[
                                        {
                                          key: 'run',
                                          label: '运行',
                                          onClick: () => handleOpenRunDialog(record),
                                          disabled: isRunning
                                        },
                                        {key: 'logs', label: '查看日志', onClick: () => handleViewLogs(record)},
                                        {key: 'edit', label: '编辑', onClick: () => openEditPanel(record)},
                                        {
                                          key: 'delete',
                                          label: '删除',
                                          onClick: () => handleDelete(record),
                                          danger: true
                                        },
                                      ]}
                                      data={record}
                                  />
                                </div>
                            );
                          },
                        },
                      ]}
                  />
              ) : (
                  <Empty
                      description={searchKeyword ? '没有找到匹配的工作' : '暂无工作'}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
              )}
            </Card>
          </div>

          {/* 右侧快捷操作区 */}
          <div className="job-sidebar">
            <Card className="quick-actions-card">
              <div className="quick-actions-list">
                <div className="quick-action-item" onClick={openCreatePanel}>
                  <div className="quick-action-icon">
                    <Icon name="plus" size={20}/>
                  </div>
                  <div className="quick-action-content">
                    <div className="quick-action-title">新建工作</div>
                    <div className="quick-action-desc">在侧边栏中创建工作</div>
                  </div>
                </div>
                <div className="quick-action-item" onClick={handleImportPlan}>
                  <div className="quick-action-icon">
                    <Icon name="import" size={20}/>
                  </div>
                  <div className="quick-action-content">
                    <div className="quick-action-title">导入工作</div>
                    <div className="quick-action-desc">从文件导入工作</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 运行中的 JobSession 列表：始终展示该区域，无数据时显示空状态 */}
            <Card className="running-status-card">
              <div className="running-status-header">
                <span className="running-status-title">运行中</span>
                {activeRunningContexts.length > 0 ? (
                    <span className="running-status-count">{activeRunningContexts.length}</span>
                ) : null}
              </div>
              {activeRunningContexts.length === 0 ? (
                  <div className="running-status-empty">暂无运行中或暂停的工作</div>
              ) : (
                  <div className="running-status-list">
                    {activeRunningContexts.map((ctx) => (
                        <div
                            key={ctx.jobId}
                            className="running-status-item"
                            onClick={() => handleOpenLogPanel(ctx)}
                        >
                          <div className="running-status-item-row running-status-item-row--title">
                            <span className="running-status-item-title">{ctx.jobTitle || '未命名'}</span>
                            <span
                                className="running-status-item-badge"
                                data-status={(ctx.status as ExecutionStatusCode | undefined) === 'R' ? 'RUNNING' : (ctx.status as ExecutionStatusCode | undefined) === 'S' ? 'PAUSED' : (ctx.status as string) || 'RUNNING'}
                            >
                        {EXECUTION_STATUS_CODE_MAP[ctx.status ?? ''] || EXECUTION_STATUS_MAP[ctx.status as any] || ctx.status}
                      </span>
                          </div>
                          <div className="running-status-item-row running-status-item-row--phase">
                      <span className="running-status-item-phase">
                        {ctx.currentStep ? SESSION_PHASE_MAP[ctx.currentStep] || ctx.currentStep : '启动中'}
                      </span>
                            {ctx.statusMessage && (
                                <span className="running-status-item-message">{ctx.statusMessage}</span>
                            )}
                          </div>
                          <div className="running-status-item-row running-status-item-row--meta">
                      <span className="running-status-item-meta">
                        启动时间：{ctx.startTime
                          ? new Date(ctx.startTime).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                          : '-'}
                      </span>
                          </div>
                          <div className="running-status-item-row running-status-item-row--actions">
                            <Button
                                type="primary"
                                danger
                                size="small"
                                className="running-status-item-stop"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelRunning(ctx, e);
                                }}
                            >
                              停止
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </Card>

            {/* 失败工作提示 */}
            {failedCount > 0 && (
                <Card className="failed-notice-card">
                  <div className="failed-notice-content">
                    <div className="failed-notice-icon">
                      <Icon name="warning" size={24}/>
                    </div>
                    <div className="failed-notice-text">
                      <div className="failed-notice-title">有 {failedCount} 项工作执行失败</div>
                      <div className="failed-notice-desc">请检查工作日志了解详情</div>
                    </div>
                  </div>
                </Card>
            )}
          </div>
        </div>

        {/* 新建/编辑工作侧边栏：仅标题与工作内容 */}
        <SlidePanel
            open={showSlidePanel}
            title={panelMode === 'create' ? '新建工作' : '编辑工作'}
            type="large"
            placement="right"
            hasCloseButton
            closable
            confirmButtonText={panelMode === 'create' ? '创建' : '保存'}
            closeButtonText="取消"
            onConfirm={handlePanelConfirm}
            onClose={handleCloseSlidePanel}
        >
          <Form form={jobForm} layout="vertical" style={{padding: '0 4px'}}>
            <Form.Item
                name="title"
                label="标题"
                rules={[{required: true, message: '请输入标题'}]}
            >
              <Input placeholder="请输入标题" maxLength={200}/>
            </Form.Item>
            <Form.Item name="description" label="工作内容">
              <CodeEditorFormField
                  width="100%"
                  height={Math.max(200, (frameSize?.height ?? 600) - 420)}
                  language="markdown"
                  border
                  showMap={false}
                  wordWrap="on"
              />
            </Form.Item>
            <Form.Item>
              <div className="job-attach-upload">
                <Upload.Dragger
                    multiple
                    showUploadList={false}
                    beforeUpload={(file: RcFile) => {
                      if (panelMode === 'edit' && currentJob?.id) {
                        uploadPlanFiles([file], currentJob.id).then((ok) => {
                          if (ok) loadPlanFiles();
                        });
                      } else {
                        setPendingFiles((prev) => [...prev, file]);
                      }
                      return false;
                    }}
                >
                  <div className="job-attach-upload-content">
                    <div className="job-attach-icon">
                      <Icon name="upload" size={20}/>
                    </div>
                    <div className="job-attach-text">
                      <div className="job-attach-main">点击或拖拽文件到此处上传</div>
                    </div>
                  </div>
                </Upload.Dragger>
              </div>
              {fileListLoading && (
                  <div style={{marginTop: 8, color: '#999', fontSize: 13}}>
                    <Icon name="loading" size={14}/> 加载附件列表...
                  </div>
              )}
              {(pendingFiles.length > 0 || uploadedFiles.length > 0) && !fileListLoading && (
                  <div className="job-attach-list">
                    {pendingFiles.length > 0 && (
                        <>
                          <div className="job-attach-list-title">待上传</div>
                          <div className="job-attach-list-body">
                            {pendingFiles.map((f, i) => (
                                <div key={`p-${i}`} className="job-attach-item job-attach-item-pending">
                                  <Icon name="file" size={16} className="job-attach-item-icon"/>
                                  <span className="job-attach-item-name">{f.name}</span>
                                  <span
                                      className="job-attach-item-remove"
                                      onClick={() =>
                                          setPendingFiles((prev) => prev.filter((_, j) => j !== i))
                                      }
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === 'Enter' && setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                                  >
                            <Icon name="delete" size={14}/>
                          </span>
                                </div>
                            ))}
                          </div>
                        </>
                    )}
                    {uploadedFiles.length > 0 && (
                        <>
                          <div className="job-attach-list-title">已上传</div>
                          <div className="job-attach-list-body">
                            {uploadedFiles.map((f) => (
                                <div key={f.id} className="job-attach-item">
                                  <Icon name="document" size={16} className="job-attach-item-icon"/>
                                  <span className="job-attach-item-name">
                            <a href={f.blobUrl} target="_blank" rel="noopener noreferrer">
                              {f.filename}
                            </a>
                          </span>
                                  <span
                                      className="job-attach-item-remove"
                                      onClick={() => deletePlanFile(f.id)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === 'Enter' && deletePlanFile(f.id)}
                                  >
                            <Icon name="delete" size={14}/>
                          </span>
                                </div>
                            ))}
                          </div>
                        </>
                    )}
                  </div>
              )}
              {uploading && (
                  <div style={{marginTop: 8, color: '#1890ff', fontSize: 13}}>
                    上传中...
                  </div>
              )}
            </Form.Item>
          </Form>
        </SlidePanel>

        {/* 执行日志侧边栏：点击运行中任务时展示 */}
        <SlidePanel
            open={logPanelOpen}
            title={`执行日志 - ${selectedRunningContext?.jobTitle || ''}`}
            type="large"
            placement="right"
            hasCloseButton
            closable
            closeButtonText="关闭"
            onClose={handleCloseLogPanel}
        >
          <div className="job-log-panel">
            {logPanelLoading ? (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                  <Icon name="loading" size={24}/>
                </div>
            ) : logPanelLogs.length === 0 ? (
                <div className="job-log-empty">
                  <Empty description="暂无日志记录" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            ) : (
                <div className="job-log-list">
                  {logPanelLogs.map((log) => (
                      <div key={log.id} className="job-log-item">
                  <span className={`job-log-level ${getLogLevelClass(log.level)}`}>
                    {log.level || 'INFO'}
                  </span>
                        <span className="job-log-text">{log.content}</span>
                        <span className="job-log-time">{formatTime(log.createTime)}</span>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </SlidePanel>

        {/* 日志查看弹窗 */}
        <Modal
            title={`工作日志 - ${currentJob?.title || ''}`}
            open={logModalOpen}
            onCancel={() => {
              setLogModalOpen(false);
              setCurrentJob(null);
              setCurrentLogs([]);
            }}
            footer={null}
            width={700}
        >
          <div className="job-log-panel">
            {logsLoading ? (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                  <Icon name="loading" size={24}/>
                </div>
            ) : currentLogs.length === 0 ? (
                <div className="job-log-empty">
                  <Empty description="暂无日志记录" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            ) : (
                <div className="job-log-list">
                  {currentLogs.map((log) => (
                      <div key={log.id} className="job-log-item">
                  <span className={`job-log-level ${getLogLevelClass(log.level)}`}>
                    {log.level || 'INFO'}
                  </span>
                        <span className="job-log-text">{log.content}</span>
                        <span className="job-log-time">{formatTime(log.createTime)}</span>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </Modal>
      </div>
  );
};

export default connect(({studio}: any) => ({
  jobList: studio.jobList,
  loading: studio.loading,
  runningContexts: studio.runningContexts ?? [],
}))(JobsOverview);
